"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ContractPanel } from "@/components/contracts/ContractPanel";
import { LoadingState, ErrorState } from "@/components/common/States";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge, PaymentStatusBadge, EscrowStatusBadge } from "@/components/common/StatusBadge";
import { formatDate, formatPrice } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default function ContractPage({ params }: { params: { bookingId: string } }) {
  const bookingId = params.bookingId;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingApi.getBooking(bookingId),
  });

  const booking = data?.data?.data;

  return (
    <ProtectedRoute>
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="#" onClick={(event) => { event.preventDefault(); history.back(); }}>
            <Button variant="ghost" size="icon" aria-label="뒤로가기">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">계약서</h1>
            <p className="text-sm text-muted-foreground">결제 전 계약서를 확인하고 양측 전자서명을 진행하세요.</p>
          </div>
        </div>

        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {booking && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">예약 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <BookingStatusBadge status={booking.booking_status} />
                  <PaymentStatusBadge status={booking.payment_status} />
                  {booking.escrow_status && <EscrowStatusBadge status={booking.escrow_status} />}
                </div>
                <div>
                  <p className="text-muted-foreground">행사명</p>
                  <p className="font-semibold">{booking.event_title}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">행사 날짜</p>
                    <p className="font-medium">{formatDate(booking.event_date)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">계약 금액</p>
                    <p className="font-medium">{formatPrice(booking.final_price)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ContractPanel bookingId={booking.id} bookingStatus={booking.booking_status} />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
