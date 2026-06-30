"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi, bookingApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/common/States";
import { TransactionStatusBadge, PaymentStatusBadge } from "@/components/common/StatusBadge";
import { BookingOffer, ChatMessage, ChatRoomDetail } from "@/types";
import { cn, formatDate, formatPrice } from "@/lib/utils";

function OfferActions({
  bookingId,
  roomId,
  offer,
  canRespond,
}: {
  bookingId: string;
  roomId: string;
  offer: BookingOffer;
  canRespond: boolean;
}) {
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: () => bookingApi.acceptOffer(bookingId, offer.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatRoomMessages(roomId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chatRooms });
      queryClient.invalidateQueries({ queryKey: queryKeys.customerBookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerBookings });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => bookingApi.rejectOffer(bookingId, offer.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatRoomMessages(roomId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chatRooms });
      queryClient.invalidateQueries({ queryKey: queryKeys.customerBookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerBookings });
    },
  });

  return (
    <div className="mt-2 rounded-xl border border-line bg-surface p-3 text-sm">
      <p className="font-semibold">가격 제안: {formatPrice(offer.amount)}</p>
      {offer.message && <p className="mt-1 text-muted-foreground">{offer.message}</p>}
      <p className="mt-1 text-xs text-muted-foreground">상태: {offer.status}</p>
      {canRespond && offer.status === "pending" && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => acceptMutation.mutate()} disabled={acceptMutation.isPending}>
            수락
          </Button>
          <Button size="sm" variant="outline" onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending}>
            거절
          </Button>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message, bookingId, roomId, currentUserId }: { message: ChatMessage; bookingId: string; roomId: string; currentUserId?: string }) {
  const isMine = message.sender_id && message.sender_id === currentUserId;
  const isSystem = message.message_type === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="max-w-[90%] rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
          {message.message}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[82%] rounded-2xl px-4 py-2 text-sm", isMine ? "bg-navy text-white" : "bg-muted text-foreground")}>
        <p className="whitespace-pre-wrap break-words">{message.message}</p>
        {message.offer && (
          <OfferActions bookingId={bookingId} roomId={roomId} offer={message.offer} canRespond={message.offer.receiver_id === currentUserId} />
        )}
        <p className={cn("mt-1 text-[11px]", isMine ? "text-white/70" : "text-muted-foreground")}>
          {new Date(message.created_at).toLocaleString("ko-KR")}
        </p>
      </div>
    </div>
  );
}

export function ChatRoomView({ roomId, basePath }: { roomId: string; basePath: "/customer/chats" | "/freelancer/chats" }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.chatRoomMessages(roomId),
    queryFn: () => chatApi.getRoomMessages(roomId),
    refetchInterval: 3000,
  });

  const detail: ChatRoomDetail | undefined = data?.data?.data;
  const room = detail?.room;
  const messages = useMemo<ChatMessage[]>(() => detail?.messages ?? [], [detail?.messages]);
  const booking = room?.booking;

  useEffect(() => {
    if (!roomId) return;
    chatApi.markRoomAsRead(roomId).catch(() => undefined);
  }, [roomId, messages.length]);

  const sendMutation = useMutation({
    mutationFn: () => chatApi.sendMessage(roomId, message),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: queryKeys.chatRoomMessages(roomId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chatRooms });
    },
  });

  const offerMutation = useMutation({
    mutationFn: () =>
      bookingApi.createOffer(room?.booking_id ?? "", {
        amount: Number(offerAmount),
        message: offerMessage.trim() || undefined,
      }),
    onSuccess: () => {
      setOfferAmount("");
      setOfferMessage("");
      queryClient.invalidateQueries({ queryKey: queryKeys.chatRoomMessages(roomId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chatRooms });
      queryClient.invalidateQueries({ queryKey: queryKeys.customerBookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerBookings });
    },
  });

  const canPay =
    user?.user_type === "customer" &&
    booking &&
    ["payment_pending", "confirmed"].includes(booking.booking_status) &&
    booking.payment_status !== "fully_paid";

  if (isLoading) return <LoadingState />;
  if (isError || !detail || !room || !booking) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <Link href={basePath} className="text-sm text-muted-foreground hover:text-foreground">
          ← 상담 목록으로
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{booking.event_title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(booking.event_date)} · {formatPrice(booking.final_price)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TransactionStatusBadge booking={booking} />
            <PaymentStatusBadge status={booking.payment_status} />
            {canPay && (
              <Link href={`/customer/bookings/${booking.id}/payment`}>
                <Button size="sm" className="bg-navy text-white hover:bg-navy-light">결제하기</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="h-[520px] space-y-3 overflow-y-auto p-4">
          {messages.map((item) => (
            <MessageBubble key={item.id} message={item} bookingId={booking.id} roomId={room.id} currentUserId={user?.id} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">가격 제안</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-[180px_1fr_auto]">
          <Input
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="제안 금액"
            value={offerAmount}
            onChange={(event) => setOfferAmount(event.target.value)}
          />
          <Input
            placeholder="제안 메시지 선택 입력"
            value={offerMessage}
            onChange={(event) => setOfferMessage(event.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={!Number(offerAmount) || offerMutation.isPending}
            onClick={() => offerMutation.mutate()}
          >
            제안 보내기
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Textarea
          rows={3}
          placeholder="상담 메시지를 입력하세요"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && message.trim()) {
              sendMutation.mutate();
            }
          }}
        />
        <Button
          className="self-stretch bg-navy text-white hover:bg-navy-light"
          disabled={!message.trim() || sendMutation.isPending}
          onClick={() => sendMutation.mutate()}
        >
          전송
        </Button>
      </div>
    </div>
  );
}
