import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge Runtime
export const runtime = 'experimental-edge';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers })
    }
    
    return response
  }

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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}; 