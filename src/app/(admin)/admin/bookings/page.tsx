"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent } from "@/components/ui/card";
import { BookingStatusBadge, PaymentStatusBadge, SettlementStatusBadge } from "@/components/common/StatusBadge";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { formatDate, formatPrice } from "@/lib/utils";
import { Booking, BookingStatus } from "@/types";

const BOOKING_STATUSES: BookingStatus[] = ["pending", "confirmed", "completed", "canceled", "disputed"];
const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "예약 대기", confirmed: "예약 확정", completed: "행사 완료",
  canceled: "취소", disputed: "분쟁",
};

export default function AdminBookingsPage() {
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ bookingId: string; field: "booking_status"; value: BookingStatus } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.adminBookingsPage(page),
    queryFn: () => adminApi.getBookings({ page, limit: 15 }),
  });

  const items: (Booking & { customer?: { name: string; email: string }; freelancer?: { display_name?: string } })[] =
    data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => adminApi.updateBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminBookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.customerBookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerBookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      setConfirm(null);
    },
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-6"><h1 className="text-2xl font-bold">예약 관리</h1></div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && items.length === 0 && <EmptyState title="예약이 없습니다" />}

      <div className="space-y-3">
        {items.map((b) => (
          <Card key={b.id}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4 justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <BookingStatusBadge status={b.booking_status} />
                    <PaymentStatusBadge status={b.payment_status} />
                    <SettlementStatusBadge status={b.settlement_status} />
                  </div>
                  <h2 className="font-semibold">{b.event_title}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {b.customer?.name} → {b.freelancer?.display_name} · {formatDate(b.event_date)} · {formatPrice(b.final_price)}
                  </p>
                </div>
                {/* 상태 변경 select */}
                <select
                  className="h-8 px-2 rounded-md border border-input bg-background text-xs shrink-0"
                  value={b.booking_status}
                  onChange={(e) =>
                    setConfirm({ bookingId: b.id, field: "booking_status", value: e.target.value as BookingStatus })
                  }
                  aria-label="예약 상태 변경"
                >
                  {BOOKING_STATUSES.map((s) => (
                    <option key={s} value={s}>{BOOKING_STATUS_LABEL[s]}</option>
                  ))}
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
        title="예약 상태 변경"
        description={`상태를 "${confirm ? BOOKING_STATUS_LABEL[confirm.value] : ""}"으로 변경하시겠습니까?`}
        confirmLabel="변경"
        onConfirm={() => confirm && mutation.mutate({ id: confirm.bookingId, data: { booking_status: confirm.value } })}
        isLoading={mutation.isPending}
      />
    </div>
  );
}
