"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/common/States";
import {
  ClipboardList, Users, Calendar, CreditCard,
  BarChart3, MessageSquare, Clock, CheckCircle2,
} from "lucide-react";

interface DashboardData {
  new_requests: number;
  pending_recommendation: number;
  pending_freelancers: number;
  confirmed_bookings: number;
  completed_bookings: number;
  unpaid_payments: number;
  pending_settlements: number;
  pending_reviews: number;
}

const STAT_CONFIG = [
  { key: "new_requests",           label: "신규 요청서",       icon: ClipboardList,  color: "text-blue-600",   bg: "bg-blue-50",   href: "/admin/requests?status=submitted" },
  { key: "pending_recommendation", label: "후보 추천 대기",     icon: Clock,          color: "text-amber-600",  bg: "bg-amber-50",  href: "/admin/requests" },
  { key: "pending_freelancers",    label: "승인 대기 프리랜서", icon: Users,          color: "text-purple-600", bg: "bg-purple-50", href: "/admin/freelancers?status=pending_review" },
  { key: "confirmed_bookings",     label: "예약 확정",          icon: Calendar,       color: "text-emerald-600",bg: "bg-emerald-50",href: "/admin/bookings" },
  { key: "completed_bookings",     label: "행사 완료",          icon: CheckCircle2,   color: "text-emerald-700",bg: "bg-emerald-50",href: "/admin/bookings" },
  { key: "unpaid_payments",        label: "결제 대기",          icon: CreditCard,     color: "text-red-600",    bg: "bg-red-50",    href: "/admin/payments" },
  { key: "pending_settlements",    label: "정산 대기",          icon: BarChart3,      color: "text-orange-600", bg: "bg-orange-50", href: "/admin/settlements" },
  { key: "pending_reviews",        label: "후기 검수 대기",     icon: MessageSquare,  color: "text-sky-600",    bg: "bg-sky-50",    href: "/admin/reviews" },
] as const;

export default function AdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: () => adminApi.getDashboard(),
    refetchInterval: 60_000,
  });

  const stats: DashboardData | undefined = data?.data?.data;

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-muted-foreground text-sm mt-1">VOIT 운영 현황</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg }) => (
          <Card key={key} className="hover:shadow-md transition-shadow cursor-default">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold tabular-nums">
                  {stats ? stats[key] : "—"}
                </span>
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
