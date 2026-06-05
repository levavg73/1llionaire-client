import type {
  AdminBookingRow,
  AdminDashboardData,
  AdminFreelancerRow,
  AdminPaymentRow,
  AdminRequestDetail,
  AdminRequestRow,
  AdminReviewRow,
  AdminSettlementRow,
  BackendListResponse,
  BackendResponse,
  Booking,
  EventRequest,
  FreelancerProfile,
  PaymentStatus,
  Recommendation,
  RequestStatus,
  Review,
  ReviewStatus,
  SettlementStatus,
} from "../lib/api-contracts";
import http, { toQueryParams } from "../http";

export const adminApi = {
  getDashboard: () =>
    http.get<BackendResponse<AdminDashboardData>>("/api/admin/dashboard"),

  getFreelancers: (params?: Record<string, unknown>) =>
    http.get<BackendListResponse<AdminFreelancerRow>>("/api/admin/freelancers", {
      params: toQueryParams(params),
    }),

  approveFreelancer: (id: string) =>
    http.patch<BackendResponse<FreelancerProfile>>(
      `/api/admin/freelancers/${id}/approve`
    ),

  rejectFreelancer: (id: string, reason: string) =>
    http.patch<BackendResponse<FreelancerProfile>>(
      `/api/admin/freelancers/${id}/reject`,
      { reason }
    ),

  getRequests: (params?: Record<string, unknown>) =>
    http.get<BackendListResponse<AdminRequestRow>>("/api/admin/requests", {
      params: toQueryParams(params),
    }),

  getRequest: (id: string) =>
    http.get<BackendResponse<AdminRequestDetail>>(`/api/admin/requests/${id}`),

  updateRequestStatus: (id: string, status: RequestStatus) =>
    http.patch<BackendResponse<EventRequest>>(`/api/admin/requests/${id}/status`, {
      status,
    }),

  createRecommendation: (data: unknown) =>
    http.post<BackendResponse<Recommendation>>("/api/admin/recommendations", data),

  getBookings: (params?: Record<string, unknown>) =>
    http.get<BackendListResponse<AdminBookingRow>>("/api/admin/bookings", {
      params: toQueryParams(params),
    }),

  updateBooking: (id: string, data: unknown) =>
    http.patch<BackendResponse<Booking>>(`/api/admin/bookings/${id}`, data),

  getPayments: (params?: Record<string, unknown>) =>
    http.get<BackendListResponse<AdminPaymentRow>>("/api/admin/payments", {
      params: toQueryParams(params),
    }),

  updatePayment: (id: string, data: { payment_status: PaymentStatus }) =>
    http.patch<BackendResponse<Booking>>(`/api/admin/payments/${id}`, data),

  getSettlements: (params?: Record<string, unknown>) =>
    http.get<BackendListResponse<AdminSettlementRow>>("/api/admin/settlements", {
      params: toQueryParams(params),
    }),

  updateSettlement: (id: string, data: { settlement_status: SettlementStatus }) =>
    http.patch<BackendResponse<Booking>>(`/api/admin/settlements/${id}`, data),

  getReviews: (params?: Record<string, unknown>) =>
    http.get<BackendListResponse<AdminReviewRow>>("/api/admin/reviews", {
      params: toQueryParams(params),
    }),

  updateReview: (id: string, data: { status: ReviewStatus }) =>
    http.patch<BackendResponse<Review>>(`/api/admin/reviews/${id}`, data),
};