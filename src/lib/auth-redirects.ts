import type { UserType } from "@/types";

const ROLE_HOME_PATHS: Record<UserType, string> = {
  admin: "/admin",
  customer: "/customer/requests",
  freelancer: "/freelancer/profile",
};

export function getDefaultPostAuthPath(userType: UserType): string {
  return ROLE_HOME_PATHS[userType] ?? ROLE_HOME_PATHS.customer;
}

export function getSafeInternalPath(
  value: string | null | undefined,
  fallback: string
): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

export function isRoleAllowedPath(path: string, userType: UserType): boolean {
  if (path.startsWith("/admin")) {
    return userType === "admin";
  }

  if (path.startsWith("/customer")) {
    return userType === "customer";
  }

  if (path.startsWith("/freelancer")) {
    return userType === "freelancer";
  }

  return true;
}

export function getPostAuthRedirect(
  nextPath: string | null | undefined,
  userType: UserType
): string {
  const fallback = getDefaultPostAuthPath(userType);
  const safeNextPath = getSafeInternalPath(nextPath, fallback);

  if (!isRoleAllowedPath(safeNextPath, userType)) {
    return fallback;
  }

  return safeNextPath;
}