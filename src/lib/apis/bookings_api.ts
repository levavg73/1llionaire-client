import type {
  BackendListResponse,
  BackendResponse,
  Booking,
  BookingDetail,
  Review,
} from "../lib/api-contracts";
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

  acceptBooking: (id: string) =>
    http.patch<BackendResponse<Booking>>(`/api/bookings/${id}/accept`),

  rejectBooking: (id: string, reason?: string) =>
    http.patch<BackendResponse<Booking>>(`/api/bookings/${id}/reject`, {
      reason,
    }),

  createOffer: (id: string, data: { amount: number; message?: string }) =>
    http.post<BackendResponse<unknown>>(`/api/bookings/${id}/offers`, data),

  acceptOffer: (bookingId: string, offerId: string) =>
    http.patch<BackendResponse<unknown>>(
      `/api/bookings/${bookingId}/offers/${offerId}/accept`
    ),

  rejectOffer: (bookingId: string, offerId: string) =>
    http.patch<BackendResponse<unknown>>(
      `/api/bookings/${bookingId}/offers/${offerId}/reject`
    ),

  // 프리랜서가 행사 완료를 요청합니다.
  requestCompletion: (id: string) =>
    http.patch<BackendResponse<Booking>>(`/api/bookings/${id}/request-completion`),

  // 고객이 행사 완료를 승인합니다.
  completeBooking: (id: string) =>
    http.patch<BackendResponse<Booking>>(`/api/bookings/${id}/complete-by-customer`),

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
