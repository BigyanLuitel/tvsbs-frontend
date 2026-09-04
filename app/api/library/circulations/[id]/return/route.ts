import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const accessToken = request.cookies.get("access_token")?.value;

  const djangoResponse = await fetch(`${process.env.DJANGO_API_URL}/api/library/circulations/${id}/return/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await djangoResponse.json();
  return NextResponse.json(data, { status: djangoResponse.status });
}