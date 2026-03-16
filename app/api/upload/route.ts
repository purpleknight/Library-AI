import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"
import { MAX_FILE_SIZE } from "@/lib/constants";

export async function POST(request: Request): Promise<NextResponse> {
   // Auth check outside handleUpload
   const { userId } = await auth();

   if (!userId) {
      // throw new Error("Unauthorized: User not authenticated.");
      return NextResponse.json({ error: 'Unauthorized'}, { status: 401 });
   }
   const body = ( await request.json()) as HandleUploadBody;

   try {
      const jsonResponse = await handleUpload({
         token: process.env.BLOB_READ_WRITE_TOKEN,
         body, 
         request, 
         onBeforeGenerateToken: async (pathname, clientPayload) => {
            return {
               allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
               addRandomSuffix: true,
               maximumSizeInBytes: MAX_FILE_SIZE,
               tokenPayload: JSON.stringify({ userId })
            }
         },
         onUploadCompleted: async ({ blob, tokenPayload}) => {
            console.log("File uploaded to blob: ", blob.url)

            const payload = tokenPayload ? JSON.parse(tokenPayload): null;
            const uploadedByUserId = payload?.userId;
            console.log('Uploaded by userId: ', payload?.uploadedByUserId)

            // TODO: PostHog
         }
      });

      return NextResponse.json(jsonResponse);
   } catch (e) {
      const message = e instanceof Error ? e.message: "An unknown error occurred.";
      const status = message.includes('Unauthorized') ? 401 : 500;
      return NextResponse.json({ error: message }, { status });
   }
}