import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { handleRefresh } from "./lib/handleJwt";

// Auth pages: only accessible when NOT authenticated
const AUTH_PAGES = ["/login", "/register", "/signup", "/forgot-password"];

// Role-restricted paths
const ADMIN_PATHS = [
  "/admin_profile",
  "/admin_reports",
  "/analysis",
  "/billing",
  "/perfomance",
  "/users",
];
const TEACHER_PATHS = ["/profile_teacher", "/report", "/students"];
const STUDENT_PATHS = ["/progress", "/tasks"];

// Shared paths
const ADMIN_TEACHER_PATHS = ["/assign-task", "/content-library"];
const ADMIN_STUDENT_PATHS = ["/badges"];
const TEACHER_STUDENT_PATHS = ["/classes"];

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Handle explicit logout/auth clearing from client
  if (request.nextUrl.searchParams.get("clearAuth") === "true") {
    // Strip the query param before redirecting
    const redirectUrl = new URL(pathname, request.url);
    redirectUrl.searchParams.delete("clearAuth");
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  const isRoot = pathname === "/";
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Unauthenticated flow
  if (!token) {
    if (refreshToken) {
      return await handleRefresh(request);
    }
    if (isAuthPage) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET?.trim());
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    // Authenticated users never see "/" or auth pages — push to dashboard
    if (isRoot || isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Onboarding gate
    if (!payload.isOnboarded && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    if (payload.isOnboarded && pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const matches = (paths: string[]) =>
      paths.some((p) => pathname.startsWith(p));
    const toDashboard = () =>
      NextResponse.redirect(new URL("/dashboard", request.url));

    if (matches(ADMIN_PATHS) && role !== "admin") {
      return toDashboard();
    }

    if (
      matches(ADMIN_TEACHER_PATHS) &&
      role !== "admin" &&
      role !== "teacher"
    ) {
      return toDashboard();
    }

    if (
      matches(ADMIN_STUDENT_PATHS) &&
      role !== "admin" &&
      role !== "student"
    ) {
      return toDashboard();
    }

    if (matches(TEACHER_PATHS) && role !== "teacher") {
      return toDashboard();
    }

    if (matches(STUDENT_PATHS) && role !== "student") {
      return toDashboard();
    }

    if (
      matches(TEACHER_STUDENT_PATHS) &&
      role !== "teacher" &&
      role !== "student"
    ) {
      return toDashboard();
    }

    return NextResponse.next();
  } catch (err: unknown) {
    const error = err as { code?: string };

    if (error.code === "ERR_JWT_EXPIRED" && refreshToken) {
      return await handleRefresh(request);
    }

    console.error("Auth error:", error.code || err);
    
    const response = isAuthPage 
      ? NextResponse.next() 
      : NextResponse.redirect(new URL("/login", request.url));
      
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
