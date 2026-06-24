/** Canonical Spotify profile — used when the API omits external_urls. */
export const SPOTIFY_PROFILE_URL = "https://open.spotify.com/user/izsw8qlxskprh9448ri6e9gmb";

export function spotifyProfileUrlForUser(userId: string) {
  return `https://open.spotify.com/user/${userId}`;
}
