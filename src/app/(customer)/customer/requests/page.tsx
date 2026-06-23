"use client";

import { useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { customerApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { Pagination } from "@/components/common/Pagination";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EventRequest } from "@/types";


function getRecommendationStatus(req: EventRequest) {
  if (["recommended", "consulting", "booked", "completed", "reviewed"].includes(req.status)) {
    return { label: "후보 추천 완료", className: "bg-gold/15 text-gold" };
  }

  if (req.status === "recommending") {
    return { label: "AI 추천 중", className: "bg-lavender/15 text-lavender" };
  }

  return { label: "후보 추천 준비중", className: "bg-muted text-muted-foreground" };
}

function getRequestSummary(req: EventRequest) {
  if (req.description?.trim()) return req.description.trim();

  const details = [req.region, req.venue, req.preferred_styles?.join(" · ")].filter(Boolean);
  return details.length > 0 ? details.join(" · ") : "요청서 상세 내용을 확인해 주세요.";
}

export default function CustomerRequestsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.customerRequestsPage(page),
    queryFn: () => customerApi.getRequests({ page, limit: 10 }),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });

  const result = data?.data;
  const items: EventRequest[] = result?.data?.items ?? [];
  const pagination = result?.data?.pagination;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">내 요청서</h1>
          <p className="mt-1 text-sm text-muted-foreground">섭외 요청서를 작성하고 현황을 확인하세요</p>
        </div>
        <Link href="/customer/requests/new">
          <Button className="gap-2 bg-navy text-white hover:bg-navy-light">
            <Plus className="h-4 w-4" />
            요청서 작성
          </Button>
        </Link>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          title="요청서가 없습니다"
          description="오른쪽 상단의 요청서 작성 버튼으로 첫 섭외 요청을 시작하세요."
        />
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {items.map((req) => (
            <Link key={req.id} href={`/customer/requests/${req.id}`} className="group block h-full">
              <Card className="h-full cursor-pointer transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
                <CardContent className="flex h-full flex-col p-5">
                  <p className="mb-3 text-xs font-medium text-muted-foreground">{req.event_type}</p>

                  <h2 className="line-clamp-2 min-h-[3rem] text-lg font-semibold leading-6 tracking-[-0.02em]">
                    {req.event_title}
                  </h2>

                  <p className="mt-3 line-clamp-3 min-h-[3.75rem] text-sm leading-5 text-muted-foreground">
                    {getRequestSummary(req)}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-muted-foreground">
                    <span>{formatDate(req.created_at)}</span>
                    {(() => {
                      const status = getRecommendationStatus(req);
                      return (
                        <span className={`rounded-full px-2.5 py-1 font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
    </div>
  );
}
