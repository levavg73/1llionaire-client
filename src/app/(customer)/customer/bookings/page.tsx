"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TransactionStatusBadge,
  PaymentStatusBadge,
  EscrowStatusBadge,
} from "@/components/common/StatusBadge";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/common/States";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { Pagination } from "@/components/common/Pagination";
import { FileText, MessageSquare } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";

const contractVisibleStatuses: BookingStatus[] = [
  "payment_pending",
  "confirmed",
  "completion_requested",
  "completed",
];

function canViewContract(status: BookingStatus) {
  return contractVisibleStatuses.includes(status);
}

function canCompleteBooking(booking: Booking) {
  return (
    booking.payment_status === "fully_paid" &&
    (booking.booking_status === "confirmed" ||
      booking.booking_status === "completion_requested")
  );
}

function needsContractSignature(booking: Booking) {
  return !!booking.contract && booking.contract.status !== "fully_signed";
}

function canPayBooking(booking: Booking) {
  return (
    ["payment_pending", "confirmed"].includes(booking.booking_status) &&
    booking.payment_status !== "fully_paid" &&
    !needsContractSignature(booking)
  );
}

export default function CustomerBookingsPage() {
  const [page, setPage] = useState(1);
  const [completeTarget, setCompleteTarget] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: (bookingId: string) => bookingApi.completeBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customerBookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerBookings });
      setCompleteTarget(null);
    },
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.customerBookingsPage(page),
    queryFn: () => bookingApi.getBookings({ page, limit: 10 }),
  });

  const items: Booking[] = data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;
  const selectedBooking =
    items.find((booking) => booking.id === completeTarget) ?? null;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">내 예약</h1>
        <p className="text-muted-foreground text-sm mt-1">
          예약 현황과 결제 상태를 확인하세요
        </p>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          title="예약 내역이 없습니다"
          description="진행자를 섭외하면 예약이 생성됩니다"
        />
      )}

      <div className="space-y-3">
        {items.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <TransactionStatusBadge booking={booking} />
                    <PaymentStatusBadge status={booking.payment_status} />
                    {booking.escrow_status && (
                      <EscrowStatusBadge status={booking.escrow_status} />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(booking.event_date)}
                    </span>
                  </div>

                  <h2 className="font-semibold truncate">
                    {booking.event_title}
                  </h2>

                  {booking.freelancer && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      진행자: {booking.freelancer.display_name}
                    </p>
                  )}

                  <p className="text-sm font-medium mt-1">
                    {formatPrice(booking.final_price)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {booking.chat_room &&
                    booking.booking_status !== "pending" && (
                      <Link href={`/customer/chats/${booking.chat_room.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          상담하기
                        </Button>
                      </Link>
                    )}

                  {booking.booking_status === "pending" && (
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                      진행자 응답 대기
                    </span>
                  )}

                  {canViewContract(booking.booking_status) && (
                    <Link href={`/contracts/${booking.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        계약서
                      </Button>
                    </Link>
                  )}

                  {needsContractSignature(booking) && (
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                      계약 서명 후 결제 가능
                    </span>
                  )}

                  {canPayBooking(booking) && (
                    <Link href={`/customer/bookings/${booking.id}/payment`}>
                      <Button
                        size="sm"
                        className="text-xs bg-navy text-white hover:bg-navy-light"
                      >
                        결제하기
                      </Button>
                    </Link>
                  )}

                  {canCompleteBooking(booking) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      disabled={completeMutation.isPending}
                      onClick={() => setCompleteTarget(booking.id)}
                    >
                      {booking.booking_status === "completion_requested"
                        ? "완료 요청 승인"
                        : "행사 완료 확인"}
                    </Button>
                  )}

                  {booking.booking_status === "completed" && (
                    <Link
                      href={`/customer/reviews/new?bookingId=${booking.id}`}
                    >
                      <Button size="sm" variant="outline" className="text-xs">
                        후기 작성
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination && (
        <Pagination pagination={pagination} onPageChange={setPage} />
      )}

      <ConfirmModal
        open={completeTarget !== null}
        onOpenChange={(open) => !open && setCompleteTarget(null)}
        title={
          selectedBooking?.booking_status === "completion_requested"
            ? "완료 요청을 승인하시겠습니까?"
            : "행사 완료를 확인하시겠습니까?"
        }
        description="행사가 정상적으로 완료되었나요? 완료 처리 후 에스크로 정산이 진행됩니다."
        confirmLabel="완료 확인"
        onConfirm={() =>
          completeTarget && completeMutation.mutate(completeTarget)
        }
        isLoading={completeMutation.isPending}
      />
    </div>
  );
}
