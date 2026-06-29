"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { bookingApi, paymentApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LoadingState, ErrorState } from "@/components/common/States";
import { formatPrice, formatDate } from "@/lib/utils";
import { Booking } from "@/types";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";

type TossPaymentRequest = {
  method: "CARD";
  amount: { currency: "KRW"; value: number };
  orderId: string;
  orderName: string;
  successUrl: string;
  failUrl: string;
  customerEmail?: string;
  customerName?: string;
};

type TossPaymentInstance = {
  requestPayment: (request: TossPaymentRequest) => Promise<void>;
};

type TossPaymentsInstance = {
  payment: (options: { customerKey: string }) => TossPaymentInstance;
};

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
  }
}

const TOSS_PAYMENTS_SCRIPT_URL = "https://js.tosspayments.com/v2/standard";
let tossPaymentsScriptPromise: Promise<void> | null = null;

function loadTossPaymentsScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("토스페이먼츠 SDK는 브라우저에서만 사용할 수 있습니다."));
  }

  if (window.TossPayments) {
    return Promise.resolve();
  }

  if (tossPaymentsScriptPromise) {
    return tossPaymentsScriptPromise;
  }

  tossPaymentsScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${TOSS_PAYMENTS_SCRIPT_URL}"]`
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("토스페이먼츠 SDK를 불러오지 못했습니다.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = TOSS_PAYMENTS_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("토스페이먼츠 SDK를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });

  return tossPaymentsScriptPromise;
}

// 토스페이먼츠 SDK는 브라우저에서만 동적 로드합니다.
async function loadTossPayments(clientKey: string) {
  await loadTossPaymentsScript();

  if (!window.TossPayments) {
    throw new Error("토스페이먼츠 SDK 초기화에 실패했습니다.");
  }

  return window.TossPayments(clientKey);
}

export default function PaymentPage({ params }: { params: { id: string } }) {
  const bookingId = params.id;
  const router = useRouter();
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingApi.getBooking(bookingId),
  });
  const booking: Booking | undefined = data?.data?.data;

  // 이미 결제 완료된 경우 리다이렉트합니다.
  useEffect(() => {
    if (booking?.payment_status === "fully_paid") {
      router.replace("/customer/bookings");
    }
  }, [booking, router]);

  const handlePay = async () => {
    if (!booking) return;
    setIsPaying(true);
    setError("");

    try {
      // 1. 서버에서 orderId와 customerKey를 발급받습니다.
      const prepareRes = await paymentApi.prepare(bookingId);
      const { order_id, amount, order_name, client_key, customer_key } = prepareRes.data.data;
      const resolvedClientKey = client_key || process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "";

      if (!resolvedClientKey) {
        throw new Error("토스페이먼츠 클라이언트 키가 설정되지 않았습니다.");
      }

      // 2. 토스 SDK v2 결제창 인스턴스를 초기화합니다.
      const tossPayments = await loadTossPayments(resolvedClientKey);
      const payment = tossPayments.payment({ customerKey: customer_key });

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;

      // 3. 결제 요청을 시작합니다.
      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: amount,
        },
        orderId: order_id,
        orderName: order_name,
        successUrl: `${baseUrl}/customer/bookings/${bookingId}/payment/success`,
        failUrl: `${baseUrl}/customer/bookings/${bookingId}/payment/fail`,
        // customerEmail: booking.customer?.email,
        // customerName: booking.customer?.name,
      });
    } catch (err) {
      const msg = (err as Error)?.message ?? "";
      // 사용자가 결제창을 닫은 경우 조용히 처리합니다.
      if (msg.includes("PAY_PROCESS_CANCELED") || msg.includes("사용자")) {
        setError("결제를 취소하셨습니다. 다시 시도하려면 아래 버튼을 눌러주세요.");
      } else {
        setError(msg || "결제 중 오류가 발생했습니다.");
      }
      setIsPaying(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!booking) return null;

  // 결제 불가 상태 체크
  const isPayableStatus = ["payment_pending", "confirmed"].includes(booking.booking_status);
  const missingContract = !booking.contract;
  const needsContractSignature = !!booking.contract && booking.contract.status !== "fully_signed";
  const canPay = isPayableStatus &&
    booking.payment_status !== "fully_paid" &&
    !missingContract &&
    !needsContractSignature;

  return (
    <div className="animate-fade-in max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">결제하기</h1>
        <p className="text-muted-foreground text-sm mt-1">토스페이먼츠로 안전하게 결제하세요</p>
      </div>

      {/* 예약 요약 */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground font-medium">예약 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">행사명</span>
            <span className="font-medium">{booking.event_title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">행사 날짜</span>
            <span>{formatDate(booking.event_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">진행 시간</span>
            <span>{booking.start_time} ~ {booking.end_time}</span>
          </div>
          {booking.freelancer && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">진행자</span>
              <span>{booking.freelancer.display_name}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-base">
            <span>결제 금액</span>
            <span className="text-navy">{formatPrice(booking.final_price)}</span>
          </div>
          {booking.platform_fee > 0 && (
            <p className="text-xs text-muted-foreground text-right">
              플랫폼 수수료 {formatPrice(booking.platform_fee)} 포함
            </p>
          )}
        </CardContent>
      </Card>

      {/* 결제 불가 안내 */}
      {!canPay && (
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <CardContent className="pt-5 pb-5 text-sm text-amber-800">
            {!isPayableStatus
              ? "프리랜서 수락 후 상담에서 가격을 확정해야 결제할 수 있습니다."
              : missingContract
                ? "계약서가 생성된 후 결제할 수 있습니다. 가격 제안을 확정해 계약서를 먼저 생성해 주세요."
                : needsContractSignature
                  ? "계약서에 고객과 프리랜서 양측 서명이 완료된 후 결제할 수 있습니다."
                  : "이미 결제가 완료되었습니다."}
            {(missingContract || needsContractSignature) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 border-amber-300 bg-white text-amber-800 hover:bg-amber-100"
                onClick={() => router.push(`/contracts/${booking.id}`)}
              >
                계약서 확인하기
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* 오류 메시지 */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/5 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* 결제 수단 안내 */}
      <Card className="mb-6">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <p>
              결제 전 계약서 양측 전자서명을 완료해야 합니다. 토스페이먼츠 sandbox 결제로 거래 흐름을 검증하며, 결제 완료 후 대금은 플랫폼 상태값 기준으로 에스크로 보관 처리됩니다.
            </p>
          </div>
          {process.env.NODE_ENV !== "production" && (
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded border border-amber-100">
              🧪 샌드박스 모드 — 실제 결제가 이루어지지 않습니다.
            </p>
          )}
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="w-full bg-navy text-white hover:bg-navy-light gap-2"
        onClick={handlePay}
        disabled={!canPay || isPaying}
      >
        {isPaying ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            결제창 연결 중...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            {formatPrice(booking.final_price)} 결제하기
          </>
        )}
      </Button>
    </div>
  );
}
