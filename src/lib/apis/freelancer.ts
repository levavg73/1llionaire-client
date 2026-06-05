import type {
  BackendListResponse,
  BackendResponse,
  FreelancerProfile,
  FreelancerRequestItem,
  FreelancerSettlementRow,
  Portfolio,
  Quote,
} from "../lib/api-contracts";
import http, { toQueryParams } from "../http";

export const freelancerApi = {
  submitProfile: (data: unknown) =>
    http.post<BackendResponse<FreelancerProfile>>("/api/freelancer/profile", data),

  getProfile: () =>
    http.get<BackendResponse<FreelancerProfile>>("/api/freelancer/profile"),

  updateProfile: (data: unknown) =>
    http.patch<BackendResponse<FreelancerProfile>>("/api/freelancer/profile", data),

  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    return http.post<BackendResponse<{ url: string | null; path: string }>>(
      "/api/freelancer/profile-image",
      formData
    );
  },

  deleteProfileImage: () =>
    http.delete<BackendResponse<null>>("/api/freelancer/profile-image"),

  createPortfolio: (data: unknown) =>
    http.post<BackendResponse<Portfolio>>("/api/freelancer/portfolio", data),

  getPortfolios: () =>
    http.get<BackendResponse<Portfolio[]>>("/api/freelancer/portfolio"),

  updatePortfolio: (id: string, data: unknown) =>
    http.patch<BackendResponse<Portfolio>>(`/api/freelancer/portfolio/${id}`, data),

  deletePortfolio: (id: string) =>
    http.delete<BackendResponse<null>>(`/api/freelancer/portfolio/${id}`),

  getRequests: (params?: Record<string, unknown>) =>
    http.get<BackendListResponse<FreelancerRequestItem>>("/api/freelancer/requests", {
      params: toQueryParams(params),
    }),

  createQuote: (data: unknown) =>
    http.post<BackendResponse<Quote>>("/api/freelancer/quotes", data),

  getSettlements: (params?: Record<string, unknown>) =>
    http.get<BackendListResponse<FreelancerSettlementRow>>(
      "/api/freelancer/settlements",
      {
        params: toQueryParams(params),
      }
    ),
};