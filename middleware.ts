// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const roleRoutes: Record<string, string> = {
  "/admin": "ADMIN",
  "/teacher": "TEACHER",
  "/student": "STUDENT",
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const role = request.cookies.get("role")?.value;

  const matchedPrefix = Object.keys(roleRoutes).find((prefix) =>
    path.startsWith(prefix)
  );

  if (!matchedPrefix) {
    return NextResponse.next();
  }
    if (!role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (roleRoutes[matchedPrefix] !== role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
};