"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/api";
import { customerApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/common/States";
import { RequestForm, type RequestFormValues } from "@/components/customer/RequestForm";
import type { EventRequest, RequestStatus } from "@/types";
import { ArrowLeft } from "lucide-react";

const EDITABLE_REQUEST_STATUSES: RequestStatus[] = ["submitted", "reviewing", "recommending", "recommended"];

function toDateInputValue(value?: string) {
  if (!value) return "";
  return value.slice(0, 10);
}

function toFormValues(req: EventRequest): RequestFormValues {
  return {
    event_title: req.event_title,
    event_type: req.event_type,
    event_date: toDateInputValue(req.event_date),
    start_time: req.start_time,
    end_time: req.end_time,
    region: req.region,
    venue: req.venue || undefined,
    budget_min: req.budget_min ?? undefined,
    budget_max: req.budget_max ?? undefined,
    preferred_freelancer_type: req.preferred_freelancer_type ?? [],
    preferred_styles: req.preferred_styles ?? [],
    required_language: req.required_language || undefined,
    description: req.description || undefined,
    script_required: req.script_required,
    rehearsal_required: req.rehearsal_required,
    travel_required: req.travel_required,
  };
}

export default function EditRequestPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.customerRequest(id),
    queryFn: () => customerApi.getRequest(id),
  });

  const req: EventRequest | undefined = data?.data?.data;
  const initialValues = useMemo(() => (req ? toFormValues(req) : undefined), [req]);
  const canEdit = req ? EDITABLE_REQUEST_STATUSES.includes(req.status) : false;

  const mutation = useMutation({
    mutationFn: (values: RequestFormValues) => customerApi.updateRequest(id, {
      ...values,
      venue: values.venue ?? null,
      required_language: values.required_language ?? null,
      description: values.description ?? null,
    }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.customerRequests }),
        queryClient.invalidateQueries({ queryKey: queryKeys.customerRequest(id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.recommendations(id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.pricingAnalysis(id) }),
      ]);
      router.push(`/customer/requests/${id}`);
    },
  });

  const errorMessage = (mutation.error as ApiError<{error:{message:string}}> | null)?.response?.data?.error?.message;

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!req || !initialValues) return null;

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/customer/requests/${id}`}>
          <Button variant="ghost" size="icon" aria-label="뒤로가기"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">요청서 수정</h1>
          <p className="text-muted-foreground text-sm">조건을 변경하면 기존 추천 후보를 새 조건 기준으로 다시 추천합니다</p>
        </div>
      </div>

      {!canEdit ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            상담, 예약, 행사 완료 또는 취소 상태의 요청서는 수정할 수 없습니다.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            수정 저장 시 현재 추천 후보가 새 조건 기준으로 즉시 재생성됩니다.
          </div>

          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2 mb-4">
              {errorMessage || "요청서 수정 중 오류가 발생했습니다."}
            </p>
          )}

          <RequestForm
            initialValues={initialValues}
            submitLabel="수정 저장하기"
            submittingLabel="수정 저장 중..."
            isPending={mutation.isPending}
            onSubmit={(values) => mutation.mutate(values)}
          />
        </>
      )}
    </div>
  );
}
