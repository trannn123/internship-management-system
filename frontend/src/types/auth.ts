export const APP_ROLES = ["STUDENT", "COMPANY", "LECTURER", "ADMIN"] as const;

export type AppRole = (typeof APP_ROLES)[number];
export type UserRole = AppRole | "UNKNOWN";

export function isAppRole(role: string): role is AppRole {
  return APP_ROLES.includes(role as AppRole);
}
