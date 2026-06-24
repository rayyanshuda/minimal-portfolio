import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { SPOTIFY_PROFILE_URL, spotifyProfileUrlForUser } from "@/app/lib/spotify-constants";

/** Vercel / serverless: allow enough time for cold start + several Spotify round trips. */
export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const revalidate = 0;

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1";
const PROFILE_ENDPOINT = "https://api.spotify.com/v1/me";

let cachedAccessToken: { token: string; expiresAtMs: number } | null = null;
let refreshInFlight: Promise<string> | null = null;

let cachedPayload: { data: SpotifyTrackPayload; fetchedAtMs: number } | null = null;
let lastGoodPayload: SpotifyTrackPayload | null = null;
let rateLimitedUntilMs = 0;

type ProfileData = Pick<
  SpotifyTrackPayload,
  "profileName" | "profileUsername" | "profileImageUrl" | "profileUrl"
>;

let cachedProfile: { data: ProfileData; expiresAtMs: number } | null = null;

const RESPONSE_TTL_MS = 60_000;
const NOW_PLAYING_CHECK_MS = 30_000;
const IDLE_TRACK_TTL_MS = 600_000;
const PROFILE_TTL_MS = 3_600_000;
const RATE_LIMIT_BACKOFF_MS = 180_000;
const CACHE_HEADERS = { "Cache-Control": "private, no-cache, no-store, must-revalidate" };

let spotifyFetchInFlight: Promise<SpotifyTrackPayload> | null = null;

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

type SpotifyGetResult = {
  status: number;
  json: unknown;
};

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
      "X-Spotify-Req": randomUUID(),
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

async function spotifyGet(
  url: string,
  accessToken: string,
  attempt = 0,
  maxRetries = 1,
): Promise<SpotifyGetResult> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Spotify-Req": randomUUID(),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  const status = response.status;
  let json: unknown = null;
  if (status !== 204) {
    try {
      json = await response.json();
    } catch {
      json = null;
    }
  }

  if (status === 401 && attempt < 1) {
    cachedAccessToken = null;
    const nextToken = await getAccessToken();
    return spotifyGet(url, nextToken, attempt + 1, maxRetries);
  }

  if ((status === 429 || status >= 500) && attempt < maxRetries) {
    const retryAfter = Number(response.headers.get("retry-after"));
    const delayMs =
      Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 2000)
        : 500;
    await sleep(delayMs);
    return spotifyGet(url, accessToken, attempt + 1, maxRetries);
  }

  return { status, json };
}

function responseCacheTtlMs(payload: SpotifyTrackPayload) {
  return payload.isPlaying ? RESPONSE_TTL_MS : NOW_PLAYING_CHECK_MS;
}

function rememberPayload(payload: SpotifyTrackPayload) {
  lastGoodPayload = payload;
  cachedPayload = { data: payload, fetchedAtMs: Date.now() };
}

function isRateLimited() {
  return Date.now() < rateLimitedUntilMs;
}

function markRateLimited() {
  rateLimitedUntilMs = Date.now() + RATE_LIMIT_BACKOFF_MS;
}

function trackFallback(profile: ProfileData, forceIdle = false): SpotifyTrackPayload | null {
  const source = cachedPayload?.data ?? lastGoodPayload;
  if (!source?.title) return null;
  return { ...source, isPlaying: forceIdle ? false : source.isPlaying, ...profile };
}

