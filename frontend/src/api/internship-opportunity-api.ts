import type {
  InternshipOpportunity,
  InternshipOpportunityRequest,
} from "../types";
import { apiFetch, INTERNSHIP_SERVICE_URL } from "./api-client";

export function getInternshipOpportunities() {
  return apiFetch<InternshipOpportunity[]>(
    INTERNSHIP_SERVICE_URL,
    "/api/internship-opportunities",
  );
}

export function getInternshipOpportunityById(id: number) {
  return apiFetch<InternshipOpportunity>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-opportunities/${id}`,
  );
}

export function createInternshipOpportunity(
  data: InternshipOpportunityRequest,
) {
  return apiFetch<InternshipOpportunity>(
    INTERNSHIP_SERVICE_URL,
    "/api/internship-opportunities",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function updateInternshipOpportunity(
  id: number,
  data: InternshipOpportunityRequest,
) {
  return apiFetch<InternshipOpportunity>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-opportunities/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}
