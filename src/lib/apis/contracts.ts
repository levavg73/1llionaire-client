import type { BackendResponse, Contract } from "../api-contracts";
import http from "../http";

function getSameOriginContractUrl(bookingId: string, format: "html" | "pdf") {
  return `/api/contracts/${bookingId}/${format}`;
}

export const contractApi = {
  generate: (bookingId: string) =>
    http.post<BackendResponse<Contract>>(`/api/contracts/${bookingId}/generate`),

  accept: (bookingId: string) =>
    http.post<BackendResponse<Contract>>(`/api/contracts/${bookingId}/accept`),

  get: (bookingId: string) =>
    http.get<BackendResponse<Contract>>(`/api/contracts/${bookingId}`),

  sign: (bookingId: string) =>
    http.post<BackendResponse<Contract>>(`/api/contracts/${bookingId}/sign`),

  getHtml: (bookingId: string) =>
    http.get<string>(`/api/contracts/${bookingId}/html`),

  getHtmlUrl: (bookingId: string) => getSameOriginContractUrl(bookingId, "html"),

  getPdfUrl: (bookingId: string) => getSameOriginContractUrl(bookingId, "pdf"),
};
