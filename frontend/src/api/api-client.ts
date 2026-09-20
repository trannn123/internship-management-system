import keycloak from "../keycloak";

export const USER_SERVICE_URL = "http://localhost:8081";
export const INTERNSHIP_SERVICE_URL = "http://localhost:8082";
export const EVALUATION_SERVICE_URL = "http://localhost:8083";

export async function apiFetch(
  baseUrl: string,
  path: string,
  options: RequestInit = {}
) {
  if (!keycloak.token) {
    throw new Error("User is not authenticated");
  }

  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${keycloak.token}`);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}