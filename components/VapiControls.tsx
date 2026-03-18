"use client";

import useVapi from "@/hooks/useVapi";
import { IBook } from "@/types";
import { Mic } from "lucide-react";
import Image from "next/image";
import { MicOff } from "lucide-react";
import Transcript from "./Transcript";



const VapiControls = ({ book }: { book: IBook }) => {
   const { status, isActive, messages, currentMessage, currentUserMessage, duration, start,
      stop, clearError} = useVapi(book);

   return (
      <>
         <div className="max-w-4xl mx-auto flex flex-col gap-8">
            {/* Header Card */}
            <div className="vapi-header-card">
               <div className="vapi-cover-wrapper">
                  <Image 
                     src={book.coverURL || "/images/book-placeholder.png"}
                     alt={book.title}
                     width={120}
                     height={180}
                     className="vapi-cover-image !w-[120px] !h-auto"
                     priority
                  />
               <div className="vapi-mic-wrapper">
                  <button 
                     onClick={ isActive ? stop : start }
                     disabled={status === 'connecting'}
                     className={`vapi-mic-btn shadow-md !w-[60px] !h-[60px] z-10 ${isActive 
                        ? 'vapi-mic-btn-active'
                        : 'vapi-mic-btn-inactive'}`}>

                     {isActive ? (
                        <Mic  className="size-7 text-white"/>
                     ) : (
                        <MicOff className="size-7 text-[#212a3b]"/>
                     )}
                  </button>
               </div>
            </div>

            <div className="flex flex-col gap-4 flex-1 pl-4 pt-1">
               <div>
                  <h1 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                     {book.title}
                  </h1>
                  <p className="text-gray-500 mt-1 text-sm md:text-base">
                     by {book.author}
                  </p>
               </div>

               <div className="flex flex-row flex-wrap gap-3">
                  <div className="vapi-status-indicator">
                     <span className="vapi-status-dot vapi-status-dot-ready" />
                     <span className="vapi-status-text">Ready</span>
                  </div>
                  <div className="vapi-status-indicator">
                     <span className="vapi-status-text">Voice: {book.voice ?? "Default"}</span>
                  </div>
                  <div className="vapi-status-indicator">
                     <span className="vapi-status-text">0:00 / 15:00</span>
                  </div>
               </div>
            </div>
         </div>
      
         {/* Transcript Area */}
         {/* <div className="transcript-container min-h-[400px]">
            <div className="transcript-empty">
               <Mic className="size-12 text-[#212a3b] mb-4"/>
               <h2 className="transcript-empty-text">No conversation yet</h2>
               <p className="transcript-empty-hint">
                  Click the mic button above to start talking
               </p>
            </div>
         </div> */}

         <div className="vapi-transcript-wrapper">
            <div className="transcript-container min-h-[400px]">
               <Transcript 
                  messages={messages}
                  currentMessage={currentMessage}
                  currentUserMessage={currentUserMessage}
               />
            </div>
         </div>
      </div>
      </>
   )
}

export default VapiControls
