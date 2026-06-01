import type { User } from "@/types";
import type { AuthSession, AuthUser, BackendResponse } from "../api-contracts";
import http from "../http";

export const authApi = {
  signup: (data: {
    name: string;
    email: string;
    password: string;
    user_type: "customer" | "freelancer";
    phone?: string;
  }) => http.post<BackendResponse<AuthSession>>("/api/auth/signup", data),

  login: (data: { email: string; password: string }) =>
    http.post<BackendResponse<AuthSession>>("/api/auth/login", data),

  refresh: () =>
    http.post<BackendResponse<AuthSession>>("/api/auth/refresh"),

  logout: () =>
    http.post<BackendResponse<null>>("/api/auth/logout"),

  me: () =>
    http.get<BackendResponse<User>>("/api/auth/me"),

  updateMe: (data: { name?: string; phone?: string }) =>
    http.patch<BackendResponse<AuthUser>>("/api/users/me", data),

  changePassword: (data: { current_password: string; new_password: string }) =>
    http.patch<BackendResponse<null>>("/api/users/me/password", data),

  deleteAccount: (data: { password: string }) =>
    http.delete<BackendResponse<null>>("/api/users/me", data),
};