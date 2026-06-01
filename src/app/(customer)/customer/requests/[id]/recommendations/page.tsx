"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingApi, customerApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { ArrowLeft, Star, MapPin, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Recommendation } from "@/types";

export default function RecommendationsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.recommendations(id),
    queryFn: () => customerApi.getRecommendations(id),
  });

  const recommendations: Recommendation[] = data?.data?.data ?? [];

  const bookingMutation = useMutation({
    mutationFn: (freelancerId: string) =>
      bookingApi.createBooking({ request_id: id, freelancer_id: freelancerId }),
    onSuccess: (res) => {
      const booking = res.data.data;
      queryClient.invalidateQueries({ queryKey: queryKeys.customerBookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.customerRequest(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chatRooms });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminBookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      router.push(booking.chat_room ? `/customer/chats/${booking.chat_room.id}` : "/customer/bookings");
    },
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/customer/requests/${id}`}>
          <Button variant="ghost" size="icon" aria-label="뒤로가기"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">추천 후보</h1>
          <p className="text-muted-foreground text-sm">AI 데이터 매칭으로 선별한 맞춤 진행자입니다</p>
        </div>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && recommendations.length === 0 && (
        <EmptyState title="추천 후보가 없습니다" description="AI가 요청 조건과 등록 데이터를 비교하고 있습니다. 조건에 맞는 후보가 생기면 바로 알려드립니다." />
      )}

      {bookingMutation.isError && (
        <p role="alert" className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2 mb-4">
          예약 요청에 실패했습니다. 이미 진행 중인 요청이 있거나 예약 가능한 후보가 아닐 수 있습니다.
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
                      <Image src={f.profile_image_url} alt={f.display_name || ""} fill className="object-cover" />
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
                          <span className="text-xs font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded-full">#{idx + 1} 추천</span>
                        </div>
                        <h2 className="font-semibold text-lg mt-1">{f.display_name}</h2>
                        <p className="text-sm text-muted-foreground">{f.headline}</p>
                      </div>
                      {f.avg_rating && (
                        <div className="flex items-center gap-1 text-sm font-medium shrink-0">
                          <Star className="h-4 w-4 fill-gold text-gold" />
                          {f.avg_rating.toFixed(1)}
                          <span className="text-muted-foreground font-normal">({f.review_count})</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                      {f.region && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{f.region}</span>}
                      {f.career_years && <span>경력 {f.career_years}년</span>}
                      {f.base_price_min && f.base_price_max && (
                        <span>{formatPrice(f.base_price_min)} ~ {formatPrice(f.base_price_max)}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {f.categories.map((c) => (
                        <span key={c} className="text-xs bg-muted px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {rec.recommendation_reason && (
                  <div className="px-5 pb-4 border-t bg-muted/30 pt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">AI 추천 사유</p>
                    <p className="text-sm">{rec.recommendation_reason}</p>
                  </div>
                )}
                <div className="px-5 pb-5 flex gap-2">
                  <Link href={`/freelancers/${f.id}`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2" size="sm">
                      <ExternalLink className="h-3.5 w-3.5" />
                      프로필 상세보기
                    </Button>
                  </Link>
                  <Button
                    className="flex-1 bg-navy text-white hover:bg-navy-light"
                    size="sm"
                    disabled={bookingMutation.isPending}
                    onClick={() => bookingMutation.mutate(f.id)}
                  >
                    {bookingMutation.isPending ? "요청 중..." : "예약 요청"}
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
