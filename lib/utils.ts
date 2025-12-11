
// import { clsx, type ClassValue } from 'clsx';
// import { twMerge } from 'tailwind-merge';

// export const protocol =
//   process.env.NODE_ENV === 'production' ? 'https' : 'http';
// export const rootDomain =
//   process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }


 
const domains = {
  "/":"pos/",
  "cafe":"pos/",
  "food":"pos/",
  "shop":"pos/",
  "karaoke":"pos/",
  "bida":"pos/" ,
  "chat":"chat/" 
};


export function extractSubdomain(request) {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  let subdomain = "/";

  if (hostname.includes('.vercel.app')) {
    return subdomain;
  }

  
  
  // Local development environment
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
     
    if (hostname.includes('.localhost')) {
      subdomain =  hostname.split('.')[0];
    }

    
  }else{
    subdomain =  hostname.includes('.')?hostname.split('.').slice(0, -2).join('.'):null;
  }
  
  if(subdomain){
  if(subdomain.includes("admin")){
       subdomain = "admin";
    }else{
       subdomain = domains[subdomain]?domains[subdomain]:domains["/"];
    }
  }
  return subdomain;
}
