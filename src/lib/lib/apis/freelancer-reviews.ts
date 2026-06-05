import type {
  BackendListResponse,
  BackendResponse,
  FreelancerReview,
  FreelancerReviewCreatePayload,
} from "../api-contracts";
import http, { toQueryParams } from "../http";

export const freelancerReviewApi = {
  create: (data: FreelancerReviewCreatePayload) =>
    http.post<BackendResponse<FreelancerReview>>("/api/freelancer-reviews", data),

  getMyReviews: (params?: Record<string, unknown>) =>
    http.get<BackendListResponse<FreelancerReview>>("/api/freelancer-reviews/me", {
      params: toQueryParams(params),
    }),

  getCustomerReviews: (customerId: string, params?: Record<string, unknown>) =>
    http.get<BackendListResponse<FreelancerReview>>(`/api/freelancer-reviews/customer/${customerId}`, {
      params: toQueryParams(params),
    }),

  getBookingReview: (bookingId: string) =>
    http.get<BackendResponse<FreelancerReview>>(`/api/freelancer-reviews/booking/${bookingId}`),
};
