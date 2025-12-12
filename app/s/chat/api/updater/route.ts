import { NextRequest } from 'next/server';
import { cookies, headers } from 'next/headers';
import { withAuth } from '@/lib/with-auth';
 import axios from 'axios';
import { extractSubdomain } from '@/lib/utils';


 import { IncomingForm } from 'formidable';
  import { promises as fs } from 'fs';
import path from "path";

import { revalidatePath } from 'next/cache';


 function parseBody(request){
   return new Promise((resolve, reject) => {
        const form = new IncomingForm();
        form.parse(request, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });
}

// async function secretGET(request: NextRequest) {
//   return new Response(JSON.stringify({ secret: 'Here be dragons' }), {
//     headers: { 'Content-Type': 'application/json' },
//   });
// }
 
// export const GET = withAuth(secretGET);

async function dl(url,file,f=null){
  let res = await axios.get(url);
  let pathToWriteImage = file; 
  
  let s = f?f(res.data):res.data;
  return  fs.writeFile(pathToWriteImage, s);
}

async function root(url){
  const uploadDir = path.join(process.cwd(), "public", url);
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
}


export async function GET(request: NextRequest) {
  let transformed = {code:1};
  let url  = request.nextUrl.pathname;
 
  // const referer = request.headers.get('referer');
  const subdomain = extractSubdomain(request);
 
  
  // url = appconfig.domainapi+pathname; 
  let uri = `s/${subdomain}/`;
  let path =await root(uri);
  
  try {

   await dl("https://accessbeta.donggiatri.com/v1/cua-hang/",`${path}index.html`);
   await dl("https://banhang.donggiatri.com/build/app.min.js",`${path}app.min.js`);
   await dl("https://banhang.donggiatri.com/build/jscore.js",`${path}jscore.js`,function(s){
     return s.replaceAll(`root: "/build/",`,`root: "/${uri}",`);
   });
   await dl("https://banhang.donggiatri.com/build/app.min.css",`${path}app.min.css`);
   await dl("https://banhang.donggiatri.com/build/csscore.css",`${path}csscore.css`);
  

  
}catch(ee){
  transformed={code:0,error:ee};
}
 
 
  return new Response(JSON.stringify(transformed), {
    headers: { 'Content-Type': 'application/json' },
  });
}

/*
/api/users/
 */ 
export async function POST(request: NextRequest) {
  const appconfig={
   domainapi :'https://f7.donggiatri.com/users/demo/pluto/admin/'
};

 let url  = request.nextUrl.pathname;

  // const headersList = await headers();
  // const referer = headersList.get('referer');
 
  // 2. Using the standard Web APIs
  const auth = request.headers.get('auth-token');
  const pathname = request.headers.get('x-next-pathname');


  // parse form with a Promise wrapper
  
  // const data = await parseBody(request);

  //   try {
  //           const imageFile = data.files.image; // .image because I named it in client side by that name: // pictureData.append('image', pictureFile);
  //           const imagePath = imageFile.filepath;
  //           const pathToWriteImage = `public/...`; // include name and .extention, you can get the name from data.files.image object
  //           const image = await fs.readFile(imagePath);
  //           await fs.writeFile(pathToWriteImage, image);
  //           //store path in DB
  //           res.status(200).json({ message: 'image uploaded!'});
  //       } catch (error) {
  //           res.status(500).json({ message: error.message });
  //           return;
  //       }

  
  // url = appconfig.domainapi+pathname; 
   
  let transformed = {code:1};
 
  return new Response(JSON.stringify(transformed), {
    headers: { 'Content-Type': 'application/json' },
  });
  
}


async function uploadFile(formData) {
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return { error: "No file provided." };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  // Define the destination path within the public folder
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true }); // Ensure directory exists
  const filePath = path.join(uploadDir, file.name);

  await fs.writeFile(filePath, buffer);
  console.log(`Saved file to ${filePath}`);

  // Revalidate the path to ensure the new file is detected in development
  revalidatePath("/");

  return { success: true, url: `/uploads/${file.name}` };
}
