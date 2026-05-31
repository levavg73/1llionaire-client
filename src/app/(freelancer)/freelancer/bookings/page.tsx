"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent } from "@/components/ui/card";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/common/StatusBadge";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { Pagination } from "@/components/common/Pagination";
import { formatDate, formatPrice } from "@/lib/utils";
import { Booking } from "@/types";

export default function FreelancerBookingsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.freelancerBookingsPage(page),
    queryFn: () => bookingApi.getBookings({ page, limit: 10 }),
  });
  const items: Booking[] = data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">예약 관리</h1>
      </div>
      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && items.length === 0 && <EmptyState title="예약이 없습니다" />}
      <div className="space-y-3">
        {items.map((b) => (
          <Card key={b.id}>
            <CardContent className="p-5">
              <div className="flex flex-wrap gap-2 mb-2">
                <BookingStatusBadge status={b.booking_status} />
                <PaymentStatusBadge status={b.payment_status} />
              </div>
              <h2 className="font-semibold">{b.event_title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{formatDate(b.event_date)} · {formatPrice(b.freelancer_amount)} (정산 예정)</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
    </div>
  );
}
