import type { BackendResponse, Contract } from "../api-contracts";
import http from "../http";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_DIRECT_BASE_URL || "";
const baseURL = rawBaseUrl.replace(/\/+$/, "");

export const contractApi = {
  generate: (bookingId: string) =>
    http.post<BackendResponse<Contract>>(`/api/contracts/${bookingId}/generate`),

  get: (bookingId: string) =>
    http.get<BackendResponse<Contract>>(`/api/contracts/${bookingId}`),

  sign: (bookingId: string) =>
    http.post<BackendResponse<Contract>>(`/api/contracts/${bookingId}/sign`),

  getHtml: (bookingId: string) =>
    http.get<string>(`/api/contracts/${bookingId}/html`),

  getHtmlUrl: (bookingId: string) =>
    `${baseURL}/api/contracts/${bookingId}/html`,
};
