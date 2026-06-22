"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { freelancerReviewApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { Pagination } from "@/components/common/Pagination";
import { ReviewStatusBadge } from "@/components/common/StatusBadge";
import type { FreelancerReview } from "@/types";
import { formatDate } from "@/lib/utils";
import { Star } from "lucide-react";

function Score({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-gold">
      <Star className="h-3.5 w-3.5 fill-gold" />
      {value.toFixed(1)}
    </span>
  );
}

export default function FreelancerClientReviewsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.freelancerClientReviewsPage(page),
    queryFn: () => freelancerReviewApi.getMyReviews({ page, limit: 10 }),
  });

  const items: FreelancerReview[] = data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">내가 작성한 의뢰인 후기</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          완료된 예약에 대해 의뢰인과의 협업 경험을 기록하세요.
        </p>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          title="작성한 의뢰인 후기가 없습니다"
          description="완료된 예약 목록에서 후기를 작성할 수 있습니다."
        />
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <ReviewStatusBadge status={item.status} />
                <Score value={item.total_score} />
                <span className="text-xs text-muted-foreground">
                  {formatDate(item.created_at)}
                </span>
              </div>
              <h2 className="font-semibold">{item.booking?.event_title ?? "예약 후기"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                의뢰인: {item.customer?.name ?? "고객"} · 다시 함께하고 싶음:{" "}
                {item.would_work_again ? "예" : "아니오"}
              </p>
              {item.comment && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                  {item.comment}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
    </div>
  );
}
