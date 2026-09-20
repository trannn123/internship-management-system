import { getInternshipOpportunityById } from "../../api/internship-opportunity-api";
import { getInternshipPeriodById } from "../../api/internship-period-api";
import {
  getCompanyProfileById,
  getStudentProfileById,
} from "../../api/user-api";
import type {
  CompanySummary,
  InternshipOpportunity,
  InternshipPeriod,
  InternshipRegistration,
  StudentSummary,
} from "../../types";

export function getErrorMessage(
  error: unknown,
  fallback = "Đã xảy ra lỗi. Vui lòng thử lại.",
) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function isNotFoundError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();

  return message.includes("not found") || message.includes("không tìm thấy");
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export function formatDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
) {
  if (!startDate && !endDate) {
    return "—";
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function getDisplayName(
  user: { fullName?: string | null } | null | undefined,
  fallback = "Chưa cập nhật",
) {
  return user?.fullName?.trim() || fallback;
}

export function getCompanyDisplayName(
  company: CompanySummary | null | undefined,
  fallback = "Chưa cập nhật",
) {
  return (
    company?.companyName?.trim() ||
    company?.fullName?.trim() ||
    fallback
  );
}

function getUniqueIds(values: Array<number | null | undefined>) {
  return [...new Set(values.filter((value): value is number => value != null))];
}

export async function loadRegistrationMetadata(
  registrations: InternshipRegistration[],
) {
  const periodIds = getUniqueIds(
    registrations.map((registration) => registration.periodId),
  );
  const opportunityIds = getUniqueIds(
    registrations.map((registration) => registration.opportunityId),
  );
  const studentIds = getUniqueIds(
    registrations.map((registration) => registration.studentId),
  );
  const companyIds = getUniqueIds(
    registrations.map((registration) => registration.companyId),
  );

  const [periods, opportunities, students, companies] = await Promise.all([
    Promise.all(
      periodIds.map(async (id) => [id, await getInternshipPeriodById(id)] as const),
    ),
    Promise.all(
      opportunityIds.map(async (id) => [
        id,
        await getInternshipOpportunityById(id),
      ] as const),
    ),
    Promise.all(
      studentIds.map(async (id) => [id, await getStudentProfileById(id)] as const),
    ),
    Promise.all(
      companyIds.map(async (id) => [id, await getCompanyProfileById(id)] as const),
    ),
  ]);

  return {
    periodMap: new Map<number, InternshipPeriod>(periods),
    opportunityMap: new Map<number, InternshipOpportunity>(opportunities),
    studentMap: new Map<number, StudentSummary>(students),
    companyMap: new Map<number, CompanySummary>(companies),
  };
}

