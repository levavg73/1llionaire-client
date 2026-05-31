"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentStatusBadge } from "@/components/common/StatusBadge";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { formatDate, formatPrice } from "@/lib/utils";
import { PaymentStatus, PAYMENT_STATUS_LABEL } from "@/types";

const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "deposit_paid", "fully_paid", "refunded", "failed"];

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<PaymentStatus | "">("");
  const [confirm, setConfirm] = useState<{ id: string; value: PaymentStatus } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.adminPaymentsList(page, filter),
    queryFn: () => adminApi.getPayments({ page, limit: 15, ...(filter && { payment_status: filter }) }),
  });

  const items = data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PaymentStatus }) =>
      adminApi.updatePayment(id, { payment_status: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPayments });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      setConfirm(null);
    },
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-6"><h1 className="text-2xl font-bold">결제 관리</h1></div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {([{ value: "", label: "전체" }, ...PAYMENT_STATUSES.map((s) => ({ value: s, label: PAYMENT_STATUS_LABEL[s] }))] as { value: PaymentStatus | ""; label: string }[]).map(({ value, label }) => (
          <button key={value} onClick={() => { setFilter(value); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === value ? "bg-navy text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && items.length === 0 && <EmptyState title="결제 내역이 없습니다" />}

      <div className="space-y-3">
        {items.map((item: { id: string; event_title: string; event_date: string; final_price: number; payment_status: PaymentStatus; customer?: { name: string }; freelancer?: { display_name?: string } }) => (
          <Card key={item.id}>
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-1"><PaymentStatusBadge status={item.payment_status} /></div>
                <h2 className="font-semibold truncate">{item.event_title}</h2>
                <p className="text-sm text-muted-foreground">
                  {item.customer?.name} · {formatDate(item.event_date)} · {formatPrice(item.final_price)}
                </p>
              </div>
              <select
                className="h-8 px-2 rounded-md border border-input bg-background text-xs shrink-0"
                value={item.payment_status}
                onChange={(e) => setConfirm({ id: item.id, value: e.target.value as PaymentStatus })}
                aria-label="결제 상태 변경"
              >
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{PAYMENT_STATUS_LABEL[s]}</option>)}
              </select>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}

      <ConfirmModal
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="결제 상태 변경"
        description={`상태를 "${confirm ? PAYMENT_STATUS_LABEL[confirm.value] : ""}"으로 변경하시겠습니까?`}
        confirmLabel="변경"
        onConfirm={() => confirm && mutation.mutate({ id: confirm.id, status: confirm.value })}
        isLoading={mutation.isPending}
      />
    </div>
  );
}
