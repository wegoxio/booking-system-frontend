let inMemoryAccessToken: string | null = null;
const tokenListeners = new Set<(token: string | null) => void>();
const CSRF_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_CSRF_COOKIE_NAME ?? "weegox_csrf";

function notifyTokenChange(nextToken: string | null): void {
  tokenListeners.forEach((listener) => listener(nextToken));
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
  notifyTokenChange(inMemoryAccessToken);
}

export function clearSessionTokens(): void {
  inMemoryAccessToken = null;
  notifyTokenChange(null);
}

export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const cookie of cookies) {
    const [rawName, ...rawValueParts] = cookie.trim().split("=");
    if (rawName !== CSRF_COOKIE_NAME) continue;
    const rawValue = rawValueParts.join("=");
    const decoded = decodeURIComponent(rawValue).trim();
    if (!decoded) return null;
    return decoded;
  }

  return null;
}

export function onAccessTokenChange(
  listener: (token: string | null) => void,
): () => void {
  tokenListeners.add(listener);
  return () => {
    tokenListeners.delete(listener);
  };
}
