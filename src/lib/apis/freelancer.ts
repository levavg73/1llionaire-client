import type {
  BackendListResponse,
  BackendResponse,
  FreelancerAvailabilitySlot,
  FreelancerProfile,
  FreelancerRequestItem,
  FreelancerSettlementRow,
  Portfolio,
  Quote,
} from "../api-contracts";
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

  uploadSignatureVoice: (file: File) => {
    const formData = new FormData();
    formData.append("voice", file);

    return http.post<BackendResponse<{ url: string | null; path: string }>>(
      "/api/freelancer/signature-voice",
      formData
    );
  },

  deleteSignatureVoice: () =>
    http.delete<BackendResponse<null>>("/api/freelancer/signature-voice"),

  createPortfolio: (data: unknown) =>
    http.post<BackendResponse<Portfolio>>("/api/freelancer/portfolio", data),

  getPortfolios: () =>
    http.get<BackendResponse<Portfolio[]>>("/api/freelancer/portfolio"),

  updatePortfolio: (id: string, data: unknown) =>
    http.patch<BackendResponse<Portfolio>>(`/api/freelancer/portfolio/${id}`, data),

  deletePortfolio: (id: string) =>
    http.delete<BackendResponse<null>>(`/api/freelancer/portfolio/${id}`),

  getAvailability: () =>
    http.get<BackendResponse<FreelancerAvailabilitySlot[]>>(
      "/api/freelancer/availability"
    ),

  createAvailability: (data: unknown) =>
    http.post<BackendResponse<FreelancerAvailabilitySlot>>(
      "/api/freelancer/availability",
      data
    ),

  updateAvailability: (id: string, data: unknown) =>
    http.patch<BackendResponse<FreelancerAvailabilitySlot>>(
      `/api/freelancer/availability/${id}`,
      data
    ),

  deleteAvailability: (id: string) =>
    http.delete<BackendResponse<null>>(`/api/freelancer/availability/${id}`),

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