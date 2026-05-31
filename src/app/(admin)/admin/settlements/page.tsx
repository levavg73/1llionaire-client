"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent } from "@/components/ui/card";
import { SettlementStatusBadge } from "@/components/common/StatusBadge";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { formatDate, formatPrice } from "@/lib/utils";
import { SettlementStatus, SETTLEMENT_STATUS_LABEL } from "@/types";

const SETTLEMENT_STATUSES: SettlementStatus[] = ["pending", "scheduled", "completed", "held", "failed"];

export default function AdminSettlementsPage() {
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: string; value: SettlementStatus } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.adminSettlementsPage(page),
    queryFn: () => adminApi.getSettlements({ page, limit: 15 }),
  });

  const items = data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SettlementStatus }) =>
      adminApi.updateSettlement(id, { settlement_status: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSettlements });
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerSettlements });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      setConfirm(null);
    },
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-6"><h1 className="text-2xl font-bold">정산 관리</h1></div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && items.length === 0 && <EmptyState title="정산 내역이 없습니다" />}

      <div className="space-y-3">
        {items.map((item: { id: string; event_title: string; event_date: string; freelancer_amount: number; settlement_status: SettlementStatus; freelancer?: { display_name?: string } }) => (
          <Card key={item.id}>
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-1"><SettlementStatusBadge status={item.settlement_status} /></div>
                <h2 className="font-semibold truncate">{item.event_title}</h2>
                <p className="text-sm text-muted-foreground">
                  {item.freelancer?.display_name} · {formatDate(item.event_date)}
                </p>
                <p className="text-sm font-medium mt-1">{formatPrice(item.freelancer_amount)}</p>
              </div>
              <select
                className="h-8 px-2 rounded-md border border-input bg-background text-xs shrink-0"
                value={item.settlement_status}
                onChange={(e) => setConfirm({ id: item.id, value: e.target.value as SettlementStatus })}
                aria-label="정산 상태 변경"
              >
                {SETTLEMENT_STATUSES.map((s) => <option key={s} value={s}>{SETTLEMENT_STATUS_LABEL[s]}</option>)}
              </select>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}

      <ConfirmModal
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="정산 상태 변경"
        description={`상태를 "${confirm ? SETTLEMENT_STATUS_LABEL[confirm.value] : ""}"으로 변경하시겠습니까?`}
        confirmLabel="변경"
        onConfirm={() => confirm && mutation.mutate({ id: confirm.id, status: confirm.value })}
        isLoading={mutation.isPending}
      />
    </div>
  );
}
