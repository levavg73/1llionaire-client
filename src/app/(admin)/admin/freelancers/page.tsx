"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FreelancerStatusBadge } from "@/components/common/StatusBadge";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { Check, X } from "lucide-react";
import { FreelancerProfile } from "@/types";

interface FreelancerRow extends FreelancerProfile {
  user?: { id: string; name: string; email: string; phone?: string };
}

export default function AdminFreelancersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [confirm, setConfirm] = useState<{ type: "approve" | "reject"; id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.adminFreelancersList(page, statusFilter),
    queryFn: () => adminApi.getFreelancers({ page, limit: 15, ...(statusFilter && { status: statusFilter }) }),
  });

  const items: FreelancerRow[] = data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveFreelancer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminFreelancers });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicFreelancers });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      setConfirm(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.rejectFreelancer(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminFreelancers });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicFreelancers });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      setConfirm(null);
      setRejectReason("");
    },
  });

  const STATUS_TABS = [
    { value: "", label: "전체" },
    { value: "pending_review", label: "검수 대기" },
    { value: "approved", label: "승인" },
    { value: "rejected", label: "반려" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">프리랜서 관리</h1>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
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
      {!isLoading && !isError && items.length === 0 && <EmptyState title="프리랜서가 없습니다" />}

      <div className="space-y-3">
        {items.map((f) => (
          <Card key={f.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FreelancerStatusBadge status={f.status} />
                  </div>
                  <p className="font-semibold">{f.display_name || "—"}</p>
                  <p className="text-sm text-muted-foreground">
                    {f.user?.name} · {f.user?.email}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {f.categories.map((c) => (
                      <span key={c} className="text-xs bg-muted px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>

                {f.status === "pending_review" && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm" variant="outline"
                      className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1"
                      onClick={() => setConfirm({ type: "approve", id: f.id, name: f.display_name || f.user?.name || "" })}
                    >
                      <Check className="h-3.5 w-3.5" /> 승인
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/5 gap-1"
                      onClick={() => setConfirm({ type: "reject", id: f.id, name: f.display_name || f.user?.name || "" })}
                    >
                      <X className="h-3.5 w-3.5" /> 반려
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}

      {/* 승인 확인 모달 */}
      <ConfirmModal
        open={confirm?.type === "approve"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`${confirm?.name} 승인`}
        description="승인하면 공개 목록에 즉시 노출됩니다. 계속하시겠습니까?"
        confirmLabel="승인"
        onConfirm={() => confirm && approveMutation.mutate(confirm.id)}
        isLoading={approveMutation.isPending}
      />

      {/* 반려 확인 모달 */}
      <ConfirmModal
        open={confirm?.type === "reject"}
        onOpenChange={(o) => { if (!o) { setConfirm(null); setRejectReason(""); } }}
        title={`${confirm?.name} 반려`}
        description={
          <div className="space-y-2 pt-1">
            <p className="text-sm text-muted-foreground">반려 사유를 입력해 주세요.</p>
            <Input
              placeholder="반려 사유"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div> as unknown as string
        }
        confirmLabel="반려"
        variant="destructive"
        onConfirm={() => confirm && rejectMutation.mutate({ id: confirm.id, reason: rejectReason })}
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}
