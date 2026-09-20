import { apiFetch, USER_SERVICE_URL } from "./api-client";

export function getCurrentUser() {
  return apiFetch(
    USER_SERVICE_URL,
    "/api/users/me"
  );
}

export function getAllUsers() {
  return apiFetch(
    USER_SERVICE_URL,
    "/api/users"
  );
}

export function updateStudentProfile(data: {
  studentCode: string;
  major: string;
  className: string;
  phone: string;
}) {
  return apiFetch(
    USER_SERVICE_URL,
    "/api/users/me/profile/student",
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}