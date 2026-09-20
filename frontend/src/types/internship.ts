export const InternshipPeriodStatus = {
  DRAFT: "DRAFT",
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

export type InternshipPeriodStatus =
  (typeof InternshipPeriodStatus)[keyof typeof InternshipPeriodStatus];

export interface InternshipPeriod {
  id: number;
  name: string;
  description: string | null;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  internshipStartDate: string | null;
  internshipEndDate: string | null;
  status: InternshipPeriodStatus | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface InternshipPeriodRequest {
  name: string;
  description: string | null;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  internshipStartDate: string | null;
  internshipEndDate: string | null;
  status: InternshipPeriodStatus | null;
}

export interface InternshipPeriodLecturer {
  id: number;
  periodId: number;
  lecturerId: number;
}

export interface AssignLecturerRequest {
  lecturerId: number;
}

export const OpportunityStatus = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
} as const;

export type OpportunityStatus =
  (typeof OpportunityStatus)[keyof typeof OpportunityStatus];

export interface InternshipOpportunity {
  id: number;
  periodId: number;
  companyId: number;
  position: string;
  description: string | null;
  requirements: string | null;
  location: string | null;
  quantity: number | null;
  status: OpportunityStatus | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface InternshipOpportunityRequest {
  periodId: number;
  position: string;
  description: string | null;
  requirements: string | null;
  location: string | null;
  quantity: number | null;
  status: OpportunityStatus | null;
}

export const RegistrationStatus = {
  PENDING_COMPANY: "PENDING_COMPANY",
  REJECTED_COMPANY: "REJECTED_COMPANY",
  PENDING_LECTURER: "PENDING_LECTURER",
  REJECTED_LECTURER: "REJECTED_LECTURER",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED_COMPANY: "COMPLETED_COMPANY",
  COMPLETED: "COMPLETED",
} as const;

export type RegistrationStatus =
  (typeof RegistrationStatus)[keyof typeof RegistrationStatus];

export interface InternshipRegistration {
  id: number;
  periodId: number;
  opportunityId: number;
  studentId: number;
  companyId: number;
  lecturerId: number;
  status: RegistrationStatus;
  registeredAt: string | null;
  approvedByCompanyAt: string | null;
  approvedByLecturerAt: string | null;
  completedAt: string | null;
}

export interface InternshipRegistrationRequest {
  opportunityId: number;
}

export const InternshipStatus = {
  PENDING_COMPANY: "PENDING_COMPANY",
  REJECTED_COMPANY: "REJECTED_COMPANY",
  PENDING_LECTURER: "PENDING_LECTURER",
  REJECTED_LECTURER: "REJECTED_LECTURER",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED_COMPANY: "COMPLETED_COMPANY",
  COMPLETED_LECTURER: "COMPLETED_LECTURER",
} as const;

export type InternshipStatus =
  (typeof InternshipStatus)[keyof typeof InternshipStatus];

export interface Internship {
  id: number;
  studentId: number;
  companyId: number | null;
  lecturerId: number | null;
  registrationId: number | null;
  position: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: InternshipStatus;
}

export interface InternshipRequest {
  studentId?: number | null;
  companyId?: number | null;
  lecturerId?: number | null;
  position: string;
  description: string | null;
  startDate: string;
  endDate: string;
}

export interface WorkPlan {
  id: number;
  internshipId: number;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface WorkPlanRequest {
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
}

export const TaskStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

export type TaskStatus =
  (typeof TaskStatus)[keyof typeof TaskStatus];

export interface Task {
  id: number;
  workPlanId: number;
  title: string;
  description: string | null;
  startDate: string | null;
  dueDate: string | null;
  status: TaskStatus;
}

export interface TaskRequest {
  title: string;
  description: string | null;
  startDate: string;
  dueDate: string;
}

export interface TaskStatusRequest {
  status: TaskStatus;
}

export interface InternshipLog {
  id: number;
  internshipId: number;
  logDate: string;
  content: string;
  result: string | null;
  note: string | null;
}

export interface InternshipLogRequest {
  logDate: string;
  content: string;
  result: string | null;
  note: string | null;
}
