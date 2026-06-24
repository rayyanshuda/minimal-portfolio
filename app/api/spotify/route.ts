import { NextResponse } from "next/server";
import { SPOTIFY_PROFILE_URL, spotifyProfileUrlForUser } from "@/app/lib/spotify-constants";

/** Vercel / serverless: allow enough time for cold start + several Spotify round trips. */
export const maxDuration = 60;

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1";
const PROFILE_ENDPOINT = "https://api.spotify.com/v1/me";

/** Reuse access tokens across requests (tokens last ~1h; refresh only when near expiry). */
let cachedAccessToken: { token: string; expiresAtMs: number } | null = null;
let refreshInFlight: Promise<string> | null = null;

type SpotifyTrackPayload = {
  isPlaying: boolean;
  title: string;
  artist: string;
  songUrl: string;
  albumImageUrl: string;
  profileName: string;
  profileUsername: string;
  profileImageUrl: string;
  profileUrl: string;
};

type SpotifyTrackCore = Pick<SpotifyTrackPayload, "title" | "artist" | "songUrl" | "albumImageUrl">;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function refreshAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Spotify credentials in environment variables.");
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    cachedAccessToken = null;
    throw new Error("Failed to refresh Spotify access token.");
  }

  const json = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) {
    cachedAccessToken = null;
    throw new Error("Spotify access token missing in response.");
  }

  const ttlSec = json.expires_in ?? 3600;
  const refreshMarginMs = 60_000;
  const issuedAt = Date.now();
  cachedAccessToken = {
    token: json.access_token,
    expiresAtMs: issuedAt + ttlSec * 1000 - refreshMarginMs,
  };

  return json.access_token;
}

async function getAccessToken() {
  const now = Date.now();
  if (cachedAccessToken && now < cachedAccessToken.expiresAtMs) {
    return cachedAccessToken.token;
  }

  cachedAccessToken = null;

  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

async function spotifyGet(url: string, accessToken: string, attempt = 0): Promise<Response> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (response.status === 401 && attempt < 1) {
    cachedAccessToken = null;
    const nextToken = await getAccessToken();
    return spotifyGet(url, nextToken, attempt + 1);
  }

  if ((response.status === 429 || response.status >= 500) && attempt < 1) {
    const retryAfter = Number(response.headers.get("retry-after"));
    const delayMs = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 2000) : 500;
    await sleep(delayMs);
    return spotifyGet(url, accessToken, attempt + 1);
  }

  return response;
}

async function getProfile(accessToken: string) {
  const response = await spotifyGet(PROFILE_ENDPOINT, accessToken);

  if (!response.ok) {
    return {
      profileName: "",
      profileUsername: "",
      profileImageUrl: "",
      profileUrl: SPOTIFY_PROFILE_URL,
    };
  }

  const json = (await response.json()) as {
    display_name?: string;
    id?: string;
    images?: Array<{ url?: string }>;
    external_urls?: { spotify?: string };
  };

  const userId = json.id ?? "";
  const profileUrl =
    json.external_urls?.spotify ?? (userId ? spotifyProfileUrlForUser(userId) : SPOTIFY_PROFILE_URL);

  return {
    profileName: json.display_name ?? "",
    profileUsername: userId,
    profileImageUrl: json.images?.[0]?.url ?? "",
    profileUrl,
  };
}

function mapTrack(item: {
  name?: string;
  artists?: Array<{ name?: string }>;
  external_urls?: { spotify?: string };
  album?: { images?: Array<{ url?: string }> };
}): SpotifyTrackCore {
  return {
    title: item.name ?? "Unknown track",
    artist: (item.artists ?? []).map((a) => a.name).filter(Boolean).join(", ") || "Unknown artist",
    songUrl: item.external_urls?.spotify ?? "#",
    albumImageUrl: item.album?.images?.[0]?.url ?? "",
  };
}

async function getRecentlyPlayedTrack(accessToken: string): Promise<SpotifyTrackCore> {
  const recentlyPlayedResponse = await spotifyGet(RECENTLY_PLAYED_ENDPOINT, accessToken);

  if (!recentlyPlayedResponse.ok) {
    throw new Error(`Failed to read recently played tracks (Spotify ${recentlyPlayedResponse.status}).`);
  }

  const recentlyPlayedJson = (await recentlyPlayedResponse.json()) as {
    items?: Array<{
      track?: {
        name?: string;
        artists?: Array<{ name?: string }>;
        external_urls?: { spotify?: string };
        album?: { images?: Array<{ url?: string }> };
      };
    }>;
  };

  const recentTrack = recentlyPlayedJson.items?.[0]?.track;
  if (!recentTrack) {
    throw new Error("No recently played track found.");
  }

  return mapTrack(recentTrack);
}

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    const [profile, nowPlayingResponse] = await Promise.all([
      getProfile(accessToken),
      spotifyGet(NOW_PLAYING_ENDPOINT, accessToken),
    ]);

    // 200 = playing or paused on an active device; 204 = nothing active (fall back to recently played).
    if (nowPlayingResponse.status === 200) {
      const nowPlayingJson = (await nowPlayingResponse.json()) as {
        is_playing?: boolean;
        item?: {
          name?: string;
          artists?: Array<{ name?: string }>;
          external_urls?: { spotify?: string };
          album?: { images?: Array<{ url?: string }> };
        };
      };

      if (nowPlayingJson.item) {
        const track = mapTrack(nowPlayingJson.item);
        return NextResponse.json<SpotifyTrackPayload>({
          ...track,
          isPlaying: Boolean(nowPlayingJson.is_playing),
          ...profile,
        });
      }
    }

    const mappedRecentTrack = await getRecentlyPlayedTrack(accessToken);
    return NextResponse.json<SpotifyTrackPayload>({
      ...mappedRecentTrack,
      isPlaying: false,
      ...profile,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Spotify API error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
