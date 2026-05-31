"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { freelancerApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { Pagination } from "@/components/common/Pagination";
import { RequestStatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/utils";

export default function FreelancerRequestsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.freelancerRequestsPage(page),
    queryFn: () => freelancerApi.getRequests({ page, limit: 10 }),
  });

  const items = data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">전달받은 요청</h1>
        <p className="text-muted-foreground text-sm mt-1">관리자가 추천한 행사 요청입니다</p>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && items.length === 0 && (
        <EmptyState title="전달받은 요청이 없습니다" description="관리자가 요청을 전달하면 이 곳에 표시됩니다" />
      )}

      <div className="space-y-3">
        {items.map((item: { id: string; status: string; request?: { event_title?: string; event_date?: string; event_type?: string; region?: string; status: string } }) => (
          <Card key={item.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  {item.request && (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <RequestStatusBadge status={item.request.status as never} />
                        {item.request.event_date && (
                          <span className="text-xs text-muted-foreground">{formatDate(item.request.event_date)}</span>
                        )}
                      </div>
                      <h2 className="font-semibold">{item.request.event_title}</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {item.request.event_type} · {item.request.region}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
    </div>
  );
}
