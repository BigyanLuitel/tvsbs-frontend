// app/lib/django-fetch.ts
import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "./auth-cookies";

export async function djangoFetch(request: NextRequest, path: string) {
  const accessToken = request.cookies.get("access_token")?.value;

  const res = await fetch(`${process.env.DJANGO_API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status !== 401) {
    return { data: await res.json(), status: res.status, newCookies: null };
  }
    const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return { data: { error: "Not authenticated" }, status: 401, newCookies: null };
  }

  const refreshRes = await fetch(`${process.env.DJANGO_API_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!refreshRes.ok) {
    return { data: { error: "Session expired" }, status: 401, newCookies: null };
  }

  const tokens = await refreshRes.json();

  const retryRes = await fetch(`${process.env.DJANGO_API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${tokens.access}`,
    },
  });

  return {
    data: await retryRes.json(),
    status: retryRes.status,
    newCookies: { access: tokens.access, refresh: tokens.refresh },
  };
}