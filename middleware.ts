import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PREFIXES = ["/login"];

type AccessPayload = {
  role?: string;
  roles?: string[];
  exp?: number;
};

function payloadHasAdmin(payload: AccessPayload): boolean {
  if (Array.isArray(payload.roles) && payload.roles.length > 0) {
    return payload.roles.includes("admin");
  }
  return payload.role === "admin";
}

function decodeAccessPayload(token: string): AccessPayload | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const json = atob(segment.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as AccessPayload;
  } catch {
    return null;
  }
}

function isAccessTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const payload = decodeAccessPayload(token);
  if (!payload || !payloadHasAdmin(payload)) return false;
  if (payload.exp && payload.exp * 1000 <= Date.now()) return false;
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;

  if (!isAccessTokenValid(accessToken)) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css)$).*)",
  ],
};
