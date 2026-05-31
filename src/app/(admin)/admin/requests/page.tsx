"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent } from "@/components/ui/card";
import { RequestStatusBadge } from "@/components/common/StatusBadge";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { Pagination } from "@/components/common/Pagination";
import { ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EventRequest, RequestStatus } from "@/types";

const STATUS_TABS: { value: RequestStatus | ""; label: string }[] = [
  { value: "", label: "전체" },
  { value: "submitted", label: "접수" },
  { value: "reviewing", label: "검토 중" },
  { value: "recommending", label: "후보 선정 중" },
  { value: "recommended", label: "추천 완료" },
  { value: "booked", label: "예약 완료" },
];

interface RequestRow extends EventRequest {
  customer?: { id: string; name: string; email: string };
  _count?: { recommendations: number };
}

export default function AdminRequestsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "">("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.adminRequestsList(page, statusFilter),
    queryFn: () => adminApi.getRequests({ page, limit: 15, ...(statusFilter && { status: statusFilter }) }),
  });

  const items: RequestRow[] = data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">요청서 관리</h1>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === value ? "bg-navy text-white" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && items.length === 0 && <EmptyState title="요청서가 없습니다" />}

      <div className="space-y-3">
        {items.map((req) => (
          <Link key={req.id} href={`/admin/requests/${req.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <RequestStatusBadge status={req.status} />
                      <span className="text-xs text-muted-foreground">{formatDate(req.event_date)}</span>
                      {req._count && req._count.recommendations > 0 && (
                        <span className="text-xs text-gold font-medium">후보 {req._count.recommendations}명</span>
                      )}
                    </div>
                    <h2 className="font-semibold truncate">{req.event_title}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {req.customer?.name} · {req.event_type} · {req.region}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
    </div>
  );
}
