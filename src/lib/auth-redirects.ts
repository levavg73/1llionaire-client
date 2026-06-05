import type { UserType } from "@/types";

const ROLE_HOME_PATHS: Record<UserType, string> = {
  admin: "/admin",
  customer: "/customer/requests",
  freelancer: "/freelancer/profile",
};

export function getDefaultPostAuthPath(userType: UserType): string {
  return ROLE_HOME_PATHS[userType] ?? ROLE_HOME_PATHS.customer;
}

export function getSafeInternalPath(value: string | null | undefined, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export function getPostAuthRedirect(nextPath: string | null | undefined, userType: UserType): string {
  return getSafeInternalPath(nextPath, getDefaultPostAuthPath(userType));
}
