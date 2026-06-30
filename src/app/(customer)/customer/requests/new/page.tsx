"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/api";
import { customerApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { RequestForm, type RequestFormValues } from "@/components/customer/RequestForm";

function NewRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const freelancerId = searchParams.get("freelancerId");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: RequestFormValues) =>
      customerApi.createRequest({
        ...data,
        ...(freelancerId ? { preferred_freelancer_ids: [freelancerId] } : {}),
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customerRequests });

      queryClient.invalidateQueries({ queryKey: queryKeys.customerBookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerRequests });

      const id = res.data.data?.id;
      router.push(id ? `/customer/requests/${id}` : "/customer/requests");
    },
  });

  const mutationError = mutation.error as ApiError<{
    error?: {
      message?: string;
      details?: Array<{
        field?: string;
        message?: string;
      }>;
    };
  }> | null;

  const validationDetails = mutationError?.response?.data?.error?.details
    ?.map((detail) => detail.message)
    .filter(Boolean)
    .join(" / ");

  const errorMessage =
    validationDetails ||
    mutationError?.response?.data?.error?.message ||
    mutationError?.message ||
    "오류가 발생했습니다.";

  return (
    <div className="animate-fade-in max-w-2xl">
      {freelancerId && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✅ 특정 진행자를 지명하여 요청서를 작성합니다. 제출하면 해당 진행자에게 바로 요청서가 전달됩니다.
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <Link href="/customer/requests">
          <Button variant="ghost" size="icon" aria-label="뒤로가기">
            <span aria-hidden="true" className="text-lg leading-none">
              ←
            </span>
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl font-bold">요청서 작성</h1>
          <p className="text-muted-foreground text-sm">
            {freelancerId
              ? "행사 조건을 입력하면 지명한 진행자에게 요청서를 바로 전달합니다"
              : "행사 조건을 구조화해 입력하면 승인된 진행자 중 맞춤 후보를 바로 추천합니다"}
          </p>
        </div>
      </div>

      {mutation.isError && (
        <p
          role="alert"
          className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2 mb-4"
        >
          {errorMessage}
        </p>
      )}

      <RequestForm
        submitLabel="요청서 제출하기"
        submittingLabel="요청서 제출 중..."
        isPending={mutation.isPending}
        onSubmit={(values) => mutation.mutate(values)}
      />
    </div>
  );
}

export default function NewRequestPage() {
  return (
    <Suspense fallback={null}>
      <NewRequestContent />
    </Suspense>
  );
}