async function getProfile(accessToken: string): Promise<ProfileData> {
  const now = Date.now();
  if (cachedProfile && now < cachedProfile.expiresAtMs) {
    return cachedProfile.data;
  }

  const { status, json } = await spotifyGet(PROFILE_ENDPOINT, accessToken);

  if (status < 200 || status >= 300) {
    return {
      profileName: "",
      profileUsername: "",
      profileImageUrl: "",
      profileUrl: SPOTIFY_PROFILE_URL,
    };
  }

  const profileJson = json as {
    display_name?: string;
    id?: string;
    images?: Array<{ url?: string }>;
    external_urls?: { spotify?: string };
  };

  const userId = profileJson.id ?? "";
  const profileUrl =
    profileJson.external_urls?.spotify ?? (userId ? spotifyProfileUrlForUser(userId) : SPOTIFY_PROFILE_URL);

  const profile: ProfileData = {
    profileName: profileJson.display_name ?? "",
    profileUsername: userId,
    profileImageUrl: profileJson.images?.[0]?.url ?? "",
    profileUrl,
  };

  cachedProfile = { data: profile, expiresAtMs: Date.now() + PROFILE_TTL_MS };
  return profile;
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

function parseRecentlyPlayedResult({ status, json }: SpotifyGetResult): SpotifyTrackCore | null {
  if (status < 200 || status >= 300) return null;

  const recentlyPlayedJson = json as {
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
  if (!recentTrack) return null;

  return mapTrack(recentTrack);
}

function jsonOk(payload: SpotifyTrackPayload) {
  return NextResponse.json<SpotifyTrackPayload>(payload, { headers: CACHE_HEADERS });
}

async function fetchSpotifyPayload(): Promise<SpotifyTrackPayload> {
  const accessToken = await getAccessToken();
  const profile = await getProfile(accessToken);
  const nowPlaying = await spotifyGet(NOW_PLAYING_ENDPOINT, accessToken, 0, 0);

  if (nowPlaying.status === 429) {
    markRateLimited();
    const stale = trackFallback(profile);
    if (stale) return stale;
    throw new Error("Spotify rate limited.");
  }

  if (nowPlaying.status === 200) {
    const nowPlayingJson = nowPlaying.json as {
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
      return {
        ...track,
        isPlaying: Boolean(nowPlayingJson.is_playing),
        ...profile,
      };
    }
  }

  const cachedTrack = cachedPayload?.data ?? lastGoodPayload;
  const trackAge = cachedPayload ? Date.now() - cachedPayload.fetchedAtMs : Infinity;
  if (cachedTrack?.title && trackAge < IDLE_TRACK_TTL_MS) {
    return { ...cachedTrack, isPlaying: false, ...profile };
  }

  const knownIdle = trackFallback(profile, true);
  if (knownIdle && isRateLimited()) {
    return knownIdle;
  }

  const recentResult = await spotifyGet(RECENTLY_PLAYED_ENDPOINT, accessToken, 0, 0);
  if (recentResult.status === 429) {
    markRateLimited();
    if (knownIdle) return knownIdle;
    throw new Error("Spotify rate limited.");
  }

  const mappedRecentTrack = parseRecentlyPlayedResult(recentResult);
  if (mappedRecentTrack) {
    return {
      ...mappedRecentTrack,
      isPlaying: false,
      ...profile,
    };
  }

  if (knownIdle) return knownIdle;

  throw new Error(`Failed to read recently played tracks (Spotify ${recentResult.status}).`);
}

export async function GET() {
  const now = Date.now();
  if (cachedPayload && now - cachedPayload.fetchedAtMs < responseCacheTtlMs(cachedPayload.data)) {
    return jsonOk(cachedPayload.data);
  }

  if (!spotifyFetchInFlight) {
    spotifyFetchInFlight = fetchSpotifyPayload()
      .then((payload) => {
        rememberPayload(payload);
        return payload;
      })
      .finally(() => {
        spotifyFetchInFlight = null;
      });
  }

  try {
    const payload = await spotifyFetchInFlight;
    return jsonOk(payload);
  } catch {
    if (lastGoodPayload) {
      const stale = { ...lastGoodPayload, isPlaying: false };
      cachedPayload = { data: stale, fetchedAtMs: Date.now() };
      return jsonOk(stale);
    }

    return NextResponse.json(
      { message: "Spotify widget unavailable." },
      { status: 503, headers: { "Retry-After": "120", ...CACHE_HEADERS } },
    );
  }
}
