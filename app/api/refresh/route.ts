// app/api/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/app/lib/auth-cookies";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const djangoResponse = await fetch(`${process.env.DJANGO_API_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!djangoResponse.ok) {
    const response = NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    response.cookies.delete("role");
    return response;
  }

  const data = await djangoResponse.json();

  const response = NextResponse.json({ success: true });
  setAuthCookies(response, { access: data.access, refresh: data.refresh });

  return response;
}