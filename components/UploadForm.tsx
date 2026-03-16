'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, ImageIcon } from 'lucide-react';
import { BookUploadFormValues } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ACCEPTED_PDF_TYPES, ACCEPTED_IMAGE_TYPES, DEFAULT_VOICE } from '@/lib/constants';
import FileUploader from './FileUploader';
import VoiceSelector from './VoiceSelector';
import LoadingOverlay from './LoadingOverlay';
import { UploadSchema } from '@/lib/zod';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { checkBookExists, createBook, saveBookSegments } from '@/lib/actions/book.action';
import { useRouter } from 'next/navigation';
import { parsePDFFile } from '@/lib/utils';
import { upload } from '@vercel/blob/client';

const UploadForm = () => {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const { userId } = useAuth();
   const router = useRouter();
   // const [isMounted, setIsMounted] = useState(false);

   // useEffect(() => {
   //    setIsMounted(true);
   // }, []);

   const form = useForm<BookUploadFormValues>({
      resolver: zodResolver(UploadSchema),
      defaultValues: {
         title: '',
         author: '',
         voice: DEFAULT_VOICE,
         pdfFile: undefined,
         coverImage: undefined,
      },
   });

   const onSubmit = async( data: BookUploadFormValues) => {
      // ADD THIS BLOCK FIRST
      try {
         const testResponse = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               type: 'blob.generate-client-token',
               payload: {
                  pathname: 'test.pdf',
                  multipart: false,
                  clientPayload: null,
               }
            }),
         });
         console.log('Route status:', testResponse.status);
         const testJson = await testResponse.json();
         console.log('Route response:', JSON.stringify(testJson));
      } catch(e) {
         console.log('Route fetch error:', e);
      }
      // END DIAGNOSTIC BLOCK

      if (!userId) {
         return toast.error("Please login to upload books.");
      }
      setIsSubmitting(true);
      // PostHog -> Track Book Uploads...
      try {
         const existsCheck = await checkBookExists(data.title);
         if (existsCheck.exists && existsCheck.book) {
            toast.info("Book with same title already exists.");
            form.reset();
            router.push(`/books/${existsCheck.book.slug}`)
            return;
         }

         const fileTitle = data.title.replace(/\s+/g, '-').toLowerCase();
         const pdfFile = data.pdfFile instanceof FileList ? data.pdfFile[0] : data.pdfFile;

         const parsedPDF = await parsePDFFile(pdfFile);

         if (parsedPDF.content.length === 0) {
            toast.error(`Failed to parse PDF. Please try again
               with a different file.`);
            return;
         }

         const uploadedPdfBlob = await upload(fileTitle, pdfFile, {
            access: 'public',
            handleUploadUrl: '/api/upload',
            contentType: 'application/pdf'
         });

         let coverUrl: string;

         if(data.coverImage && data.coverImage.length > 0) {
            const coverFile = data.coverImage?.[0];
            const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, coverFile, {
               access: 'public',
               handleUploadUrl: '/api/upload',
               contentType: coverFile.type,
            });

            coverUrl = uploadedCoverBlob.url;
         } else {
            const response = await fetch(parsedPDF.cover);
            const blob = await response.blob();

            const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
               access: 'public',
               handleUploadUrl: '/api/upload',
               contentType: 'image/png'
            });
            coverUrl = uploadedCoverBlob.url;
         }

         const book = await createBook({
            clerkId: userId,
            title: data.title,
            author: data.author,
            voice: data.voice,
            fileURL: uploadedPdfBlob.url,
            fileBlobKey: uploadedPdfBlob.pathname,
            coverURL: coverUrl,
            fileSize: pdfFile.size,
         });

         if (!book.success) throw new Error("Failed to create book");
         
         if(book.alreadyExists) {
            toast.info("Book with same title already exists.");
            form.reset();
            router.push(`/books/${book.data.slug}`)
            return;
         }

         const segments = await saveBookSegments(book.data._id, userId, parsedPDF.content);

         if(!segments.success) {
            toast.error("Failed to save book segments.");
            throw new Error("Failed to save book segments.");
         }

         form.reset();
         router.push('/');

      } catch (error) {
         console.error(error);

         toast.error("Failed to upload book. Please try again later")
      } finally {
         setIsSubmitting(false);
      }
   };

   // if (!isMounted) return null;

   return(
      <>
         {isSubmitting && <LoadingOverlay />}

         <div className="new-book-wrapper">
            <Form {... form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/*1. PDF File Upload */}
                  <FormField
                     control={form.control}
                     name="pdfFile"
                     render={({ field }) => (
                        <FileUploader
                           control={form.control}
                           name="pdfFile"
                           label="Book PDF File"
                           acceptTypes={ACCEPTED_PDF_TYPES}
                           icon={Upload}
                           placeholder="Click to upload PDF"
                           hint="PDF file (max 50MB)"
                           disabled={isSubmitting}
                        />
                     )}
                  />

                  {/*2. Cover Image Upload */}
                  <FormField
                     control={form.control}
                     name="coverImage"
                     render={({ field }) => (
                        <FileUploader
                           control={form.control}
                           name="coverImage"
                           label="Cover Image (Optional)"
                           acceptTypes={ACCEPTED_IMAGE_TYPES}
                           icon={ImageIcon}
                           placeholder="Click to upload cover image"
                           hint="Leave empty to auto-generate from PDF"
                           disabled={isSubmitting}
                        />
                     )}
                  />

                  {/*3. Title Input */}
                  <FormField 
                     control={form.control}
                     name="title"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel className="form-label">Title</FormLabel>
                           <FormControl>
                              <Input 
                                 className="form-input"
                                 placeholder="ex: Rich Dad Poor Dad"
                                 {... field}
                                 disabled={isSubmitting}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/*4. Author Input */}
                  <FormField 
                     control={form.control}
                     name="author"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel className="form-label">Author Name</FormLabel>
                           <FormControl>
                              <Input 
                                 className="form-input"
                                 placeholder="ex: Robert Kiyosaki"
                                 {... field}
                                 disabled={isSubmitting}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/*5. Voice Selector */}
                  <FormField 
                     control={form.control}
                     name="voice"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel className="form-label">Choose Assistant Voice</FormLabel>
                           <FormControl>
                              <VoiceSelector 
                                 value={field.value}
                                 onChange={field.onChange}
                                 disabled={isSubmitting}
                              />
                           </FormControl>
                        </FormItem>
                     )}
                  />

                  {/*6. Submit Button */}
                  <Button type='submit' className='form-btn' disabled={isSubmitting}>
                     Begin Synthesis
                  </Button>

               </form>
            </Form>
         </div>
      </>
   );
}

export default UploadForm