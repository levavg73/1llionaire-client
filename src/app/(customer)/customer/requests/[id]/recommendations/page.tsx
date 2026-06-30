"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/http";
import { bookingApi, customerApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { SaveFreelancerButton } from "@/components/freelancer/SaveFreelancerButton";
import { Card, CardContent } from "@/components/ui/card";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/common/States";
import { ArrowLeft, Star, MapPin, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Recommendation } from "@/types";

function getApiErrorMessage(error: unknown) {
  const fallback = "예약 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.";

  if (error instanceof Error && error.message) {
    return error.message;
  }

  const apiError = error as ApiError<{ error?: { message?: string } }>;
  return apiError?.response?.data?.error?.message || fallback;
}

function hasActiveRequest(recommendations: Recommendation[]) {
  return recommendations.some((recommendation) =>
    ["consultation_requested", "selected"].includes(recommendation.status),
  );
}

function isRecommendationBookable(
  status: Recommendation["status"],
  hasActiveSelection: boolean,
) {
  return !hasActiveSelection && (status === "sent" || status === "viewed");
}

function getBookingButtonLabel(
  status: Recommendation["status"],
  isCurrentPending: boolean,
) {
  if (isCurrentPending) return "전달 중...";

  switch (status) {
    case "consultation_requested":
      return "진행자 응답 대기";
    case "selected":
      return "상담 가능";
    case "rejected":
      return "진행 불가";
    case "draft":
      return "검수 대기";
    default:
      return "이 진행자에게 요청서 전달";
  }
}

export default function RecommendationsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pendingFreelancerId, setPendingFreelancerId] = useState<string | null>(
    null,
  );
  const [bookingErrorMessage, setBookingErrorMessage] = useState<string | null>(
    null,
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.recommendations(id),
    queryFn: () => customerApi.getRecommendations(id),
  });

  const recommendations: Recommendation[] = data?.data?.data ?? [];
  const hasActiveSelection = hasActiveRequest(recommendations);

  const bookingMutation = useMutation({
    mutationFn: (freelancerId: string) =>
      bookingApi.createBooking({ request_id: id, freelancer_id: freelancerId }),
    onMutate: (freelancerId) => {
      setPendingFreelancerId(freelancerId);
      setBookingErrorMessage(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customerBookings });
      queryClient.invalidateQueries({
        queryKey: queryKeys.customerRequest(id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.recommendations(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.chatRooms });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminBookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      router.push("/customer/bookings");
    },
    onError: (error) => {
      setBookingErrorMessage(getApiErrorMessage(error));
    },
    onSettled: () => {
      setPendingFreelancerId(null);
    },
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/customer/requests/${id}`}>
          <Button variant="ghost" size="icon" aria-label="뒤로가기">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">추천 후보</h1>
          <p className="text-muted-foreground text-sm">
            AI가 요청서, 진행자 프로필, 포트폴리오, 후기를 분석해 추천한
            후보입니다
          </p>
        </div>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && recommendations.length === 0 && (
        <EmptyState
          title="아직 공개된 추천 후보가 없습니다"
          description="요청 조건, 포트폴리오, 후기 데이터를 기준으로 후보를 찾고 있습니다."
        />
      )}

      {bookingErrorMessage && (
        <p
          role="alert"
          className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2 mb-4"
        >
          {bookingErrorMessage}
        </p>
      )}

      <div className="space-y-4">
        {recommendations.map((rec, idx) => {
          const f = rec.freelancer;
          return (
            <Card key={rec.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex gap-5 p-5">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                    {f.profile_image_url ? (
                      <Image
                        src={f.profile_image_url}
                        alt={f.display_name || ""}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                        {(f.display_name || "?")[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                            #{idx + 1} 추천
                          </span>
                        </div>
                        <h2 className="font-semibold text-lg mt-1">
                          {f.display_name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {f.headline}
                        </p>
                      </div>
                      {f.avg_rating && (
                        <div className="flex items-center gap-1 text-sm font-medium shrink-0">
                          <Star className="h-4 w-4 fill-gold text-gold" />
                          {f.avg_rating.toFixed(1)}
                          <span className="text-muted-foreground font-normal">
                            ({f.review_count})
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                      {f.region && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {f.region}
                        </span>
                      )}
                      {f.career_years && <span>경력 {f.career_years}년</span>}
                      {f.base_price_min && f.base_price_max && (
                        <span>
                          {formatPrice(f.base_price_min)} ~{" "}
                          {formatPrice(f.base_price_max)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {f.categories.map((c) => (
                        <span
                          key={c}
                          className="text-xs bg-muted px-2 py-0.5 rounded-full"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-4 border-t bg-muted/30 pt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    ✦ 추천 사유
                  </p>
                  <p className="text-sm leading-relaxed">
                    {rec.recommendation_reason ||
                      `${f.display_name}님은 ${f.categories.slice(0, 2).join(", ")} 분야에서 ${f.career_years ? `${f.career_years}년 경력의` : ""} 검증된 진행자입니다. ${f.avg_rating ? `평점 ${f.avg_rating.toFixed(1)}점으로 ` : ""}요청하신 조건에 적합한 후보로 선정되었습니다.`}
                  </p>
                </div>
                <div className="px-5 pb-5 grid gap-2 sm:grid-cols-3">
                  <Link href={`/freelancers/${f.id}`} className="min-w-0">
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      size="sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      프로필 상세보기
                    </Button>
                  </Link>
                  <SaveFreelancerButton
                    freelancerId={f.id}
                    size="sm"
                    className="w-full"
                  />
                  <Button
                    className="w-full bg-navy text-white hover:bg-navy-light disabled:opacity-60"
                    size="sm"
                    disabled={
                      pendingFreelancerId === f.id ||
                      !isRecommendationBookable(rec.status, hasActiveSelection)
                    }
                    onClick={() => {
                      if (bookingMutation.isPending) return;
                      if (
                        !isRecommendationBookable(
                          rec.status,
                          hasActiveSelection,
                        )
                      )
                        return;
                      bookingMutation.mutate(f.id);
                    }}
                  >
                    {getBookingButtonLabel(
                      rec.status,
                      pendingFreelancerId === f.id && bookingMutation.isPending,
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
