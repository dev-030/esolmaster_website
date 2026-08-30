import { NextRequest, NextResponse } from "next/server";

// This route proxies the PDF import to the backend without any timeout,
// which is needed because the Gemini AI call can take 30+ seconds and the
// default Next.js rewrites proxy kills long-running connections.
export const maxDuration = 120; // seconds (only applies to Vercel/serverless)

export async function POST(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5300";

  // Forward the raw multipart body directly to the backend
  const formData = await request.formData();

  // Convert FormData to a fetch-compatible body
  const fetchFormData = new FormData();
  for (const [key, value] of formData.entries()) {
    fetchFormData.append(key, value);
  }

  // Forward all cookies for authentication
  const cookieHeader = request.headers.get("cookie") || "";

  try {
    const backendResponse = await fetch(`${backendUrl}/tasks/import-pdf`, {
      method: "POST",
      body: fetchFormData,
      headers: {
        cookie: cookieHeader,
      },
      // No timeout — we wait as long as the backend needs
    });

    const data = await backendResponse.json();

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (err: any) {
    console.error("PDF import proxy error:", err.message);
    return NextResponse.json(
      { error: "Failed to reach backend", detail: err.message },
      { status: 500 }
    );
  }
}
