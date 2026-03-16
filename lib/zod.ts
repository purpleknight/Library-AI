import { z } from 'zod';
import {MAX_FILE_SIZE, ACCEPTED_PDF_TYPES, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE} from './constants';

export const UploadSchema = z.object({
   title: z.string().min(1, "Title is required").max(100, "Title is too long"),
   author: z.string().min(1, "Author name is required").max(100, "Author name is too long"),
   voice: z.string().min(1, "Please select a voice"),
   pdfFile: z
      .custom<FileList>((val) => val instanceof FileList, "PDF file is required")
      .refine((files) => files.length > 0, "PDF file is required")
      .refine((files) => files[0]?.size <= MAX_FILE_SIZE, "File size must be less than 50MB")
      .refine((files) => ACCEPTED_PDF_TYPES.includes(files[0]?.type), "Only PDF files are accepted"),

   coverImage: z
      .custom<FileList>((val) => val instanceof FileList)
      .refine((files) => files.length === 0 || files[0]?.size <= MAX_IMAGE_SIZE, "Image size must be less than 10MB")
      .refine((files) => files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0]?.type), "Only .jpg, .jpeg, .png and .webp formats are supported")
      .optional(),
});