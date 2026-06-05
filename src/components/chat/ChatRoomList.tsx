"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { Pagination } from "@/components/common/Pagination";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/common/StatusBadge";
import { ChatRoom } from "@/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { MessageSquare, ChevronRight } from "lucide-react";

export function ChatRoomList({ basePath }: { basePath: "/customer/chats" | "/freelancer/chats" }) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.chatRoomsPage(page),
    queryFn: () => chatApi.getRooms({ page, limit: 10 }),
    refetchInterval: 5000,
  });

  const rooms: ChatRoom[] = data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (rooms.length === 0) {
    return <EmptyState title="상담 내역이 없습니다" description="예약 요청을 보내거나 받은 뒤 상담을 시작할 수 있습니다." />;
  }

  return (
    <>
      <div className="space-y-3">
        {rooms.map((room) => {
          const lastMessage = room.messages?.[0];
          return (
            <Link key={room.id} href={`${basePath}/${room.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        {room.booking?.booking_status && <BookingStatusBadge status={room.booking.booking_status} />}
                        {room.booking?.payment_status && <PaymentStatusBadge status={room.booking.payment_status} />}
                      </div>
                      <h2 className="truncate font-semibold">{room.booking?.event_title ?? "상담"}</h2>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {room.customer?.name} ↔ {room.freelancer?.display_name ?? "프리랜서"}
                        {room.booking?.event_date ? ` · ${formatDate(room.booking.event_date)}` : ""}
                        {room.booking?.final_price ? ` · ${formatPrice(room.booking.final_price)}` : ""}
                      </p>
                      <p className="mt-2 truncate text-sm text-muted-foreground">
                        {lastMessage?.message ?? "아직 메시지가 없습니다."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
    </>
  );
}
