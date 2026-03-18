import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const role = req.cookies.get("govtech_user_role")?.value;
    const path = req.nextUrl.pathname;

    // Admin routes
    if (path.startsWith("/admin")) {
        if (role !== "admin") {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    // Officer routes
    if (path.startsWith("/officer")) {
        if (role !== "officer" && role !== "admin") {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    // Citizen & Submit routes
    if (path.startsWith("/user") || path.startsWith("/submit")) {
        if (role !== "citizen" && role !== "admin") {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/officer/:path*", "/user/:path*", "/submit"],
};
