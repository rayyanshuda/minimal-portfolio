import { NextResponse } from "next/server";

/** Vercel / serverless: allow enough time for cold start + several Spotify round trips. */
export const maxDuration = 60;

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1";
const PROFILE_ENDPOINT = "https://api.spotify.com/v1/me";

/** Reuse access tokens across requests (tokens last ~1h; refresh only when near expiry). */
let cachedAccessToken: { token: string; expiresAtMs: number } | null = null;

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

async function getAccessToken() {
  const now = Date.now();
  if (cachedAccessToken && now < cachedAccessToken.expiresAtMs) {
    return cachedAccessToken.token;
  }

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
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Spotify access token.");
  }

  const json = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) {
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

async function getProfile(accessToken: string) {
  const response = await fetch(PROFILE_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      profileName: "",
      profileUsername: "",
      profileImageUrl: "",
      profileUrl: "",
    };
  }

  const json = (await response.json()) as {
    display_name?: string;
    id?: string;
    images?: Array<{ url?: string }>;
    external_urls?: { spotify?: string };
  };

  return {
    profileName: json.display_name ?? "",
    profileUsername: json.id ?? "",
    profileImageUrl: json.images?.[0]?.url ?? "",
    profileUrl: json.external_urls?.spotify ?? "",
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

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    const [profile, nowPlayingResponse] = await Promise.all([
      getProfile(accessToken),
      fetch(NOW_PLAYING_ENDPOINT, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      }),
    ]);

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

    const recentlyPlayedResponse = await fetch(RECENTLY_PLAYED_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!recentlyPlayedResponse.ok) {
      throw new Error("Failed to read recently played tracks.");
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
      return NextResponse.json(
        { message: "No currently playing or recently played track found." },
        { status: 404 }
      );
    }

    const mappedRecentTrack = mapTrack(recentTrack);
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
