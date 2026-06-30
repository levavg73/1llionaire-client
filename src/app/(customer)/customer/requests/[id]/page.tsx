"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/api";
import { customerApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestStatusBadge } from "@/components/common/StatusBadge";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { LoadingState, ErrorState } from "@/components/common/States";
import { ArrowLeft, Users, Calendar, MapPin, Banknote, Clock, Globe2, FileText, Activity, Plane, Pencil, Trash2 } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";
import { EventRequest, RequestStatus } from "@/types";
import { PricingAnalysisCard } from "@/components/ai/PricingAnalysisCard";

const EDITABLE_REQUEST_STATUSES: RequestStatus[] = ["submitted", "reviewing", "recommending", "recommended"];
const CANCELABLE_REQUEST_STATUSES: RequestStatus[] = ["submitted", "reviewing", "recommending", "recommended", "consulting"];

function ChipList({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return <span className="text-muted-foreground">미지정</span>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
          {item}
        </span>
      ))}
    </div>
  );
}

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.customerRequest(id),
    queryFn: () => customerApi.getRequest(id),
  });

  const req: EventRequest | undefined = data?.data?.data;
  const canEdit = req ? EDITABLE_REQUEST_STATUSES.includes(req.status) : false;
  const canCancel = req ? CANCELABLE_REQUEST_STATUSES.includes(req.status) : false;

  const cancelMutation = useMutation({
    mutationFn: () => customerApi.deleteRequest(id),
    onSuccess: async () => {
      setCancelOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.customerRequests }),
        queryClient.invalidateQueries({ queryKey: queryKeys.customerRequest(id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.recommendations(id) }),
      ]);
      router.push("/customer/requests");
    },
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!req) return null;

  const directRequestRecommendation = req.recommendations?.find((recommendation) =>
    recommendation.status === "consultation_requested"
  );
  const isDirectFreelancerRequest = Boolean(directRequestRecommendation);
  const recommendationReady =
    !isDirectFreelancerRequest &&
    ["recommended", "consulting", "booked", "completed", "reviewed"].includes(req.status);
  const matchingInProgress =
    !isDirectFreelancerRequest &&
    ["submitted", "reviewing", "recommending"].includes(req.status);
  const cancelErrorMessage = (cancelMutation.error as ApiError<{error:{message:string}}> | null)?.response?.data?.error?.message;

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
        {(canEdit || canCancel) && (
          <div className="flex shrink-0 items-center gap-2">
            {canEdit && (
              <Link href={`/customer/requests/${id}/edit`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  수정
                </Button>
              </Link>
            )}
            {canCancel && (
              <Button variant="outline" size="sm" className="gap-1.5 text-destructive" onClick={() => setCancelOpen(true)}>
                <Trash2 className="h-3.5 w-3.5" />
                취소
              </Button>
            )}
          </div>
        )}
      </div>

      {cancelMutation.isError && (
        <p role="alert" className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2 mb-4">
          {cancelErrorMessage || "요청서 취소 중 오류가 발생했습니다."}
        </p>
      )}

      <div className="grid gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground font-medium">행사 정보</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex gap-2"><Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-muted-foreground">날짜</p><p className="font-medium">{formatDate(req.event_date)}</p></div></div>
            <div className="flex gap-2"><Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-muted-foreground">진행 시간</p><p className="font-medium">{req.start_time} ~ {req.end_time}</p></div></div>
            <div className="flex gap-2"><MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-muted-foreground">지역/장소</p><p className="font-medium">{req.region}{req.venue && ` · ${req.venue}`}</p></div></div>
            {(req.budget_min || req.budget_max) && (
              <div className="flex gap-2"><Banknote className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-muted-foreground">예산</p><p className="font-medium">{req.budget_min ? formatPrice(req.budget_min) : ""} ~ {req.budget_max ? formatPrice(req.budget_max) : ""}</p></div></div>
            )}
            {req.required_language && (
              <div className="flex gap-2"><Globe2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-muted-foreground">필요 언어</p><p className="font-medium">{req.required_language}</p></div></div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground font-medium">희망 진행자 조건</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="mb-1.5 text-muted-foreground">희망 진행자 유형</p>
              <ChipList items={req.preferred_freelancer_type} />
            </div>
            <div>
              <p className="mb-1.5 text-muted-foreground">원하는 진행 분위기</p>
              <ChipList items={req.preferred_styles} />
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { icon: FileText, label: "대본", active: req.script_required },
                { icon: Activity, label: "리허설", active: req.rehearsal_required },
                { icon: Plane, label: "출장", active: req.travel_required },
              ].map(({ icon: Icon, label, active }) => (
                <div key={label} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className={active ? "font-medium text-foreground" : "text-muted-foreground"}>
                    {label} {active ? "필요" : "불필요"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <PricingAnalysisCard request={req} />

        {req.description && (
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground font-medium">요청사항</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-relaxed whitespace-pre-line">{req.description}</p></CardContent>
          </Card>
        )}

        {isDirectFreelancerRequest && directRequestRecommendation?.freelancer ? (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="pt-6 text-sm text-emerald-800">
              <p className="font-medium">
                {directRequestRecommendation.freelancer.display_name ?? "지명한 진행자"}님에게 요청서를 전달했습니다
              </p>
              <p className="mt-1 text-emerald-700">
                진행자가 수락하면 상담방이 열립니다. 응답 상태는 예약 현황에서 확인할 수 있습니다.
              </p>
              <Link href="/customer/bookings" className="mt-4 block">
                <Button variant="outline" className="w-full bg-white">
                  예약 현황 보기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : null}

        {recommendationReady && (
          <Link href={`/customer/requests/${id}/recommendations`}>
            <Button className="w-full gap-2 bg-navy text-white hover:bg-navy-light">
              <Users className="h-4 w-4" />
              추천 후보 확인하기
            </Button>
          </Link>
        )}

        {matchingInProgress ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6 text-sm text-amber-800">
              <p className="font-medium">후보를 찾고 있습니다</p>
              <p className="mt-1 text-amber-700">요청 조건과 승인된 진행자 포트폴리오를 비교해 맞춤 후보를 추천합니다.</p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <ConfirmModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="요청서를 취소할까요?"
        description="취소하면 추천 후보와 진행 중인 상담 요청이 함께 정리됩니다. 이 작업은 되돌릴 수 없습니다."
        confirmLabel="요청서 취소"
        cancelLabel="유지하기"
        variant="destructive"
        isLoading={cancelMutation.isPending}
        onConfirm={() => cancelMutation.mutate()}
      />
    </div>
  );
}
