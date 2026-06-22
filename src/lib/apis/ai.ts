import type { BackendResponse, EventRequest, PricingAnalysisResult, PricingAnalysisRequest } from "../api-contracts";
import http from "../http";

export const aiApi = {
  analyzePricing: (data: PricingAnalysisRequest) =>
    http.post<BackendResponse<PricingAnalysisResult>>("/api/ai/pricing-analysis", data),

  applyRecommendation: (data: { booking_id: string; recommended_price: number }) =>
    http.post<BackendResponse<unknown>>("/api/ai/apply-recommendation", data),

  applyRequestBudget: (requestId: string, data: { budget_min: number; budget_max: number }) =>
    http.patch<BackendResponse<EventRequest>>(`/api/ai/requests/${requestId}/apply-budget`, data),
};
