"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { Pagination } from "@/components/common/Pagination";
import { NotificationItem } from "@/types";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...queryKeys.notifications, { page }],
    queryFn: () => notificationApi.getNotifications({ page, limit: 20 }),
  });

  const notifications: NotificationItem[] = data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;

  const markAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationUnreadCount });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationUnreadCount });
    },
  });

  return (
    <ProtectedRoute>
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">알림</h1>
            <p className="mt-1 text-sm text-muted-foreground">나에게 온 예약, 채팅, 결제 알림을 확인하세요.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}>
            모두 읽음
          </Button>
        </div>

        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {!isLoading && !isError && notifications.length === 0 && <EmptyState title="알림이 없습니다" />}

        <div className="space-y-3">
          {notifications.map((item) => {
            const content = (
              <Card className={cn("transition-shadow hover:shadow-md", !item.is_read && "border-primary/40 bg-primary/5")}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString("ko-KR")}</p>
                    </div>
                    {!item.is_read && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
                  </div>
                </CardContent>
              </Card>
            );

            return item.link_url ? (
              <Link key={item.id} href={item.link_url} onClick={() => markReadMutation.mutate(item.id)}>
                {content}
              </Link>
            ) : (
              <button key={item.id} type="button" className="block w-full text-left" onClick={() => markReadMutation.mutate(item.id)}>
                {content}
              </button>
            );
          })}
        </div>

        {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
      </div>
    </ProtectedRoute>
  );
}
