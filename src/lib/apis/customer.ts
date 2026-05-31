import type {
  BackendListResponse,
  BackendResponse,
  EventRequest,
  Recommendation,
} from "../api-contracts";
import http, { toQueryParams } from "../http";

export const customerApi = {
  createRequest: (data: unknown) =>
    http.post<BackendResponse<EventRequest>>("/api/customer/requests", data),

  getRequests: (params?: Record<string, unknown>) =>
    http.get<BackendListResponse<EventRequest>>("/api/customer/requests", {
      params: toQueryParams(params),
    }),

  getRequest: (id: string) =>
    http.get<BackendResponse<EventRequest>>(`/api/customer/requests/${id}`),

  updateRequest: (id: string, data: unknown) =>
    http.patch<BackendResponse<EventRequest>>(`/api/customer/requests/${id}`, data),

  deleteRequest: (id: string) =>
    http.delete<BackendResponse<null>>(`/api/customer/requests/${id}`),

  getRecommendations: (id: string) =>
    http.get<BackendResponse<Recommendation[]>>(
      `/api/customer/requests/${id}/recommendations`
    ),
};