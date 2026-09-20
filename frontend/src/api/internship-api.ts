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

export function createInternship(data: {
  companyId: number | null;
  lecturerId: number | null;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
}) {
  return apiFetch(
    INTERNSHIP_SERVICE_URL,
    "/api/internships",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}