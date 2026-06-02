"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { authApi, notificationApi } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { User } from "@/types";
import { queryKeys } from "@/lib/queryKeys";

// ─── Auth Context ─────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: null;
  isLoading: boolean;
  setAuth: (user: User, token?: string) => void;
  clearAuth: () => void;
  refreshUser: () => Promise<User | null>;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  isLoading: true,
  setAuth: () => {},
  clearAuth: () => {},
  refreshUser: async () => null,
});

export const useAuth = () => useContext(AuthContext);

// ─── SSE 알림 훅 ─────────────────────────────────────────────
// 로그인 상태에서만 SSE 연결 유지
// 연결 끊김 시 5초 후 자동 재연결 (최대 5회)

function useSseNotifications(userId: string | null) {
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const MAX_RETRIES = 5;

  const connect = useCallback(() => {
    if (!userId) return;
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    const es = notificationApi.connectStream();
    esRef.current = es;

    es.addEventListener("connected", () => {
      retryCountRef.current = 0;
    });

    es.addEventListener("message", () => {
      // 새 알림 수신 시 미확인 카운트 + 목록 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationUnreadCount });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    });

    es.onerror = () => {
      es.close();
      esRef.current = null;

      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        const delay = Math.min(1000 * 2 ** retryCountRef.current, 30_000);
        retryTimerRef.current = setTimeout(connect, delay);
      }
    };
  }, [userId, queryClient]);

  useEffect(() => {
    if (!userId) {
      esRef.current?.close();
      esRef.current = null;
      return;
    }

    connect();

    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      esRef.current?.close();
      esRef.current = null;
    };
  }, [userId, connect]);
}

// ─── Auth Provider ────────────────────────────────────────────

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useSseNotifications(user?.id ?? null);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.me();
      const currentUser = getAuthUser(res.data);
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const res = await authApi.me();
        const currentUser = getAuthUser(res.data);
        if (mounted) setUser(currentUser);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    bootstrap();

    return () => {
      mounted = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const setAuth = useCallback((newUser: User) => {
    setUser(newUser);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
  }, []);

  const value: AuthState = {
    user,
    token: null,
    isLoading,
    setAuth,
    clearAuth,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Query Client ─────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

// ─── Providers ───────────────────────────────────────────────

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
