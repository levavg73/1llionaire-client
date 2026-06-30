"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, HelpCircle, LogOut, Moon, Sun } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserRoleBadge } from "@/components/common/StatusBadge";
import { authApi } from "@/lib/apis/auth";
import { notificationApi } from "@/lib/apis/notifications";
import { queryKeys } from "@/lib/queryKeys";

type Theme = "light" | "dark";

export function Header() {
  const { user, clearAuth } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const { data: unreadData } = useQuery({
    queryKey: queryKeys.notificationUnreadCount,
    queryFn: () => notificationApi.getUnreadCount(),
    enabled: !!user,
    refetchInterval: 10000,
  });

  const unreadCount = unreadData?.data?.data?.count ?? 0;

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme") as Theme | null;
    const systemTheme: Theme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    const initialTheme = savedTheme || systemTheme;

    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;

      if (currentScrollY < 40) {
        setIsHeaderVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY && currentScrollY > 90) {
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    clearAuth();
    queryClient.clear();
    router.push("/");
  };

  const dashboardHref =
    user?.user_type === "admin"
      ? "/admin"
      : user?.user_type === "customer"
        ? "/customer/requests"
        : user?.user_type === "freelancer"
          ? "/freelancer/profile"
          : "/";

  return (
    <header
      className={`sticky top-0 z-40 border-b border-line bg-clear/90 backdrop-blur transition-transform duration-300 ease-out supports-[backdrop-filter]:bg-clear/75 ${
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" prefetch={false} className="flex items-center gap-3 text-text">
          <Image
            src="/brand-icon.webp"
            alt="보잇 Voit"
            width={48}
            height={48}
            className="h-10 w-10 object-contain sm:h-11 sm:w-11"
            sizes="44px"
            fetchPriority="low"
          />
          <span className="text-[21px] font-extrabold tracking-[-0.03em]">
            보잇 Voit
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link href="/support" prefetch={false} className="hidden md:inline-flex">
            <Button variant="ghost" size="sm" className="gap-2">
              <HelpCircle className="h-4.5 w-4.5" aria-hidden="true" />
              고객센터
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="테마 변경"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-4.5 w-4.5" />
            ) : (
              <Moon className="h-4.5 w-4.5" />
            )}
          </Button>

          {user ? (
            <>
              <Link href="/notifications" prefetch={false}>
                <Button variant="ghost" size="icon" className="relative" aria-label="알림">
                  <Bell className="h-4.5 w-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href={dashboardHref} prefetch={false}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserRoleBadge role={user.user_type} />
                  <span className="hidden sm:inline">{user.name}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                aria-label="로그아웃"
              >
                <LogOut className="h-4.5 w-4.5" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" prefetch={false}>
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
              </Link>
              <Link href="/signup" prefetch={false}>
                <Button variant="primaryCta" size="sm">
                  회원가입
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
