'use client';

import React, { useCallback, useRef } from 'react';
import { useController, FieldValues } from 'react-hook-form';
import { X } from 'lucide-react';
import { FileUploadFieldProps } from '@/types';
import { cn } from '@/lib/utils';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const FileUploader = <T extends FieldValues>({
   control,
   name,
   label,
   acceptTypes,
   disabled,
   icon: Icon,
   placeholder,
   hint,
}: FileUploadFieldProps<T>) => {
   const {
      field: { onChange, value },
   } = useController<T, typeof name>({ name, control });

   const fileList = value as FileList | undefined;
   const isUploaded = typeof FileList !== 'undefined' && 
      fileList instanceof FileList && fileList.length > 0;

   const inputRef = useRef<HTMLInputElement>(null);

   const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
         const files = e.target.files;
         if (files && files.length > 0) {
               onChange(files);
         }
      },
      [onChange]
   );

   const onRemove = useCallback(
      (e: React.MouseEvent) => {
         e.stopPropagation();
         onChange(undefined);
         if (inputRef.current) {
               inputRef.current.value = '';
         }
      },
      [onChange]
   );


   return (
      <FormItem className="w-full">
         <FormLabel className="form-label">{label}</FormLabel>
         
            <div
               className={cn(
                  'upload-dropzone border-2 border-dashed border-[#8B7355]/20',
                  isUploaded && 'upload-dropzone-uploaded'
               )}
               onClick={() => !disabled && inputRef.current?.click()}
            >
               <FormControl>
                  <input
                     type="file"
                     accept={acceptTypes.join(',')}
                     className="hidden"
                     ref={inputRef}
                     onChange={handleFileChange}
                     disabled={disabled}
                  />
               </FormControl>

                  {isUploaded ? (
                     <div className="flex flex-col items-center relative w-full px-4">
                           <p className="upload-dropzone-text line-clamp-1">
                              {fileList?.[0]?.name}
                           </p>
                           <button
                              type="button"
                              onClick={onRemove}
                              className="upload-dropzone-remove mt-2"
                           >
                              <X className="w-5 h-5" />
                           </button>
                     </div>
                  ) : (
                     <>
                           <Icon className="upload-dropzone-icon" />
                           <p className="upload-dropzone-text">{placeholder}</p>
                           <p className="upload-dropzone-hint">{hint}</p>
                     </>
                  )}
               </div>
         <FormMessage />
      </FormItem>
   );
};

export default FileUploader;