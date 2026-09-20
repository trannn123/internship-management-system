import keycloak from "../keycloak";

export const USER_SERVICE_URL = "http://localhost:8081";
export const INTERNSHIP_SERVICE_URL = "http://localhost:8082";
export const EVALUATION_SERVICE_URL = "http://localhost:8083";

async function buildErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const errorBody = (await response.json()) as {
        message?: string;
        error?: string;
      };

      return (
        errorBody.message ??
        errorBody.error ??
        `API error: ${response.status}`
      );
    }

    const text = await response.text();
    return text || `API error: ${response.status}`;
  } catch {
    return `API error: ${response.status}`;
  }
}

export async function apiFetch<T>(
  baseUrl: string,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!keycloak.token) {
    throw new Error("User is not authenticated");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${keycloak.token}`);

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await buildErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength === "0") {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}