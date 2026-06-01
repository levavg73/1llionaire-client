"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Moon, Sun } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserRoleBadge } from "@/components/common/StatusBadge";
import { authApi } from "@/lib/api";

type Theme = "light" | "dark";

export function Header() {
  const { user, clearAuth } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollYRef = useRef(0);

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
        <Link href="/" className="flex items-center gap-3 text-text">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface ring-1 ring-line">
            <Image
              src="/favicon.ico"
              alt="프리마이크"
              width={20}
              height={20}
              className="object-contain"
            />
          </span>
          <span className="text-[21px] font-extrabold tracking-[-0.03em]">
            프리마이크
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
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
              <Link href={dashboardHref}>
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
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
              </Link>
              <Link href="/signup">
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