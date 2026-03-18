"use client";

import useVapi, { CallStatus } from "@/hooks/useVapi";
import { IBook } from "@/types";
import { Mic } from "lucide-react";
import Image from "next/image";
import { MicOff } from "lucide-react";
import Transcript from "./Transcript";
import { formatDuration } from "@/lib/utils";

const getStatusLabel = (status: CallStatus) => {
   switch(status) {
      case 'idle': return 'Ready';
      case 'connecting': return 'Connecting...';
      case 'starting': return 'Starting...';
      case 'listening': return 'Listening...';
      case 'thinking': return 'Thinking...';
      case 'speaking': return 'Speaking...';
      default: return 'Ready';
   }
}

const getStatusDotClass = (status: CallStatus) => {
   switch(status) {
      case 'connecting': return 'vapi-status-dot-connecting';
      case 'starting': return 'vapi-status-dot-connecting';
      case 'listening': return 'vapi-status-dot-listening';
      case 'thinking': return 'vapi-status-dot-thinking';
      case 'speaking' : return 'vapi-status-dot-speaking';
      default:          return 'vapi-status-dot-ready'
   }
};


const VapiControls = ({ book }: { book: IBook }) => {
   const { status, isActive, messages, currentMessage, currentUserMessage, duration, maxDurationSeconds, start,
      stop, limitError, clearError} = useVapi(book);

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
                     type="button"
                     onClick={ isActive ? stop : start }
                     disabled={status === 'connecting'}
                     aria-label={isActive ? "Stop voice assistant": "Start voice assistant"}
                     title={isActive ? "Stop voice assistant" : "Start voice assistant"}
                     aria-pressed={isActive}
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
                     <span className={`vapi-status-dot ${getStatusDotClass(status)}`} />
                     <span className="vapi-status-text">
                        {getStatusLabel(status)}
                     </span>
                  </div>

                  <div className="vapi-status-indicator">
                     <span className="vapi-status-text">
                        Voice: {book.voice ?? "Default"}
                     </span>
                  </div>

                  <div className="vapi-status-indicator">
                     <span className="vapi-status-text">
                        {formatDuration(duration)} / {formatDuration(maxDurationSeconds)}
                     </span>
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
            {limitError && (
               <div role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <div className="flex items-start justify-between gap-3">
                     <span>{limitError}</span>
                     <button type="button" onClick={clearError} className="underline">
                        Dismiss
                     </button>
                  </div>
               </div>
            )}

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
