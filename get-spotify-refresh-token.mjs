// get-spotify-refresh-token.mjs
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || "http://127.0.0.1:8888/callback";

const SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-read-private",
].join(" ");

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in env.");
  process.exit(1);
}

const authUrl = new URL("https://accounts.spotify.com/authorize");
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("scope", SCOPES);

console.log("\n1) Open this URL in your browser and authorize:\n");
console.log(authUrl.toString());
console.log("\n2) After approval, you’ll be redirected to your REDIRECT_URI.");
console.log("   Copy the FULL redirected URL and paste it below.\n");

const rl = readline.createInterface({ input, output });
const redirected = await rl.question("Paste redirected URL: ");
rl.close();

let code;
try {
  code = new URL(redirected.trim()).searchParams.get("code");
} catch {
  console.error("That was not a valid URL.");
  process.exit(1);
}

if (!code) {
  console.error("No `code` found in URL.");
  process.exit(1);
}

const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
  method: "POST",
  headers: {
    Authorization: `Basic ${basic}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  }),
});

const tokenJson = await tokenRes.json();

if (!tokenRes.ok) {
  console.error("Token exchange failed:", tokenJson);
  process.exit(1);
}

console.log("\nSuccess.\n");
console.log("refresh_token:", tokenJson.refresh_token || "(not returned)");
console.log("access_token:", tokenJson.access_token);
console.log("expires_in:", tokenJson.expires_in);
console.log("\nSave refresh_token in .env.local as SPOTIFY_REFRESH_TOKEN");