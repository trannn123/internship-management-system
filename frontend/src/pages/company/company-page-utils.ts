import { getStudentProfileById } from "../../api/user-api";
import type {
  Internship,
  InternshipOpportunity,
  InternshipRegistration,
  StudentSummary,
} from "../../types";

export const companyPaths = {
  overview: "/company",
  opportunities: "/company/opportunities",
  newOpportunity: "/company/opportunities/new",
  editOpportunity: (id: number) => `/company/opportunities/${id}/edit`,
  registrations: "/company/registrations",
  workPlans: "/company/work-plans",
  tasks: "/company/tasks",
  logs: "/company/logs",
  evaluations: "/company/evaluations",
} as const;

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
) {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function toErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function findUserLabel(
  usersById: Map<number, StudentSummary>,
  userId: number | null | undefined,
) {
  if (!userId) {
    return "—";
  }

  const user = usersById.get(userId);

  if (!user) {
    return `#${userId}`;
  }

  return `${user.fullName ?? "Chưa cập nhật"} (#${user.id})`;
}

export function findUserEmail(
  usersById: Map<number, StudentSummary>,
  userId: number | null | undefined,
) {
  if (!userId) {
    return "—";
  }

  return usersById.get(userId)?.email ?? "—";
}

/**
 * Resolves basic display info (name/email) for a set of *student profile*
 * ids referenced by the company's own data (e.g. studentId on
 * registrations/internships). Uses the dedicated student-profile lookup
 * (keyed by Student.id, not User.id) so names resolve correctly.
 */
export async function loadUsersByIds(
  userIds: Array<number | null | undefined>,
): Promise<Map<number, StudentSummary>> {
  const uniqueIds = Array.from(
    new Set(
      userIds.filter(
        (id): id is number => typeof id === "number",
      ),
    ),
  );

  const entries = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        return [id, await getStudentProfileById(id)] as const;
      } catch {
        return [id, null] as const;
      }
    }),
  );

  return new Map(
    entries.filter(
      (entry): entry is [number, StudentSummary] => entry[1] !== null,
    ),
  );
}

export function findOpportunityLabel(
  opportunitiesById: Map<number, InternshipOpportunity>,
  opportunityId: number | null | undefined,
) {
  if (!opportunityId) {
    return "—";
  }

  return opportunitiesById.get(opportunityId)?.position ?? `#${opportunityId}`;
}

export function byRegisteredAtDesc(
  left: InternshipRegistration,
  right: InternshipRegistration,
) {
  return (
    new Date(right.registeredAt ?? 0).getTime() -
    new Date(left.registeredAt ?? 0).getTime()
  );
}

export function byCreatedAtDesc(
  left: InternshipOpportunity,
  right: InternshipOpportunity,
) {
  return (
    new Date(right.createdAt ?? 0).getTime() -
    new Date(left.createdAt ?? 0).getTime()
  );
}

export function isActiveInternship(internship: Internship) {
  return internship.status === "IN_PROGRESS";
}

export function isCompletedInternship(internship: Internship) {
  return (
    internship.status === "COMPLETED_COMPANY" ||
    internship.status === "COMPLETED_LECTURER"
  );
}
