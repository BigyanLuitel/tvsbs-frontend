// app/api/classes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/lib/django-fetch";
import { setAuthCookies } from "@/app/lib/auth-cookies";

export async function GET(request: NextRequest) {
  const { data, status, newCookies } = await djangoFetch(request, "/api/academics/classes/");

  const response = NextResponse.json(data, { status });

  if (newCookies) {
    setAuthCookies(response, newCookies);
  }

  return response;
}
export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const formData = await request.formData();

  const djangoResponse = await fetch(`${process.env.DJANGO_API_URL}/api/students/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const data = await djangoResponse.json();
  return NextResponse.json(data, { status: djangoResponse.status });
}