import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const accessToken = request.cookies.get("access_token")?.value;

  const djangoResponse = await fetch(`${process.env.DJANGO_API_URL}/api/library/books/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
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

  const djangoResponse = await fetch(`${process.env.DJANGO_API_URL}/api/library/books/${id}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (djangoResponse.status === 204) return new NextResponse(null, { status: 204 });
  const data = await djangoResponse.json();
  return NextResponse.json(data, { status: djangoResponse.status });
}