import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const accessToken = request.cookies.get("access_token")?.value;
  const body = await request.json();

  const djangoResponse = await fetch(
    `${process.env.DJANGO_API_URL}/api/fees/student-assignments/${id}/`,
    {
      method: "PATCH",
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

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const accessToken = request.cookies.get("access_token")?.value;

  const djangoResponse = await fetch(
    `${process.env.DJANGO_API_URL}/api/fees/student-assignments/${id}/`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (djangoResponse.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await djangoResponse.json();
  return NextResponse.json(data, { status: djangoResponse.status });
}