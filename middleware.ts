import { type NextRequest, NextResponse } from 'next/server';
// import { rootDomain } from '@/lib/utils';

// const appconfig={
//    domainapi :'https://f7.donggiatri.com/users/demo/pluto/'
// };

const domains = {
  "/":"pos/",
  "cafe":"pos/",
  "food":"pos/",
  "shop":"pos/",
  "karaoke":"pos/",
  "bida":"pos/" 
};

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];


  if (hostname.includes('.vercel.app')) {
    return "/";
  }

  
  
  // Local development environment
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0];
    }


    return null;
  }

  return hostname.includes('.')?hostname.split('.').slice(0, -2).join('.'):null;

  // // Production environment
  // const rootDomainFormatted = rootDomain.split(':')[0];

  // // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  // if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
  //   const parts = hostname.split('---');
  //   return parts.length > 0 ? parts[0] : null;
  // }



  // // Regular subdomain detection
  // const isSubdomain =
  //   hostname !== rootDomainFormatted &&
  //   hostname !== `www.${rootDomainFormatted}` &&
  //   hostname.endsWith(`.${rootDomainFormatted}`);

  // return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null;
}

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


    if(subdomain.includes("admin")){
       subdomain = "admin";
    }else{
       subdomain = domains[subdomain]?domains[subdomain]:domains["/"];
    }

   

    // Block access to admin page from subdomains
    if (pathname.startsWith('/admin')) {
      response =  NextResponse.redirect(new URL('/', request.url));
    }else if (pathname === '/') {
      // For the root path on a subdomain, rewrite to the subdomain page
      response = NextResponse.rewrite(new URL(`/s/${subdomain}`, request.url));
    }else if (pathname.startsWith('/api/')) { 
      //detail api
      response = NextResponse.json(new URL(`/s/${subdomain}/api/index/`, request.url));
    }
  }else if (pathname != '/') {
    //detail api
    if (pathname.startsWith('/api/')) { 
      response = NextResponse.json(new URL('/api/index/', request.url));
    }else{
      response = NextResponse.rewrite(new URL('/', request.url));
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
    '/((?!api|_next|build|s|[\\w-]+\\.\\w+).*)'
  ]
};
