import { type NextRequest, NextResponse } from 'next/server';
import { extractSubdomain } from '@/lib/utils';

  
export async function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  // const country = request.geo?.country || 'US';
 
  // Define allowed origins dynamically
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://app.example.com', 'https://admin.example.com']
    : ['http://localhost:3000', 'http://localhost:3001'];
  
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'null',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, auth-token',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const { pathname } = request.nextUrl;
  let subdomain = extractSubdomain(request);
  

  // On the root domain, allow normal access
  let response= NextResponse.next();

  if (subdomain) {

 
    // Block access to admin page from subdomains
    if (pathname.startsWith('/admin')) {
      response =  NextResponse.redirect(new URL('/', request.url));
    }else if (pathname === '/') {
      // For the root path on a subdomain, rewrite to the subdomain page
      response = NextResponse.rewrite(new URL(`/s/${subdomain}`, request.url));
    }else if (pathname.startsWith('/api/')) { 
      console.log(request.url,` => /s/${subdomain}/api/index/`,pathname);
      //detail api in subdomain
      response = NextResponse.redirect(new URL(`/s/${subdomain}/${pathname}`, request.url));
    } 
  }else if (pathname != '/') {
    //detail api
    if (pathname.startsWith('/api/')) { 
      response = NextResponse.json(new URL('/api/index/', request.url));
    }else{
      response = NextResponse.redirect(new URL('/', request.url));
    } 
      
  }

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export const config = {
  matcher: [ 
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!_next|build|s|[\\w-]+\\.\\w+).*)'
  ]
};
