"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contractApi } from "@/lib/api";
import type { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractStatusBadge } from "@/components/common/StatusBadge";
import type { BookingStatus, Contract } from "@/types";
import { FileText, PenLine, Printer } from "lucide-react";

function canGenerateContract(status?: BookingStatus) {
  return status === "confirmed" || status === "completion_requested" || status === "completed";
}

function getSafeMessage(error: unknown, fallback: string) {
  return (error as ApiError<{ error: { message: string } }>)?.response?.data?.error?.message || fallback;
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

  const generateMutation = useMutation({
    mutationFn: () => contractApi.generate(bookingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.contract(bookingId) }),
  });

  const signMutation = useMutation({
    mutationFn: () => contractApi.sign(bookingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.contract(bookingId) }),
  });

  const htmlUrl = contractApi.getHtmlUrl(bookingId);
  const userType = user?.user_type;
  const alreadySigned =
    userType === "customer"
      ? !!contract?.customer_signed_at
      : userType === "freelancer"
        ? !!contract?.freelancer_signed_at
        : false;
  const canSign = !!contract && contract.status !== "fully_signed" && contract.status !== "voided" && !alreadySigned;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          행사 진행 계약서
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {contractQuery.isLoading && <p className="text-muted-foreground">계약서 상태를 확인 중입니다...</p>}

        {contractQuery.isError && !isNotFound && (
          <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-destructive">
            {getSafeMessage(contractQuery.error, "계약서를 불러오지 못했습니다.")}
          </p>
        )}

        {isNotFound && (
          <div className="space-y-3">
            <p className="text-muted-foreground">
              아직 계약서가 생성되지 않았습니다. 예약 확정 후 고객 또는 프리랜서가 계약서를 생성할 수 있습니다.
            </p>
            <Button
              type="button"
              size="sm"
              disabled={!canGenerateContract(bookingStatus) || generateMutation.isPending}
              onClick={() => generateMutation.mutate()}
            >
              {generateMutation.isPending ? "생성 중..." : "계약서 생성"}
            </Button>
            {!canGenerateContract(bookingStatus) && (
              <p className="text-xs text-muted-foreground">예약 확정 후 계약서 생성이 가능합니다.</p>
            )}
          </div>
        )}

        {generateMutation.isError && (
          <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-destructive">
            {getSafeMessage(generateMutation.error, "계약서 생성에 실패했습니다.")}
          </p>
        )}

        {signMutation.isError && (
          <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-destructive">
            {getSafeMessage(signMutation.error, "서명에 실패했습니다.")}
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
                <p className="text-xs text-muted-foreground">고객 서명</p>
                <p className="font-medium">
                  {contract.customer_signed_at ? new Date(contract.customer_signed_at).toLocaleString("ko-KR") : "대기 중"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">프리랜서 서명</p>
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
                onClick={() => signMutation.mutate()}
                disabled={!canSign || signMutation.isPending}
              >
                <PenLine className="h-3.5 w-3.5" />
                {alreadySigned ? "서명 완료" : signMutation.isPending ? "서명 중..." : "전자서명"}
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-1">
                <a href={htmlUrl} target="_blank" rel="noreferrer">
                  <Printer className="h-3.5 w-3.5" />
                  인쇄/PDF 보기
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
