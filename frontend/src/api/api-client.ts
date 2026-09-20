import keycloak from "../keycloak";

const API_BASE_URL = "http://localhost:8081";

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  if (!keycloak.token) {
    throw new Error("User is not authenticated");
  }

  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${keycloak.token}`);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}