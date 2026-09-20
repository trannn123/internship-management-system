import type { AppRole } from "./auth";

export interface User {
  id: number;
  keycloakUserId: string;
  fullName: string;
  email: string;
}

export interface LecturerSummary {
  id: number;
  userId: number | null;
  fullName: string | null;
  email: string | null;
  lecturerCode: string | null;
  department: string | null;
}

export interface StudentSummary {
  id: number;
  userId: number | null;
  fullName: string | null;
  email: string | null;
  studentCode: string | null;
  className: string | null;
  major: string | null;
}

export interface CompanySummary {
  id: number;
  userId: number | null;
  fullName: string | null;
  email: string | null;
  companyName: string | null;
  taxCode: string | null;
  address: string | null;
  phone: string | null;
}

export interface StudentProfile {
  id: number;
  studentCode: string | null;
  major: string | null;
  className: string | null;
  phone: string | null;
}

export interface StudentProfileRequest {
  studentCode: string;
  major: string;
  className: string;
  phone: string;
}

export interface CompanyProfile {
  id: number;
  companyName: string | null;
  taxCode: string | null;
  address: string | null;
  phone: string | null;
}

export interface CompanyProfileRequest {
  companyName: string;
  taxCode: string;
  address: string;
  phone: string;
}

export interface LecturerProfile {
  id: number;
  lecturerCode: string | null;
  department: string | null;
  phone: string | null;
}

export interface LecturerProfileRequest {
  lecturerCode: string;
  department: string;
  phone: string;
}

export type UserProfile = StudentProfile | CompanyProfile | LecturerProfile | null;

export interface CurrentUser extends User {
  role: AppRole;
  profile: UserProfile;
}
