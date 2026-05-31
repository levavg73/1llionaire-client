import type {
  BackendListResponse,
  BackendResponse,
  Booking,
  BookingDetail,
  Review,
} from "../api-contracts";
import http, { toQueryParams } from "../http";

export const bookingApi = {
  createBooking: (data: unknown) =>
    http.post<BackendResponse<Booking>>("/api/bookings", data),

  getBookings: (params?: Record<string, unknown>) =>
    http.get<BackendListResponse<Booking>>("/api/bookings", {
      params: toQueryParams(params),
    }),

  getBooking: (id: string) =>
    http.get<BackendResponse<BookingDetail>>(`/api/bookings/${id}`),

  cancelBooking: (id: string, reason?: string) =>
    http.patch<BackendResponse<Booking>>(`/api/bookings/${id}/cancel`, {
      cancel_reason: reason,
    }),

  createReview: (data: unknown) =>
    http.post<BackendResponse<Review>>("/api/reviews", data),

  getMyReviews: (params?: Record<string, unknown>) =>
    http.get<BackendListResponse<Review>>("/api/reviews/me", {
      params: toQueryParams(params),
    }),
};