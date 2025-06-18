import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge Runtime
export const runtime = 'edge';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ["/", "/signup", "/login"];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for auth token in cookies
  const authToken = request.cookies.get("auth-token")?.value;
  
  if (!authToken) {
    // Clear any existing auth-token cookie to prevent stale tokens
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth-token");
    
    // Add the current path as the 'from' parameter
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  
  // Add auth token to request headers
  requestHeaders.set('Authorization', `Bearer ${authToken}`);

  // Return response with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}; 