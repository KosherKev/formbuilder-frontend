import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value || 
                request.headers.get("authorization")?.replace("Bearer ", "");

  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                     request.nextUrl.pathname.startsWith("/register");
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  // Redirect to dashboard if logged in and trying to access auth pages
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect to login if not logged in and trying to access protected routes
  if (!token && isDashboard) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
