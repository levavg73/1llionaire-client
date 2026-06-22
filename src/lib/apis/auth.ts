import type { User } from "@/types";
import type { AuthSession, AuthUser, BackendResponse } from "../api-contracts";
import http from "../http";

export type OAuthProvider = "kakao" | "google";

function normalizeApiBaseUrl(value?: string | null) {
  if (!value) return "";

  return value
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "");
}

const directBaseURL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_DIRECT_BASE_URL);

function getOAuthRedirectOrigin(redirectOrigin?: string) {
  if (redirectOrigin) return redirectOrigin;
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

function buildAuthUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return directBaseURL ? `${directBaseURL}${normalizedPath}` : normalizedPath;
}

export const authApi = {
  getOAuthStartUrl: (provider: OAuthProvider, redirectOrigin?: string) => {
    const params = new URLSearchParams({
      redirect_uri: getOAuthRedirectOrigin(redirectOrigin),
    });

    return `${buildAuthUrl(`/api/auth/oauth/${provider}`)}?${params.toString()}`;
  },

  completeOAuthSignup: (data: {
    name: string;
    user_type: "customer" | "freelancer";
  }) => http.post<BackendResponse<AuthSession>>("/api/auth/oauth/complete", data),

  signup: (data: {
    name: string;
    email: string;
    password: string;
    user_type: "customer" | "freelancer";
    phone?: string;
  }) => http.post<BackendResponse<AuthSession>>("/api/auth/signup", data),

  login: (data: { email: string; password: string }) =>
    http.post<BackendResponse<AuthSession>>("/api/auth/login", data),

  requestPasswordReset: (data: { email: string }) =>
    http.post<BackendResponse<null>>("/api/auth/password-reset/request", data),

  refresh: () => http.post<BackendResponse<AuthSession>>("/api/auth/refresh"),

  logout: () => http.post<BackendResponse<null>>("/api/auth/logout"),

  me: () => http.get<BackendResponse<User>>("/api/auth/me"),

  updateMe: (data: { name?: string; phone?: string }) =>
    http.patch<BackendResponse<AuthUser>>("/api/users/me", data),

  updateCustomerProfile: (data: {
    customer_type?: "individual" | "company" | "agency";
    company_name?: string;
    department?: string;
    manager_name?: string;
  }) => http.patch<BackendResponse<{ id: string }>>("/api/users/me/customer-profile", data),

  setPassword: (new_password: string) =>
    http.patch<BackendResponse<AuthUser>>("/api/users/me/set-password", { new_password }),

  changePassword: (data: { current_password: string; new_password: string }) =>
    http.patch<BackendResponse<null>>("/api/users/me/password", data),

  deleteAccount: (data: { password: string }) =>
    http.delete<BackendResponse<null>>("/api/users/me", data),
};
