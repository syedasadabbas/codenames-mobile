// Backend endpoints. The mobile app is a thin client over the shared realtime
// backend — the same one the web app uses.
//
// SOCKET_URL: the standalone Socket.IO server (Render). Guest play needs only this.
// WEB_URL:    the web app (Vercel) — used to load Codenames: Pictures card images
//             (served from its /public) and, later, the REST auth endpoints.
//
// Override at runtime with EXPO_PUBLIC_* env vars (e.g. in eas.json or .env).

/** Drop any trailing slash so we never build double-slash URLs (…com//api/...). */
const trim = (u: string) => u.replace(/\/+$/, "");

export const SOCKET_URL = trim(
  process.env.EXPO_PUBLIC_SOCKET_URL || "https://code-names-h3ar.onrender.com",
);

export const WEB_URL = trim(process.env.EXPO_PUBLIC_WEB_URL || "");

/** REST base for accounts (login/register/profile) — the web app on Vercel.
 * Required for accounts, friends, and invites; guest play works without it. */
export const API_URL = WEB_URL;

/** Resolve a server-relative asset path (e.g. a picture card) to an absolute URL. */
export function assetUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return (WEB_URL || SOCKET_URL) + path;
}
