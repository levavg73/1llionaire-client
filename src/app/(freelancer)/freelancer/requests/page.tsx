"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { formatDate, formatPrice } from "@/lib/utils";
import type { FreelancerRequestItem } from "@/lib/api-contracts";
import {
  Banknote,
  Calendar,
  CheckCircle2,
  MapPin,
  MessageSquare,
  XCircle,
} from "lucide-react";

type DeliveredBooking = NonNullable<
  NonNullable<FreelancerRequestItem["request"]>["bookings"]
>[number];

function isAcceptableBooking(booking?: DeliveredBooking) {
  return booking?.booking_status === "pending";
}

export default function FreelancerRequestsPage() {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.freelancerRequestsPage(page),
    queryFn: () => freelancerApi.getRequests({ page, limit: 10 }),
  });

  const items: FreelancerRequestItem[] = data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;

  const invalidateRelatedQueries = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.freelancerRequests });
    queryClient.invalidateQueries({ queryKey: queryKeys.freelancerRequestsPage(page) });
    queryClient.invalidateQueries({ queryKey: queryKeys.freelancerBookings });
    queryClient.invalidateQueries({ queryKey: queryKeys.chatRooms });
  };

  const acceptMutation = useMutation({
    mutationFn: (bookingId: string) => bookingApi.acceptBooking(bookingId),
    onSuccess: (response) => {
      const acceptedBooking = response.data.data;
      const chatRoomId = acceptedBooking.chat_room?.id;

      invalidateRelatedQueries();

      if (chatRoomId) {
        router.push(`/freelancer/chats/${chatRoomId}`);
        return;
      }

      router.push("/freelancer/bookings");
    },
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
          고객이 추천 후보 중에서 “이 진행자로 진행하기”를 누른 뒤,
          아직 내가 수락하지 않은 요청만 표시됩니다.
        </p>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          title="수락 대기 중인 요청이 없습니다"
          description="새 요청을 수락하면 즉시 상담방으로 이동하고, 이후 진행 건은 예약 관리에서 확인할 수 있습니다."
        />
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const request = item.request;
          const booking = request?.bookings?.[0];
          const canAccept = isAcceptableBooking(booking);
          const isAcceptingThisBooking =
            acceptMutation.isPending && acceptMutation.variables === booking?.id;
          const isRejectingThisBooking =
            rejectMutation.isPending && rejectMutation.variables === booking?.id;
          const isActionLoading = isAcceptingThisBooking || isRejectingThisBooking;

          return (
            <Card key={item.id} className="transition-shadow hover:shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        요청서 도착
                      </span>
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        수락 대기
                      </span>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        수락하면 상담 진행 중으로 전환
                      </span>
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
                    {booking && (
                      <Link href="/freelancer/bookings">
                        <Button size="sm" variant="outline" className="text-xs">
                          예약 관리
                        </Button>
                      </Link>
                    )}

                    {booking?.chat_room?.id && (
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

                    {booking && canAccept && (
                      <div className="flex gap-2 lg:flex-col">
                        <Button
                          size="sm"
                          className="bg-navy text-xs text-white hover:bg-navy-light"
                          disabled={isActionLoading}
                          onClick={() => acceptMutation.mutate(booking.id)}
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          {isAcceptingThisBooking ? "상담방 여는 중" : "수락"}
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
