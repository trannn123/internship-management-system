import type {
  AssignLecturerRequest,
  InternshipPeriod,
  InternshipPeriodLecturer,
  InternshipPeriodRequest,
} from "../types";
import { apiFetch, INTERNSHIP_SERVICE_URL } from "./api-client";

export function getInternshipPeriods() {
  return apiFetch<InternshipPeriod[]>(
    INTERNSHIP_SERVICE_URL,
    "/api/internship-periods",
  );
}

export async function getAssignedInternshipPeriodsForLecturer(
  lecturerId: number,
) {
  const periods = await getInternshipPeriods();
  const assignments = await Promise.all(
    periods.map(async (period) => ({
      period,
      lecturers: await getAssignedLecturers(period.id),
    })),
  );

  return assignments
    .filter(({ lecturers }) =>
      lecturers.some((assignment) => assignment.lecturerId === lecturerId),
    )
    .map(({ period }) => period);
}

export function getInternshipPeriodById(id: number) {
  return apiFetch<InternshipPeriod>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-periods/${id}`,
  );
}

export function createInternshipPeriod(data: InternshipPeriodRequest) {
  return apiFetch<InternshipPeriod>(
    INTERNSHIP_SERVICE_URL,
    "/api/internship-periods",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function updateInternshipPeriod(
  id: number,
  data: InternshipPeriodRequest,
) {
  return apiFetch<InternshipPeriod>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-periods/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export function deleteInternshipPeriod(id: number) {
  return apiFetch<void>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-periods/${id}`,
    {
      method: "DELETE",
    },
  );
}

export function getAssignedLecturers(periodId: number) {
  return apiFetch<InternshipPeriodLecturer[]>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-periods/${periodId}/lecturers`,
  );
}

export function assignLecturerToPeriod(
  periodId: number,
  data: AssignLecturerRequest,
) {
  return apiFetch<InternshipPeriodLecturer>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-periods/${periodId}/lecturers`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function removeLecturerFromPeriod(
  periodId: number,
  lecturerId: number,
) {
  return apiFetch<void>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-periods/${periodId}/lecturers/${lecturerId}`,
    {
      method: "DELETE",
    },
  );
}
