import type {
  BackendResponse,
  PaymentConfirmPayload,
  PaymentDetail,
  PaymentPreparePayload,
} from "../api-contracts";
import http from "../http";

export const paymentApi = {
  prepare: (booking_id: string) =>
    http.post<BackendResponse<PaymentPreparePayload>>("/api/payments/prepare", {
      booking_id,
    }),

  confirm: (data: { payment_key: string; order_id: string; amount: number }) =>
    http.post<BackendResponse<PaymentConfirmPayload>>("/api/payments/confirm", data),

  cancel: (data: {
    booking_id: string;
    cancel_reason: string;
    cancel_amount?: number;
  }) =>
    http.post<BackendResponse<{ status: "CANCELED" | "PARTIAL_CANCELED" }>>(
      "/api/payments/cancel",
      data
    ),

  getByBookingId: (bookingId: string) =>
    http.get<BackendResponse<PaymentDetail>>(`/api/payments/${bookingId}`),
};