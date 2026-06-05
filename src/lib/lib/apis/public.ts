import type {
  BackendListResponse,
  BackendResponse,
  FreelancerProfile,
  Review,
} from "../api-contracts";
import http, { toQueryParams } from "../http";

export const publicApi = {
  getFreelancers: (params?: Record<string, unknown>) =>
    http.get<BackendListResponse<FreelancerProfile>>("/api/public/freelancers", {
      params: toQueryParams(params),
    }),

  getFreelancer: (id: string) =>
    http.get<BackendResponse<FreelancerProfile>>(`/api/public/freelancers/${id}`),

  getFreelancerReviews: (id: string, params?: Record<string, unknown>) =>
    http.get<BackendListResponse<Review>>(`/api/public/reviews/freelancer/${id}`, {
      params: toQueryParams(params),
    }),
};