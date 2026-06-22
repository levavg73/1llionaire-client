import { NextRequest, NextResponse } from "next/server";

type UserRole = "customer" | "freelancer" | "admin";

type RouteRule = {
  prefix: string;
  role?: UserRole;
};

const ROUTE_RULES: RouteRule[] = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/customer", role: "customer" },
  { prefix: "/freelancer", role: "freelancer" },
  { prefix: "/settings" },
  { prefix: "/notifications" },
  { prefix: "/contracts" },
  { prefix: "/reviews" },
];

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

function getJwtPayload(token?: string): { userType?: UserRole } | null {
  if (!token) return null;

  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(decodeBase64Url(payload));
  } catch {
    return null;
  }
}

function getMatchedRule(pathname: string) {
  return ROUTE_RULES.find((rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const matchedRule = getMatchedRule(pathname);

  if (!matchedRule) return NextResponse.next();

  const token = req.cookies.get("access_token")?.value;
  const payload = getJwtPayload(token);
  if (!token || !payload) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (matchedRule.role && payload.userType !== matchedRule.role) {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
