import {
  apiFetch,
  INTERNSHIP_SERVICE_URL,
} from "./api-client";
import type {
  Internship,
  InternshipLog,
  InternshipLogRequest,
  InternshipRequest,
  Task,
  TaskRequest,
  TaskStatusRequest,
  WorkPlan,
  WorkPlanRequest,
} from "../types";

export function getMyInternships() {
  return apiFetch<Internship[]>(
    INTERNSHIP_SERVICE_URL,
    "/api/internships",
  );
}

export function getMyCompanyInternships() {
  return apiFetch<Internship[]>(
    INTERNSHIP_SERVICE_URL,
    "/api/internships/me/company",
  );
}

export function getInternshipById(id: number) {
  return apiFetch<Internship>(
    INTERNSHIP_SERVICE_URL,
    `/api/internships/${id}`,
  );
}

export function createInternship(data: InternshipRequest) {
  // TODO: This admin-only endpoint will be superseded by the student registration flow in a later phase.
  return apiFetch<Internship>(
    INTERNSHIP_SERVICE_URL,
    "/api/internships",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function getWorkPlanByInternshipId(internshipId: number) {
  return apiFetch<WorkPlan>(
    INTERNSHIP_SERVICE_URL,
    `/api/work-plans/${internshipId}`,
  );
}

export function createWorkPlan(
  internshipId: number,
  data: WorkPlanRequest,
) {
  return apiFetch<WorkPlan>(
    INTERNSHIP_SERVICE_URL,
    `/api/work-plans/${internshipId}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function getTasksByWorkPlanId(workPlanId: number) {
  return apiFetch<Task[]>(
    INTERNSHIP_SERVICE_URL,
    `/api/tasks/work-plan/${workPlanId}`,
  );
}

export function createTask(
  workPlanId: number,
  data: TaskRequest,
) {
  return apiFetch<Task>(
    INTERNSHIP_SERVICE_URL,
    `/api/tasks/${workPlanId}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function getCompanyInternshipLogs(internshipId: number) {
  return apiFetch<InternshipLog[]>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-logs/company/${internshipId}`,
  );
}

export function getInternshipLogsForLecturer(internshipId: number) {
  return apiFetch<InternshipLog[]>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-logs/lecturer/${internshipId}`,
  );
}

export function getStudentInternshipLogs(internshipId: number) {
  return apiFetch<InternshipLog[]>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-logs/${internshipId}`,
  );
}

export function createInternshipLog(
  internshipId: number,
  data: InternshipLogRequest,
) {
  return apiFetch<InternshipLog>(
    INTERNSHIP_SERVICE_URL,
    `/api/internship-logs/${internshipId}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function updateInternshipTaskStatus(
  taskId: number,
  data: TaskStatusRequest,
) {
  return apiFetch<Task>(
    INTERNSHIP_SERVICE_URL,
    `/api/tasks/${taskId}/status`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}