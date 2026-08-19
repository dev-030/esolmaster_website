import { NextRequest, NextResponse } from "next/server";

export async function handleRefresh(request: NextRequest) {
  try {
    // Use private BACKEND_URL (no NEXT_PUBLIC) for server-to-server calls.
    // NEXT_PUBLIC_* vars are baked in at build time for the browser only.
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      throw new Error("No refresh token found in cookies");
    }

    // Server-to-server: manually pass the cookie header
    const response = await fetch(`${backendUrl}/auth/refresh_token`, {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[handleRefresh] Backend responded ${response.status}: ${errorText}`);
      throw new Error("Backend refresh call failed");
    }

    // Backend may return multiple Set-Cookie headers.
    // In the Fetch API, response.headers.get('set-cookie') collapses them
    // into a comma-separated string. We parse both tokens from it.
    const setCookieHeader = response.headers.get("set-cookie");
    if (!setCookieHeader) {
      throw new Error("Backend did not return new cookies");
    }

    const nextResponse = NextResponse.next();
    const isProd = process.env.NODE_ENV === "production";

    // Parse and forward new accessToken
    const accessMatch = setCookieHeader.match(/accessToken=([^;,]+)/);
    if (accessMatch) {
      nextResponse.cookies.set("accessToken", accessMatch[1], {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 5 * 60 * 60, // 5h in seconds
      });
    }

    // Parse and forward the rotated refreshToken
    const refreshMatch = setCookieHeader.match(/refreshToken=([^;,]+)/);
    if (refreshMatch) {
      nextResponse.cookies.set("refreshToken", refreshMatch[1], {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7d in seconds
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("[handleRefresh] Silent Refresh Error:", error);
    // Clear bad tokens and redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("refreshToken");
    response.cookies.delete("accessToken");
    return response;
  }
}
