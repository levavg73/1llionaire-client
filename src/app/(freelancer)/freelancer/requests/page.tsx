"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { freelancerApi, bookingApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/common/States";
import { Pagination } from "@/components/common/Pagination";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
  RequestStatusBadge,
} from "@/components/common/StatusBadge";
import { formatDate, formatPrice } from "@/lib/utils";
import type { FreelancerRequestItem } from "@/lib/api-contracts";
import type { BookingStatus, PaymentStatus } from "@/types";
import {
  Banknote,
  Calendar,
  CheckCircle2,
  FileText,
  MapPin,
  MessageSquare,
  XCircle,
} from "lucide-react";

function getDeliveryLabel(status: string) {
  switch (status) {
    case "selected":
      return "요청 수락 완료";
    case "consultation_requested":
      return "요청서 도착";
    default:
      return "전달됨";
  }
}

type DeliveredBooking = NonNullable<
  NonNullable<FreelancerRequestItem["request"]>["bookings"]
>[number];

function canOpenChat(booking?: DeliveredBooking) {
  return !!booking?.chat_room?.id && booking.booking_status !== "pending";
}

export default function FreelancerRequestsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.freelancerRequestsPage(page),
    queryFn: () => freelancerApi.getRequests({ page, limit: 10 }),
  });

  const items: FreelancerRequestItem[] = data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;

  const invalidateRelatedQueries = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.freelancerRequests });
    queryClient.invalidateQueries({ queryKey: queryKeys.freelancerBookings });
    queryClient.invalidateQueries({ queryKey: queryKeys.chatRooms });
  };

  const acceptMutation = useMutation({
    mutationFn: (bookingId: string) => bookingApi.acceptBooking(bookingId),
    onSuccess: invalidateRelatedQueries,
  });

  const rejectMutation = useMutation({
    mutationFn: (bookingId: string) => bookingApi.rejectBooking(bookingId),
    onSuccess: invalidateRelatedQueries,
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">전달받은 요청</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          고객이 추천 후보 중에서 “이 진행자로 진행하기”를 누른 요청만
          표시됩니다.
        </p>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          title="전달받은 요청이 없습니다"
          description="고객이 나를 진행자로 선택해 상담을 요청하면 이곳에 표시됩니다. 단순 추천 후보 상태는 노출되지 않습니다."
        />
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const request = item.request;
          const booking = request?.bookings?.[0];
          const isPendingBooking = booking?.booking_status === "pending";
          const canOpenBookingChat = canOpenChat(booking);
          const isActionLoading =
            acceptMutation.isPending || rejectMutation.isPending;

          return (
            <Card key={item.id} className="transition-shadow hover:shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {getDeliveryLabel(item.status)}
                      </span>
                      {request?.status && (
                        <RequestStatusBadge status={request.status} />
                      )}
                      {booking && (
                        <>
                          <BookingStatusBadge
                            status={booking.booking_status as BookingStatus}
                          />
                          <PaymentStatusBadge
                            status={booking.payment_status as PaymentStatus}
                          />
                        </>
                      )}
                    </div>

                    {request && (
                      <>
                        <h2 className="text-lg font-semibold leading-6">
                          {request.event_title}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {request.event_type} · {request.region}
                          {request.venue ? ` · ${request.venue}` : ""}
                        </p>

                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span>
                              {formatDate(request.event_date)} ·{" "}
                              {request.start_time} ~ {request.end_time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>
                              {request.region}
                              {request.venue ? ` · ${request.venue}` : ""}
                            </span>
                          </div>
                          {(booking?.final_price ||
                            request.budget_min ||
                            request.budget_max) && (
                            <div className="flex items-center gap-2 sm:col-span-2">
                              <Banknote className="h-4 w-4 shrink-0" />
                              <span>
                                {booking?.final_price
                                  ? `확정 요청 금액 ${formatPrice(booking.final_price)}`
                                  : `${request.budget_min ? formatPrice(request.budget_min) : ""} ~ ${request.budget_max ? formatPrice(request.budget_max) : ""}`}
                              </span>
                            </div>
                          )}
                        </div>

                        {request.description && (
                          <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted-foreground">
                            {request.description}
                          </p>
                        )}
                      </>
                    )}

                    {!booking && (
                      <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        고객 선택 기록은 확인되었지만 연결된 예약이 아직
                        조회되지 않습니다. 잠시 후 새로고침해 주세요.
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-end">
                    {canOpenBookingChat && booking?.chat_room?.id && (
                      <Link href={`/freelancer/chats/${booking.chat_room.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          상담 확인
                        </Button>
                      </Link>
                    )}

                    {booking && isPendingBooking && (
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                        수락하면 상담방이 열립니다
                      </span>
                    )}

                    {booking && (
                      <Link href="/freelancer/bookings">
                        <Button size="sm" variant="outline" className="text-xs">
                          예약 관리
                        </Button>
                      </Link>
                    )}

                    {booking?.contract && (
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

                    {booking && isPendingBooking && (
                      <div className="flex gap-2 lg:flex-col">
                        <Button
                          size="sm"
                          className="bg-navy text-xs text-white hover:bg-navy-light"
                          disabled={isActionLoading}
                          onClick={() => acceptMutation.mutate(booking.id)}
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          수락
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          disabled={isActionLoading}
                          onClick={() => rejectMutation.mutate(booking.id)}
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" />
                          거절
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {pagination && (
        <Pagination pagination={pagination} onPageChange={setPage} />
      )}
    </div>
  );
}
