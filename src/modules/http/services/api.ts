import {
  clearSessionTokens,
  getAccessToken,
  getCsrfTokenFromCookie,
  setAccessToken,
} from "@/modules/auth/services/auth-session.service";
import type { RefreshResponse } from "@/types/auth.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("Falta NEXT_PUBLIC_API_URL en las variables de entorno");
}

type RequestOptions = RequestInit & {
  token?: string;
  skipAuthRefresh?: boolean;
};

let refreshInFlight: Promise<string | null> | null = null;

function buildHeaders(
  headers: HeadersInit | undefined,
  token: string | null,
  csrfToken: string | null,
  isFormData: boolean,
): HeadersInit {
  return {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    ...headers,
  };
}

function shouldTryRefresh(endpoint: string): boolean {
  const normalized = endpoint.toLowerCase();
  return !normalized.startsWith("/auth/login") && !normalized.startsWith("/auth/refresh");
}

async function requestFreshTokens(): Promise<string | null> {
  const csrfToken = getCsrfTokenFromCookie();

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: csrfToken ? { "X-CSRF-Token": csrfToken } : undefined,
  });

  if (!response.ok) {
    clearSessionTokens();
    return null;
  }

  const data = (await response.json()) as RefreshResponse;
  if (!data?.access_token) {
    clearSessionTokens();
    return null;
  }

  setAccessToken(data.access_token);
  return data.access_token;
}

export async function refreshAccessTokenWithStoredRefreshToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = requestFreshTokens().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

async function parseErrorMessage(response: Response): Promise<string> {
  const errorData = await response.json().catch(() => null);
  const message = Array.isArray(errorData?.message)
    ? errorData.message.join(", ")
    : errorData?.message;

  return message || `Error ${response.status}: ${response.statusText}`;
}

export async function apiFetch<t>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<t> {
  const { token, headers, skipAuthRefresh, ...restOptions } = options;
  const isFormData =
    typeof FormData !== "undefined" && restOptions.body instanceof FormData;

  const executeRequest = async (resolvedToken: string | null): Promise<Response> => {
    const csrfToken = getCsrfTokenFromCookie();

    return fetch(`${API_URL}${endpoint}`, {
      ...restOptions,
      credentials: restOptions.credentials ?? "include",
      headers: buildHeaders(headers, resolvedToken, csrfToken, isFormData),
    });
  };

  const initialToken = token ?? getAccessToken();
  let response = await executeRequest(initialToken);

  const canRetryWithRefresh =
    response.status === 401 &&
    !skipAuthRefresh &&
    shouldTryRefresh(endpoint);

  if (canRetryWithRefresh) {
    const refreshedAccessToken = await refreshAccessTokenWithStoredRefreshToken();
    if (refreshedAccessToken) {
      response = await executeRequest(refreshedAccessToken);
    }
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as t;
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text() as t;
}
