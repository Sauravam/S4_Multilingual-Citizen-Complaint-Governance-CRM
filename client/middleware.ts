import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Check if the route is protected
    const isAdminRoute = pathname.startsWith('/admin');
    const isOfficerRoute = pathname.startsWith('/officer');
    const isUserRoute = pathname.startsWith('/user');
    
    if (!isAdminRoute && !isOfficerRoute && !isUserRoute) {
        return NextResponse.next();
    }
    
    // Get user from cookie
    const userCookie = request.cookies.get('govtech_user_role');
    const userRole = userCookie?.value;
    
    if (!userRole) {
        // Not logged in, redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Check permissions
    if (isAdminRoute && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
    }
    
    if (isOfficerRoute && userRole !== 'officer' && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
    }
    
    if (isUserRoute && userRole !== 'citizen' && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/officer/:path*', '/user/:path*'],
};
