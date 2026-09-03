import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/lib/django-fetch";
import { setAuthCookies } from "@/app/lib/auth-cookies";

export async function GET(request: NextRequest) {
  const { data, status, newCookies } = await djangoFetch(
    request,
    "/api/fees/student-assignments/",
  );
  const response = NextResponse.json(data, { status });
  if (newCookies) setAuthCookies(response, newCookies);
  return response;
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const body = await request.json();

  const djangoResponse = await fetch(
    `${process.env.DJANGO_API_URL}/api/fees/student-assignments/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    },
  );

  const data = await djangoResponse.json();
  return NextResponse.json(data, { status: djangoResponse.status });
}