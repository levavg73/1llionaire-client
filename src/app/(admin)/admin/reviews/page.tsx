"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewStatusBadge } from "@/components/common/StatusBadge";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { Star } from "lucide-react";
import { ReviewStatus, REVIEW_STATUS_LABEL } from "@/types";

const REVIEW_STATUSES: ReviewStatus[] = ["pending", "published", "hidden", "reported"];

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<ReviewStatus | "">("");
  const [confirm, setConfirm] = useState<{ id: string; value: ReviewStatus } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.adminReviewsList(page, filter),
    queryFn: () => adminApi.getReviews({ page, limit: 15, ...(filter && { status: filter }) }),
  });

  const items = data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReviewStatus }) =>
      adminApi.updateReview(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReviews });
      queryClient.invalidateQueries({ queryKey: queryKeys.myReviews });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicFreelancers });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      setConfirm(null);
    },
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-6"><h1 className="text-2xl font-bold">후기 관리</h1></div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {([{ value: "", label: "전체" }, ...REVIEW_STATUSES.map((s) => ({ value: s, label: REVIEW_STATUS_LABEL[s] }))] as { value: ReviewStatus | ""; label: string }[]).map(({ value, label }) => (
          <button key={value} onClick={() => { setFilter(value); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === value ? "bg-navy text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && items.length === 0 && <EmptyState title="후기가 없습니다" />}

      <div className="space-y-3">
        {items.map((item: { id: string; total_score: number; comment?: string; status: ReviewStatus; customer?: { name: string }; freelancer?: { display_name?: string }; booking?: { event_title: string } }) => (
          <Card key={item.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <ReviewStatusBadge status={item.status} />
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                      {item.total_score.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{item.booking?.event_title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.customer?.name} → {item.freelancer?.display_name}
                  </p>
                  {item.comment && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.comment}</p>
                  )}
                </div>
                <select
                  className="h-8 px-2 rounded-md border border-input bg-background text-xs shrink-0"
                  value={item.status}
                  onChange={(e) => setConfirm({ id: item.id, value: e.target.value as ReviewStatus })}
                  aria-label="후기 상태 변경"
                >
                  {REVIEW_STATUSES.map((s) => <option key={s} value={s}>{REVIEW_STATUS_LABEL[s]}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}

      <ConfirmModal
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="후기 상태 변경"
        description={`상태를 "${confirm ? REVIEW_STATUS_LABEL[confirm.value] : ""}"으로 변경하시겠습니까?`}
        confirmLabel="변경"
        onConfirm={() => confirm && mutation.mutate({ id: confirm.id, status: confirm.value })}
        isLoading={mutation.isPending}
      />
    </div>
  );
}
