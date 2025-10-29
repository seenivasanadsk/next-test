import { NextResponse } from "next/server";

const authRoutes = ["/login", "/reset-password"]; // public routes
const publicPaths = ["/_next", "/favicon.ico", "/public"]; // static files, skip checks

export function middleware(req) {
    const { pathname } = req.nextUrl;
    const sessionId = req.cookies.get("SESSION_ID")?.value;

    // Skip static files and Next.js internals
    if (publicPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Determine if the current route is a login/reset-password route
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // Environment variable to skip authentication checks
    const ignoreAuth = process.env.IGNORE_AUTH === "true";

    // If auth checks are ignored, allow all requests
    if (ignoreAuth) return NextResponse.next();

    // Protected routes → must have session
    if (!isAuthRoute && !sessionId) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Auth routes → must NOT have session
    if (isAuthRoute && sessionId) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // Allow request
    return NextResponse.next();
}
