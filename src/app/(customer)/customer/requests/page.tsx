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
import { Plus, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EventRequest } from "@/types";

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">내 요청서 관리</h1>
          <p className="mt-2 text-sm text-muted-foreground">섭외 요청서를 작성하고 현황을 확인하세요</p>
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
        <div className="space-y-3">
          {items.map((req) => (
            <Link key={req.id} href={`/customer/requests/${req.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <RequestStatusBadge status={req.status} />
                        <span className="text-xs text-muted-foreground">{formatDate(req.event_date)}</span>
                      </div>
                      <h2 className="truncate text-base font-semibold">{req.event_title}</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {req.event_type} · {req.region}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
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
