"use client";

import { useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { customerApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RequestStatusBadge } from "@/components/common/StatusBadge";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { Pagination } from "@/components/common/Pagination";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EventRequest } from "@/types";

function getRequestSummary(req: EventRequest) {
  if (req.description?.trim()) return req.description.trim();
  return `${req.event_type} 행사를 ${req.region}에서 진행할 진행자를 찾고 있습니다.`;
}

export default function CustomerRequestsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.customerRequestsPage(page),
    queryFn: () => customerApi.getRequests({ page, limit: 12 }),
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
        <Link href="/customer/requests/new" className="shrink-0">
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
            <Link
              key={req.id}
              href={`/customer/requests/${req.id}`}
              className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card className="flex h-full min-h-[220px] cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="flex h-full w-full flex-col p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-xs font-medium text-muted-foreground">{req.event_type}</p>
                    <RequestStatusBadge status={req.status} />
                  </div>

                  <h2 className="line-clamp-2 min-h-[3.25rem] text-lg font-semibold leading-snug tracking-[-0.01em] group-hover:text-navy">
                    {req.event_title}
                  </h2>

                  <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
                    {getRequestSummary(req)}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                    <span>작성 {formatDate(req.created_at)}</span>
                    <span>조회 {req.view_count ?? 0}</span>
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
