"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestStatusBadge } from "@/components/common/StatusBadge";
import { LoadingState, ErrorState } from "@/components/common/States";
import { ArrowLeft, Users, Calendar, MapPin, Banknote } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";
import { EventRequest } from "@/types";

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.customerRequest(id),
    queryFn: () => customerApi.getRequest(id),
  });

  const req: EventRequest | undefined = data?.data?.data;

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!req) return null;

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/customer/requests">
          <Button variant="ghost" size="icon" aria-label="뒤로가기"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <RequestStatusBadge status={req.status} />
          </div>
          <h1 className="text-xl font-bold truncate">{req.event_title}</h1>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground font-medium">행사 정보</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex gap-2"><Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-muted-foreground">날짜</p><p className="font-medium">{formatDate(req.event_date)}</p></div></div>
            <div className="flex gap-2"><MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-muted-foreground">지역/장소</p><p className="font-medium">{req.region}{req.venue && ` · ${req.venue}`}</p></div></div>
            {(req.budget_min || req.budget_max) && (
              <div className="flex gap-2"><Banknote className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-muted-foreground">예산</p><p className="font-medium">{req.budget_min ? formatPrice(req.budget_min) : ""}  ~ {req.budget_max ? formatPrice(req.budget_max) : ""}</p></div></div>
            )}
            <div><p className="text-muted-foreground">진행 시간</p><p className="font-medium">{req.start_time} ~ {req.end_time}</p></div>
          </CardContent>
        </Card>

        {req.description && (
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground font-medium">요청사항</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-relaxed">{req.description}</p></CardContent>
          </Card>
        )}

        {/* 추천 후보 버튼 */}
        {["recommended", "consulting", "booked", "completed"].includes(req.status) && (
          <Link href={`/customer/requests/${id}/recommendations`}>
            <Button className="w-full gap-2 bg-navy text-white hover:bg-navy-light">
              <Users className="h-4 w-4" />
              AI 추천 후보 확인하기
            </Button>
          </Link>
        )}

        {req.status === "submitted" || req.status === "reviewing" ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6 text-sm text-amber-800">
              <p className="font-medium">AI가 후보를 매칭 중입니다</p>
              <p className="mt-1 text-amber-700">추천 후보가 준비되면 문자와 이메일로 즉시 알림을 발송합니다. (예상 소요시간: 3시간)</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
