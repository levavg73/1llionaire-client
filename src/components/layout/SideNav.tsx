"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FileText,
  Star,
  LayoutDashboard,
  Users,
  ClipboardList,
  Calendar,
  CreditCard,
  Wallet,
  MessageSquare,
  Briefcase,
  BarChart3,
  Settings,
  Bell,
  BrainCircuit,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="사이드 내비게이션">
      <ul className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-navy text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function CustomerNav() {
  return (
    <SideNav
      items={[
        { href: "/customer/requests", label: "내 요청서", icon: <FileText className="h-4 w-4" /> },
        { href: "/customer/bookings", label: "내 예약", icon: <Calendar className="h-4 w-4" /> },
        { href: "/customer/chats", label: "상담", icon: <MessageSquare className="h-4 w-4" /> },
        { href: "/notifications", label: "알림", icon: <Bell className="h-4 w-4" /> },
        { href: "/settings", label: "계정 설정", icon: <Settings className="h-4 w-4" /> },
      ]}
    />
  );
}

export function FreelancerNav() {
  return (
    <SideNav
      items={[
        { href: "/freelancer/profile", label: "내 프로필", icon: <Briefcase className="h-4 w-4" /> },
        { href: "/freelancer/portfolio", label: "포트폴리오", icon: <Star className="h-4 w-4" /> },
        { href: "/freelancer/requests", label: "전달받은 요청", icon: <ClipboardList className="h-4 w-4" /> },
        { href: "/freelancer/bookings", label: "예약 관리", icon: <Calendar className="h-4 w-4" /> },
        { href: "/freelancer/chats", label: "상담", icon: <MessageSquare className="h-4 w-4" /> },
        { href: "/freelancer/settlements", label: "정산 내역", icon: <Wallet className="h-4 w-4" /> },
        { href: "/freelancer/reviews", label: "의뢰인 후기", icon: <Star className="h-4 w-4" /> },
        { href: "/notifications", label: "알림", icon: <Bell className="h-4 w-4" /> },
        { href: "/settings", label: "계정 설정", icon: <Settings className="h-4 w-4" /> },
      ]}
    />
  );
}

export function AdminNav() {
  return (
    <SideNav
      items={[
        { href: "/admin", label: "대시보드", icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: "/admin/freelancers", label: "프리랜서 관리", icon: <Users className="h-4 w-4" /> },
        { href: "/admin/requests", label: "요청서 관리", icon: <ClipboardList className="h-4 w-4" /> },
        { href: "/admin/bookings", label: "예약 관리", icon: <Calendar className="h-4 w-4" /> },
        { href: "/admin/payments", label: "결제 관리", icon: <CreditCard className="h-4 w-4" /> },
        { href: "/admin/settlements", label: "정산 관리", icon: <BarChart3 className="h-4 w-4" /> },
        { href: "/admin/ai", label: "AI 단가 분석", icon: <BrainCircuit className="h-4 w-4" /> },
        { href: "/admin/reviews", label: "후기 관리", icon: <MessageSquare className="h-4 w-4" /> },
        { href: "/notifications", label: "알림", icon: <Bell className="h-4 w-4" /> },
        { href: "/settings", label: "계정 설정", icon: <Settings className="h-4 w-4" /> },
      ]}
    />
  );
}
