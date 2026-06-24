"use client";

import { useEffect, useState } from "react";

export type SpotifyWidgetData = {
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

const SESSION_KEY = "rh-spotify-widget";
const POLL_PLAYING_MS = 8_000;
const POLL_IDLE_MS = 60_000;
const FETCH_TIMEOUT_MS = 12_000;

type Snapshot = {
  data: SpotifyWidgetData | null;
  error: string;
};

let cachedData: SpotifyWidgetData | null = null;
let cachedError = "";
let listeners = new Set<() => void>();
let fetchInFlight: Promise<void> | null = null;
let pollingStarted = false;
let pollTimeoutId: number | null = null;

function notify() {
  for (const listener of listeners) listener();
}

function readSession(): SpotifyWidgetData | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SpotifyWidgetData;
    return parsed?.title ? parsed : null;
  } catch {
    return null;
  }
}

function writeSession(data: SpotifyWidgetData) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // ignore quota / private mode
  }
}

function getSnapshot(): Snapshot {
  return { data: cachedData, error: cachedError };
}

function pollDelayMs() {
  return cachedData?.isPlaying ? POLL_PLAYING_MS : POLL_IDLE_MS;
}

function clearPollTimeout() {
  if (pollTimeoutId !== null) {
    window.clearTimeout(pollTimeoutId);
    pollTimeoutId = null;
  }
}

function schedulePoll() {
  clearPollTimeout();
  pollTimeoutId = window.setTimeout(() => {
    pollTimeoutId = null;
    if (document.visibilityState === "visible") {
      void requestLoad(true).finally(schedulePoll);
    } else {
      schedulePoll();
    }
  }, pollDelayMs());
}

export function subscribeSpotify(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

async function loadSpotify(silent: boolean, attempt = 0): Promise<void> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch("/api/spotify", { cache: "no-store", signal: controller.signal });
    if (!res.ok) {
      const errorJson = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(errorJson.message ?? "Failed to load Spotify track.");
    }

    const next = (await res.json()) as SpotifyWidgetData;
    cachedData = next;
    cachedError = "";
    writeSession(next);
    notify();
  } catch (e) {
    const fallback = cachedData ?? readSession();
    if (fallback) {
      cachedData = fallback;
      cachedError = "";
      notify();
      return;
    }

    if (!silent) {
      if (attempt < 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 800));
        return loadSpotify(silent, attempt + 1);
      }

      cachedError =
        e instanceof Error && e.name === "AbortError"
          ? "Spotify widget timed out."
          : e instanceof Error
            ? e.message
            : "Spotify widget unavailable.";
      notify();
    }
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function requestLoad(silent: boolean) {
  if (!fetchInFlight) {
    fetchInFlight = loadSpotify(silent).finally(() => {
      fetchInFlight = null;
    });
  }
  return fetchInFlight;
}

function startPolling() {
  if (pollingStarted) return;
  pollingStarted = true;

  if (!cachedData) cachedData = readSession();
  void requestLoad(Boolean(cachedData));
  schedulePoll();

  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      void requestLoad(true);
      schedulePoll();
    }
  };
  document.addEventListener("visibilitychange", onVisibilityChange);
}

export function useSpotifyWidget(): Snapshot {
  const [snapshot, setSnapshot] = useState<Snapshot>(() => {
    if (typeof window === "undefined") return { data: null, error: "" };
    if (!cachedData) cachedData = readSession();
    return getSnapshot();
  });

  useEffect(() => {
    if (!cachedData) cachedData = readSession();
    setSnapshot(getSnapshot());
    startPolling();
    return subscribeSpotify(() => setSnapshot(getSnapshot()));
  }, []);

  return snapshot;
}
