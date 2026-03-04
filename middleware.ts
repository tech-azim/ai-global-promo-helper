import { NextRequest, NextResponse } from "next/server";

// Halaman yang tidak perlu login
const PUBLIC_PATHS = ["/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  const isPublic = PUBLIC_PATHS.includes(pathname);

  // Sudah login tapi akses halaman login → redirect ke dashboard
  if (isPublic && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Belum login tapi akses halaman protected → redirect ke login
  if (!isPublic && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match semua path kecuali:
     * - api routes
     * - _next/static
     * - _next/image
     * - favicon
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
