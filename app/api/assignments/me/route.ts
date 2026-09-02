import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/lib/django-fetch";
import { setAuthCookies } from "@/app/lib/auth-cookies";

export async function GET(request: NextRequest) {
  const { data, status, newCookies } = await djangoFetch(request, "/api/assignments/me/");
  const response = NextResponse.json(data, { status });
  if (newCookies) setAuthCookies(response, newCookies);
  return response;
}