import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const searchParams = request.nextUrl.searchParams;

  const djangoResponse = await fetch(
    `${process.env.DJANGO_API_URL}/api/results/publication-status/?${searchParams.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const data = await djangoResponse.json();
  return NextResponse.json(data, { status: djangoResponse.status });
}