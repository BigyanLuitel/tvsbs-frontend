// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/app/lib/auth-cookies";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const djangoResponse = await fetch(`${process.env.DJANGO_API_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!djangoResponse.ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const data = await djangoResponse.json();

  const response = NextResponse.json({ role: data.role });
  setAuthCookies(response, { access: data.access, refresh: data.refresh, role: data.role });

  return response;
}