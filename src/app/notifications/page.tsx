"use client";

import { useRouter } from "next/navigation";
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
import { Trash2 } from "lucide-react";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [deletingNotificationId, setDeletingNotificationId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...queryKeys.notifications, { page }],
    queryFn: () => notificationApi.getNotifications({ page, limit: 20 }),
    refetchInterval: 10000,
  });

  const notifications: NotificationItem[] = data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    queryClient.invalidateQueries({ queryKey: queryKeys.notificationUnreadCount });
  };

  const markAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: invalidate,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationApi.deleteNotification(id),
    onMutate: (id: string) => {
      setDeletingNotificationId(id);
    },
    onSuccess: invalidate,
    onSettled: (_data, _error, id) => {
      setDeletingNotificationId((currentId) => (currentId === id ? null : currentId));
    },
  });

  const openNotification = (item: NotificationItem) => {
    if (!item.is_read) markReadMutation.mutate(item.id);
    if (item.link_url) router.push(item.link_url);
  };

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
          {notifications.map((item) => (
            <Card
              key={item.id}
              role={item.link_url ? "button" : undefined}
              tabIndex={item.link_url ? 0 : undefined}
              onClick={() => openNotification(item)}
              onKeyDown={(event) => {
                if (item.link_url && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  openNotification(item);
                }
              }}
              className={cn(
                "transition-shadow hover:shadow-md",
                item.link_url && "cursor-pointer",
                !item.is_read && "border-primary/40 bg-primary/5"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString("ko-KR")}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!item.is_read && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="알림 삭제"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        deleteMutation.mutate(item.id);
                      }}
                      disabled={deletingNotificationId === item.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
      </div>
    </ProtectedRoute>
  );
}
