"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contractApi } from "@/lib/api";
import type { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractStatusBadge } from "@/components/common/StatusBadge";
import type { BookingStatus, Contract, ContractStatus } from "@/types";
import { Download, FileText, PenLine, Printer } from "lucide-react";

function canStartContract(status?: BookingStatus) {
  return (
    status === "accepted" ||
    status === "negotiating" ||
    status === "payment_pending" ||
    status === "confirmed" ||
    status === "completion_requested" ||
    status === "completed"
  );
}

function getSafeMessage(error: unknown, fallback: string) {
  return (error as ApiError<{ error: { message: string } }>)?.response?.data?.error?.message || fallback;
}

function getContractActionState(status: ContractStatus | string | null | undefined, userType?: string) {
  const isFullySigned = status === "fully_signed";
  const isCustomerSigned = status === "pending_freelancer" || isFullySigned;
  const isFreelancerSigned = status === "pending_customer" || isFullySigned;
  const currentUserSigned =
    userType === "customer"
      ? isCustomerSigned
      : userType === "freelancer"
        ? isFreelancerSigned
        : false;

  if (isFullySigned) return { label: "계약 성사 완료", currentUserSigned: true, fullySigned: true };
  if (currentUserSigned) return { label: "내 계약 동의 완료", currentUserSigned: true, fullySigned: false };
  return { label: "계약하기", currentUserSigned: false, fullySigned: false };
}

export function ContractPanel({
  bookingId,
  bookingStatus,
}: {
  bookingId: string;
  bookingStatus?: BookingStatus;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const contractQuery = useQuery({
    queryKey: queryKeys.contract(bookingId),
    queryFn: () => contractApi.get(bookingId),
    retry: false,
  });

  const contract: Contract | undefined = contractQuery.data?.data?.data;
  const isNotFound = contractQuery.isError && (contractQuery.error as ApiError)?.status === 404;
  const actionState = getContractActionState(contract?.status, user?.user_type);
  const canContract = canStartContract(bookingStatus);

  const generateMutation = useMutation({
    mutationFn: () => contractApi.generate(bookingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.contract(bookingId) }),
  });

  const acceptMutation = useMutation({
    mutationFn: () => contractApi.accept(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contract(bookingId) });
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.chatRooms });
      queryClient.invalidateQueries({ queryKey: queryKeys.customerBookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerBookings });
    },
  });

  const htmlUrl = contractApi.getHtmlUrl(bookingId);
  const pdfUrl = contractApi.getPdfUrl(bookingId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          행사 진행 계약서
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-900">
          <p className="font-semibold">전자계약 안내</p>
          <p className="mt-1">
            고객과 진행자가 각각 계약하기를 누르면 자동 계약서에 전자서명이 기록됩니다. 양측이 모두 계약하기를 완료하면 계약이 성사되고 계약서 PDF를 다운로드할 수 있습니다.
          </p>
        </div>

        {contractQuery.isLoading && <p className="text-muted-foreground">계약서 상태를 확인 중입니다...</p>}

        {contractQuery.isError && !isNotFound && (
          <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-destructive">
            {getSafeMessage(contractQuery.error, "계약서를 불러오지 못했습니다.")}
          </p>
        )}

        {isNotFound && (
          <div className="space-y-3">
            <p className="text-muted-foreground">
              아직 계약서가 생성되지 않았습니다. 상담 단계에서 고객과 진행자가 서로 계약하기를 누르면 자동으로 계약서가 생성되고 서명이 기록됩니다.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={!canContract || acceptMutation.isPending}
                onClick={() => acceptMutation.mutate()}
                className="gap-1"
              >
                <PenLine className="h-3.5 w-3.5" />
                {acceptMutation.isPending ? "계약 처리 중..." : "계약하기"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!canContract || generateMutation.isPending}
                onClick={() => generateMutation.mutate()}
              >
                {generateMutation.isPending ? "미리보기 생성 중..." : "계약서만 미리 생성"}
              </Button>
            </div>
            {!canContract && (
              <p className="text-xs text-muted-foreground">진행자 수락 후 상담 단계부터 계약할 수 있습니다.</p>
            )}
          </div>
        )}

        {generateMutation.isError && (
          <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-destructive">
            {getSafeMessage(generateMutation.error, "계약서 생성에 실패했습니다.")}
          </p>
        )}

        {acceptMutation.isError && (
          <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-destructive">
            {getSafeMessage(acceptMutation.error, "계약 처리에 실패했습니다.")}
          </p>
        )}

        {contract && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <ContractStatusBadge status={contract.status} />
              <span className="text-xs text-muted-foreground">
                생성일 {new Date(contract.created_at).toLocaleString("ko-KR")}
              </span>
            </div>

            <div className="grid gap-2 rounded-xl border border-line bg-muted/30 p-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">고객 계약하기</p>
                <p className="font-medium">
                  {contract.customer_signed_at ? new Date(contract.customer_signed_at).toLocaleString("ko-KR") : "대기 중"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">진행자 계약하기</p>
                <p className="font-medium">
                  {contract.freelancer_signed_at ? new Date(contract.freelancer_signed_at).toLocaleString("ko-KR") : "대기 중"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="gap-1"
                onClick={() => acceptMutation.mutate()}
                disabled={actionState.currentUserSigned || actionState.fullySigned || acceptMutation.isPending}
              >
                <PenLine className="h-3.5 w-3.5" />
                {acceptMutation.isPending ? "계약 처리 중..." : actionState.label}
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-1">
                <a href={htmlUrl} target="_blank" rel="noreferrer">
                  <Printer className="h-3.5 w-3.5" />
                  인쇄/PDF 보기
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-1">
                <a href={pdfUrl} download>
                  <Download className="h-3.5 w-3.5" />
                  PDF 다운로드
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
