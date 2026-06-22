"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { loadCurrentUser } from "@/lib/auth";
import { getDefaultPostAuthPath } from "@/lib/auth-redirects";
import { User } from "@/types";

const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("@tanstack/react-query-devtools").then(
            (mod) => mod.ReactQueryDevtools
          ),
        { ssr: false }
      )
    : null;

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

const PUBLIC_AUTH_BOOTSTRAP_PATHS = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/oauth-role",
]);

function shouldBootstrapAuth(pathname: string | null): boolean {
  if (typeof window !== "undefined" && window.location.search.includes("login_success=1")) {
    return true;
  }

  if (!pathname) return true;
  if (PUBLIC_AUTH_BOOTSTRAP_PATHS.has(pathname)) return false;
  return true;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const sessionCheckedRef = useRef(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerWaking, setIsServerWaking] = useState(false);

  const applyOAuthRedirect = useCallback((currentUser: User | null) => {
    if (
      !currentUser ||
      typeof window === "undefined" ||
      !window.location.search.includes("login_success=1")
    ) {
      return;
    }

    const dashboardPath = getDefaultPostAuthPath(currentUser.user_type);

    window.history.replaceState({}, "", window.location.pathname);
    window.location.replace(dashboardPath);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await loadCurrentUser();
    sessionCheckedRef.current = true;
    setUser(currentUser);
    setIsLoading(false);
    setIsServerWaking(false);
    return currentUser;
  }, []);

  useEffect(() => {
    let mounted = true;

    const handleUnauthorized = () => {
      sessionCheckedRef.current = false;
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    if (!shouldBootstrapAuth(pathname)) {
      setIsLoading(false);
      setIsServerWaking(false);

      return () => {
        mounted = false;
        window.removeEventListener("auth:unauthorized", handleUnauthorized);
      };
    }

    if (sessionCheckedRef.current) {
      setIsLoading(false);

      return () => {
        mounted = false;
        window.removeEventListener("auth:unauthorized", handleUnauthorized);
      };
    }

    const bootstrap = async () => {
      setIsLoading(true);

      const wakeTimer = window.setTimeout(() => {
        if (mounted) setIsServerWaking(true);
      }, 3000);

      try {
        const currentUser = await loadCurrentUser();
        sessionCheckedRef.current = true;

        if (mounted) {
          setUser(currentUser);
          applyOAuthRedirect(currentUser);
        }
      } finally {
        window.clearTimeout(wakeTimer);

        if (mounted) {
          setIsServerWaking(false);
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [applyOAuthRedirect, pathname]);

  const setAuth = useCallback((newUser: User) => {
    sessionCheckedRef.current = true;
    setUser(newUser);
    setIsLoading(false);
    setIsServerWaking(false);
  }, []);

  const clearAuth = useCallback(() => {
    sessionCheckedRef.current = false;
    setUser(null);
    setIsLoading(false);
    setIsServerWaking(false);
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

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      {ReactQueryDevtools ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
