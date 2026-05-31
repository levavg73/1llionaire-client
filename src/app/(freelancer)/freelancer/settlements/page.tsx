"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { freelancerApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent } from "@/components/ui/card";
import { SettlementStatusBadge } from "@/components/common/StatusBadge";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { Pagination } from "@/components/common/Pagination";
import { formatDate, formatPrice } from "@/lib/utils";

export default function FreelancerSettlementsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.freelancerSettlementsPage(page),
    queryFn: () => freelancerApi.getSettlements({ page, limit: 10 }),
  });
  const items = data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">정산 내역</h1>
      </div>
      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && items.length === 0 && <EmptyState title="정산 내역이 없습니다" />}
      <div className="space-y-3">
        {items.map((item: { id: string; event_title: string; event_date: string; freelancer_amount: number; settlement_status: string }) => (
          <Card key={item.id}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <SettlementStatusBadge status={item.settlement_status as never} />
                <h2 className="font-semibold mt-1">{item.event_title}</h2>
                <p className="text-sm text-muted-foreground">{formatDate(item.event_date)}</p>
              </div>
              <p className="font-bold text-lg">{formatPrice(item.freelancer_amount)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
    </div>
  );
}
