"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { AdminFreelancerRow } from "@/lib/api-contracts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FreelancerStatusBadge } from "@/components/common/StatusBadge";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { Pagination } from "@/components/common/Pagination";
import { formatPrice } from "@/lib/utils";
import type { FreelancerStatus } from "@/types";

const STATUS_TABS: { value: FreelancerStatus | ""; label: string }[] = [
  { value: "", label: "전체" },
  { value: "pending_review", label: "검수 대기" },
  { value: "approved", label: "승인 완료" },
  { value: "rejected", label: "반려" },
  { value: "draft", label: "작성 중" },
  { value: "hidden", label: "비공개" },
  { value: "suspended", label: "정지" },
];

function getFreelancerName(freelancer: AdminFreelancerRow) {
  return freelancer.display_name || freelancer.user?.name || "이름 없음";
}

function getPriceRange(freelancer: AdminFreelancerRow) {
  if (!freelancer.base_price_min && !freelancer.base_price_max) return "가격 미입력";
  if (freelancer.base_price_min && freelancer.base_price_max) {
    return `${formatPrice(freelancer.base_price_min)} ~ ${formatPrice(freelancer.base_price_max)}`;
  }
  if (freelancer.base_price_min) return `${formatPrice(freelancer.base_price_min)}~`;
  return `~${formatPrice(freelancer.base_price_max ?? 0)}`;
}

export default function AdminFreelancersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<FreelancerStatus | "">("");
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.adminFreelancersList(page, statusFilter),
    queryFn: () =>
      adminApi.getFreelancers({
        page,
        limit: 15,
        ...(statusFilter && { status: statusFilter }),
      }),
  });

  const items: AdminFreelancerRow[] = data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;

  const invalidateFreelancers = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.adminFreelancers });
    queryClient.invalidateQueries({ queryKey: queryKeys.publicFreelancers });
    queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveFreelancer(id),
    onSuccess: invalidateFreelancers,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.rejectFreelancer(id, reason),
    onSuccess: invalidateFreelancers,
  });

  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  const handleReject = (id: string) => {
    const reason = window.prompt("반려 사유를 입력해 주세요.");
    if (!reason?.trim()) return;
    rejectMutation.mutate({ id, reason: reason.trim() });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">프리랜서 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          등록 신청, 승인 완료, 반려 상태의 진행자 계정을 모두 확인합니다.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => {
              setStatusFilter(value);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === value
                ? "bg-navy text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && items.length === 0 && (
        <EmptyState title="프리랜서 계정이 없습니다" />
      )}

      <div className="space-y-3">
        {items.map((freelancer) => {
          const name = getFreelancerName(freelancer);
          const imageUrl = freelancer.profile_image_url || undefined;

          return (
            <Card key={freelancer.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-muted">
                      {imageUrl ? (
                        <Image src={imageUrl} alt={name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground">
                          {name[0] ?? "?"}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <FreelancerStatusBadge status={freelancer.status} />
                        {freelancer.region && (
                          <span className="text-xs text-muted-foreground">{freelancer.region}</span>
                        )}
                        {typeof freelancer.career_years === "number" && (
                          <span className="text-xs text-muted-foreground">
                            경력 {freelancer.career_years}년
                          </span>
                        )}
                      </div>

                      <h2 className="font-semibold">{name}</h2>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {freelancer.user?.email ?? "이메일 없음"}
                        {freelancer.user?.phone ? ` · ${freelancer.user.phone}` : ""}
                      </p>
                      {freelancer.headline && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {freelancer.headline}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{getPriceRange(freelancer)}</span>
                        <span>후기 {freelancer.review_count ?? 0}개</span>
                        {freelancer.avg_rating && <span>평점 {freelancer.avg_rating.toFixed(1)}</span>}
                        {freelancer.categories?.length > 0 && (
                          <span>{freelancer.categories.slice(0, 3).join(", ")}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2 md:justify-end">
                    {freelancer.status !== "approved" && (
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(freelancer.id)}
                        disabled={isMutating}
                      >
                        승인
                      </Button>
                    )}
                    {freelancer.status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(freelancer.id)}
                        disabled={isMutating}
                      >
                        반려
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
    </div>
  );
}
