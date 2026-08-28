// app/lib/auth-cookies.ts
import { NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";

export function setAuthCookies(
  response: NextResponse,
  tokens: { access: string; refresh: string; role?: string }
) {
  response.cookies.set("access_token", tokens.access, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  response.cookies.set("refresh_token", tokens.refresh, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  if (tokens.role) {
    response.cookies.set("role", tokens.role, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  }
}