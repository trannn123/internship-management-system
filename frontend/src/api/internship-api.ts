import {
  apiFetch,
  INTERNSHIP_SERVICE_URL,
} from "./api-client";

export function getMyInternships() {
  return apiFetch(
    INTERNSHIP_SERVICE_URL,
    "/api/internships"
  );
}

export function getInternshipById(id: number) {
  return apiFetch(
    INTERNSHIP_SERVICE_URL,
    `/api/internships/${id}`
  );
}