import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const searchParams = request.nextUrl.searchParams;

  const djangoResponse = await fetch(
    `${process.env.DJANGO_API_URL}/api/results/marksheets/?${searchParams.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!djangoResponse.ok) {
    const errData = await djangoResponse.json();
    return NextResponse.json(errData, { status: djangoResponse.status });
  }

  const pdfBuffer = await djangoResponse.arrayBuffer();
  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: { "Content-Type": "application/pdf" },
  });
}