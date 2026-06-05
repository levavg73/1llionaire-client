import type { BackendResponse, PricingAnalysisResult, PricingAnalysisRequest } from "../lib/api-contracts";
import http from "../http";

export const aiApi = {
  analyzePricing: (data: PricingAnalysisRequest) =>
    http.post<BackendResponse<PricingAnalysisResult>>("/api/ai/pricing-analysis", data),

  applyRecommendation: (data: { booking_id: string; recommended_price: number }) =>
    http.post<BackendResponse<unknown>>("/api/ai/apply-recommendation", data),
};
