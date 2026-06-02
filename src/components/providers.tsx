"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { loadCurrentUser } from "@/lib/auth";
import type { User } from "@/types";

// ─── Auth Context ─────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: null;
  isLoading: boolean;
  isServerWaking: boolean;
  setAuth: (user: User, token?: string) => void;
  clearAuth: () => void;
  refreshUser: () => Promise<User | null>;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  isLoading: true,
  isServerWaking: false,
  setAuth: () => {},
  clearAuth: () => {},
  refreshUser: async () => null,
});

export const useAuth = () => useContext(AuthContext);

// ─── Auth Provider ────────────────────────────────────────────

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerWaking, setIsServerWaking] = useState(false);


  const handleOAuthSuccessRedirect = useCallback((currentUser: User | null) => {
    if (
      !currentUser ||
      typeof window === "undefined" ||
      !window.location.search.includes("login_success=1")
    ) {
      return;
    }

    const dashboardPath =
      currentUser.user_type === "admin"
        ? "/admin"
        : currentUser.user_type === "customer"
          ? "/customer/requests"
          : "/freelancer/profile";

    window.history.replaceState({}, "", window.location.pathname);
    window.location.replace(dashboardPath);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await loadCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  useEffect(() => {
    let mounted = true;
    let wakeMessageTimer: ReturnType<typeof setTimeout> | null = null;

    const bootstrap = async () => {
      wakeMessageTimer = setTimeout(() => {
        if (mounted) setIsServerWaking(true);
      }, 3000);

      try {
        const currentUser = await loadCurrentUser();

        if (mounted) {
          setUser(currentUser);
          handleOAuthSuccessRedirect(currentUser);
        }
      } finally {
        if (wakeMessageTimer) clearTimeout(wakeMessageTimer);

        if (mounted) {
          setIsServerWaking(false);
          setIsLoading(false);
        }
      }
    };

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    bootstrap();

    return () => {
      mounted = false;
      if (wakeMessageTimer) clearTimeout(wakeMessageTimer);
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [handleOAuthSuccessRedirect]);

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
    isServerWaking,
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
