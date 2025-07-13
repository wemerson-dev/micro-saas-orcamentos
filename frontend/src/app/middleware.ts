import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const pathname = request.nextUrl.pathname;

    const isLoginPage = pathname === "/login"
    const isProtectedRoute = pathname !== "/login" && pathname !== "/"

    
    if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
    }

    if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url))
    }

    
    const cAuth = Boolean(token);
    const cLoginPage = request.nextUrl.pathname.startsWith("/login");

    if (!cAuth && !cLoginPage) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (cAuth && cLoginPage) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next|static|favicon.ico).*)',
    ]
};