import type {
  CompanyProfileRequest,
  CompanySummary,
  CurrentUser,
  LecturerProfileRequest,
  LecturerSummary,
  StudentProfileRequest,
  StudentSummary,
  User,
} from "../types";
import { apiFetch, USER_SERVICE_URL } from "./api-client";

export function getCurrentUser() {
  return apiFetch<CurrentUser>(USER_SERVICE_URL, "/api/users/me");
}

export function getUserById(id: number) {
  return apiFetch<User>(USER_SERVICE_URL, `/api/users/${id}`);
}

export function getAllUsers() {
  return apiFetch<User[]>(USER_SERVICE_URL, "/api/users");
}

export function getAllLecturers() {
  return apiFetch<LecturerSummary[]>(USER_SERVICE_URL, "/api/users/lecturers");
}

/**
 * Resolve a Lecturer/Student/Company *profile* id (not the User id) to its
 * display info. `studentId`/`companyId`/`lecturerId` fields on registrations,
 * internships, etc. are always profile ids, so use these instead of
 * `getUserById` to avoid resolving the wrong person.
 */
export function getLecturerProfileById(id: number) {
  return apiFetch<LecturerSummary>(
    USER_SERVICE_URL,
    `/api/users/lecturers/${id}`,
  );
}

export function getStudentProfileById(id: number) {
  return apiFetch<StudentSummary>(
    USER_SERVICE_URL,
    `/api/users/students/${id}`,
  );
}

export function getCompanyProfileById(id: number) {
  return apiFetch<CompanySummary>(
    USER_SERVICE_URL,
    `/api/users/companies/${id}`,
  );
}

export function updateStudentProfile(data: StudentProfileRequest) {
  return apiFetch<CurrentUser>(
    USER_SERVICE_URL,
    "/api/users/me/profile/student",
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export function updateLecturerProfile(data: LecturerProfileRequest) {
  return apiFetch<CurrentUser>(
    USER_SERVICE_URL,
    "/api/users/me/profile/lecturer",
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export function updateCompanyProfile(data: CompanyProfileRequest) {
  return apiFetch<CurrentUser>(
    USER_SERVICE_URL,
    "/api/users/me/profile/company",
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}