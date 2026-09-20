import { apiFetch, USER_SERVICE_URL } from "./api-client";

export function getCurrentUser() {
  return apiFetch(
    USER_SERVICE_URL,
    "/api/users/me"
  );
}