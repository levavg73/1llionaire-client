"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestStatusBadge, FreelancerStatusBadge } from "@/components/common/StatusBadge";
import { LoadingState, ErrorState } from "@/components/common/States";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { ArrowLeft, Plus } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";
import { EventRequest, RequestStatus, FreelancerProfile } from "@/types";

interface RequestDetail extends Omit<EventRequest, "recommendations"> {
  customer?: { id: string; name: string; email: string; phone?: string };
  recommendations?: Array<{ id: string; display_order: number; recommendation_reason?: string; freelancer: FreelancerProfile; status?: string; request_id?: string; freelancer_id?: string; recommended_by?: string }>;
}

const REQUEST_STATUSES: { value: RequestStatus; label: string }[] = [
  { value: "submitted",    label: "접수 완료" },
  { value: "reviewing",    label: "검토 중" },
  { value: "recommending", label: "후보 선정 중" },
  { value: "recommended",  label: "추천 완료" },
  { value: "consulting",   label: "상담 진행 중" },
  { value: "booked",       label: "예약 완료" },
  { value: "completed",    label: "행사 완료" },
  { value: "canceled",     label: "취소" },
];

export default function AdminRequestDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const queryClient = useQueryClient();

  const [showRecommendForm, setShowRecommendForm] = useState(false);
  const [recForm, setRecForm] = useState({ freelancer_id: "", recommendation_reason: "", display_order: 1 });
  const [statusConfirm, setStatusConfirm] = useState<RequestStatus | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.adminRequest(id),
    queryFn: () => adminApi.getRequest(id),
  });
  const req: RequestDetail | undefined = data?.data?.data;

  // 승인된 프리랜서 목록
  const { data: freelancerData } = useQuery({
    queryKey: queryKeys.adminFreelancersApproved,
    queryFn: () => adminApi.getFreelancers({ status: "approved", limit: 100 }),
    enabled: showRecommendForm,
  });
  const approvedFreelancers: FreelancerProfile[] = freelancerData?.data?.data?.items ?? [];

  const statusMutation = useMutation({
    mutationFn: (status: RequestStatus) => adminApi.updateRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminRequest(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      setStatusConfirm(null);
    },
  });

  const recommendMutation = useMutation({
    mutationFn: (data: typeof recForm & { request_id: string }) =>
      adminApi.createRecommendation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminRequest(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations(id) });
      setShowRecommendForm(false);
      setRecForm({ freelancer_id: "", recommendation_reason: "", display_order: 1 });
    },
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!req) return null;

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/requests">
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
        {/* 행사 정보 */}
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground font-medium">행사 정보</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-muted-foreground">고객</p><p className="font-medium">{req.customer?.name} ({req.customer?.email})</p></div>
            <div><p className="text-muted-foreground">행사 날짜</p><p className="font-medium">{formatDate(req.event_date)}</p></div>
            <div><p className="text-muted-foreground">지역/장소</p><p className="font-medium">{req.region}{req.venue && ` · ${req.venue}`}</p></div>
            <div><p className="text-muted-foreground">진행 시간</p><p className="font-medium">{req.start_time} ~ {req.end_time}</p></div>
            {(req.budget_min || req.budget_max) && (
              <div><p className="text-muted-foreground">예산</p><p className="font-medium">{req.budget_min ? formatPrice(req.budget_min) : ""} ~ {req.budget_max ? formatPrice(req.budget_max) : ""}</p></div>
            )}
          </CardContent>
        </Card>

        {/* 상태 변경 */}
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground font-medium">상태 변경</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {REQUEST_STATUSES.map(({ value, label }) => (
                <button
                  key={value}
                  disabled={req.status === value}
                  onClick={() => setStatusConfirm(value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    req.status === value
                      ? "bg-navy text-white border-navy"
                      : "border-border hover:border-navy hover:text-navy"
                  } disabled:opacity-100`}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 추천 후보 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground font-medium">추천 후보</CardTitle>
            <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => setShowRecommendForm(true)}>
              <Plus className="h-3.5 w-3.5" /> 후보 추천
            </Button>
          </CardHeader>
          <CardContent>
            {(!req.recommendations || req.recommendations.length === 0) ? (
              <p className="text-sm text-muted-foreground">추천된 후보가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {req.recommendations.map((rec) => (
                  <div key={rec.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <span className="text-xs font-bold text-gold bg-gold/10 px-2 py-1 rounded-full shrink-0">#{rec.display_order}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{rec.freelancer.display_name}</p>
                        <FreelancerStatusBadge status={rec.freelancer.status} />
                      </div>
                      {rec.recommendation_reason && (
                        <p className="text-xs text-muted-foreground mt-1">{rec.recommendation_reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showRecommendForm && (
              <div className="mt-4 p-4 border rounded-lg space-y-3 bg-muted/30">
                <p className="text-sm font-medium">후보 추천 추가</p>
                <div className="space-y-1.5">
                  <Label className="text-xs">프리랜서 선택 (승인된 진행자만)</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={recForm.freelancer_id}
                    onChange={(e) => setRecForm((f) => ({ ...f, freelancer_id: e.target.value }))}
                    aria-label="프리랜서 선택"
                  >
                    <option value="">선택하세요</option>
                    {approvedFreelancers.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.display_name} ({f.region} · {f.career_years}년)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">표시 순서</Label>
                  <Input
                    type="number" min={1} max={10}
                    value={recForm.display_order}
                    onChange={(e) => setRecForm((f) => ({ ...f, display_order: parseInt(e.target.value) || 1 }))}
                    className="w-24"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">추천 사유</Label>
                  <Textarea
                    rows={2}
                    placeholder="이 진행자를 추천하는 이유를 입력하세요"
                    value={recForm.recommendation_reason}
                    onChange={(e) => setRecForm((f) => ({ ...f, recommendation_reason: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm" className="bg-navy text-white hover:bg-navy-light"
                    disabled={!recForm.freelancer_id || recommendMutation.isPending}
                    onClick={() => recommendMutation.mutate({ ...recForm, request_id: id })}
                  >
                    {recommendMutation.isPending ? "추가 중..." : "추가"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowRecommendForm(false)}>취소</Button>
                </div>
                {recommendMutation.isError && (
                  <p className="text-xs text-destructive">오류가 발생했습니다. 다시 시도해 주세요.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmModal
        open={statusConfirm !== null}
        onOpenChange={(o) => !o && setStatusConfirm(null)}
        title="상태 변경"
        description={`요청서 상태를 "${REQUEST_STATUSES.find((s) => s.value === statusConfirm)?.label}"으로 변경하시겠습니까?`}
        confirmLabel="변경"
        onConfirm={() => statusConfirm && statusMutation.mutate(statusConfirm)}
        isLoading={statusMutation.isPending}
      />
    </div>
  );
}
