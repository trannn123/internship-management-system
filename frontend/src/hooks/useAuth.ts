import type { KeycloakTokenParsed } from "keycloak-js";
import { useMemo } from "react";
import keycloak from "../keycloak";
import { isAppRole, type AppRole, type UserRole } from "../types";

type TokenWithRealmAccess = KeycloakTokenParsed & {
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  realm_access?: {
    roles: string[];
  };
};

export function useAuth() {
  return useMemo(() => {
    const tokenParsed =
      keycloak.tokenParsed as TokenWithRealmAccess | undefined;
    const roles = tokenParsed?.realm_access?.roles ?? [];
    const role = roles.find(isAppRole) ?? "UNKNOWN";
    const username = tokenParsed?.preferred_username ?? "User";
    const firstName = tokenParsed?.given_name ?? "";
    const lastName = tokenParsed?.family_name ?? "";
    const fullName =
      tokenParsed?.name ??
      [firstName, lastName].filter(Boolean).join(" ") ??
      "";

    return {
      keycloakId: tokenParsed?.sub ?? "",
      username,
      firstName,
      lastName,
      fullName: fullName || username,
      role,
      roles,
      hasRole: (candidate: AppRole) => roles.includes(candidate),
      logout: () => keycloak.logout(),
    } satisfies {
      keycloakId: string;
      username: string;
      firstName: string;
      lastName: string;
      fullName: string;
      role: UserRole;
      roles: string[];
      hasRole: (candidate: AppRole) => boolean;
      logout: () => Promise<void>;
    };
  }, [keycloak.token, keycloak.tokenParsed]);
}
