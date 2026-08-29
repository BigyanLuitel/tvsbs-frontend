// app/api/students/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/lib/django-fetch";
import { setAuthCookies } from "@/app/lib/auth-cookies";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, status, newCookies } = await djangoFetch(request, `/api/students/${id}/`);

  const response = NextResponse.json(data, { status });
  if (newCookies) setAuthCookies(response, newCookies);
  return response;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const accessToken = request.cookies.get("access_token")?.value;
  const formData = await request.formData();

  const djangoResponse = await fetch(`${process.env.DJANGO_API_URL}/api/students/${id}/`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const data = await djangoResponse.json();
  return NextResponse.json(data, { status: djangoResponse.status });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const accessToken = request.cookies.get("access_token")?.value;

  const djangoResponse = await fetch(`${process.env.DJANGO_API_URL}/api/students/${id}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (djangoResponse.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await djangoResponse.json();
  return NextResponse.json(data, { status: djangoResponse.status });
}