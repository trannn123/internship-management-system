import type {
  InternshipRegistration,
  InternshipRegistrationRequest,
} from "../types";
import { apiFetch, INTERNSHIP_SERVICE_URL } from "./api-client";

export function getInternshipRegistrations() {
  return apiFetch<InternshipRegistration[]>(
    INTERNSHIP_SERVICE_URL,
    "/api/internship-registrations",
  );
}

export function getInternshipRegistrationById(id: number) {
  return apiFetch<InternshipRegistration>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-registrations/${id}`,
  );
}

export function createInternshipRegistration(
  data: InternshipRegistrationRequest,
) {
  return apiFetch<InternshipRegistration>(
    INTERNSHIP_SERVICE_URL,
    "/api/internship-registrations",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function approveInternshipRegistrationByCompany(id: number) {
  return apiFetch<InternshipRegistration>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-registrations/${id}/company/approve`,
    {
      method: "PUT",
    },
  );
}

export function rejectInternshipRegistrationByCompany(id: number) {
  return apiFetch<InternshipRegistration>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-registrations/${id}/company/reject`,
    {
      method: "PUT",
    },
  );
}

export function approveInternshipRegistrationByLecturer(id: number) {
  return apiFetch<InternshipRegistration>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-registrations/${id}/lecturer/approve`,
    {
      method: "PUT",
    },
  );
}

export function rejectInternshipRegistrationByLecturer(id: number) {
  return apiFetch<InternshipRegistration>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-registrations/${id}/lecturer/reject`,
    {
      method: "PUT",
    },
  );
}

export function completeInternshipRegistration(id: number) {
  return apiFetch<InternshipRegistration>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-registrations/${id}/complete`,
    {
      method: "PUT",
    },
  );
}

export function completeInternshipByCompanyEvaluation(internshipId: number) {
  return apiFetch<InternshipRegistration>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-registrations/complete-company-evaluation/${internshipId}`,
    {
      method: "PUT",
    },
  );
}
