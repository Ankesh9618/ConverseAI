
"use client";

import type { Message } from "./ConversationMessage";
import { ConversationMessage } from "./ConversationMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useEffect, useRef } from "react";
import { BotMessageSquare, Bot } from "lucide-react";

interface ConversationAreaProps {
  messages: Message[];
  isLoading: boolean;
  selectedLanguage: string;
  onTranslateMessage?: (messageId: string, textToTranslate: string, originalLanguage: string) => void;
  onCheckGrammar?: (messageId: string, textToCheck: string, language: string) => void;
}

export function ConversationArea({ messages, isLoading, selectedLanguage, onTranslateMessage, onCheckGrammar }: ConversationAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  return (
    <ScrollArea
      className="h-[450px] rounded-lg border bg-card shadow-inner p-4 md:p-6"
      ref={scrollAreaRef}
    >
      <div className="space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground pt-10">
            <BotMessageSquare className="w-16 h-16 mb-4" />
            <p className="text-lg">Your conversation will appear here.</p>
            <p className="text-sm">Select a language and scenario, then type your first message below.</p>
          </div>
        )}
        {messages.map((msg) => (
          <ConversationMessage 
            key={msg.id} 
            message={msg}
            selectedLanguage={selectedLanguage}
            onTranslate={onTranslateMessage}
            onCheckGrammar={onCheckGrammar}
          />
        ))}
        {isLoading && messages.length > 0 && messages[messages.length -1].speaker === 'user' && (
           <div className="flex items-start gap-3 my-3 justify-start">
             <div className="h-8 w-8 flex items-center justify-center rounded-full bg-accent text-accent-foreground shadow">
               <Bot className="h-5 w-5 animate-pulse" />
             </div>
             <div className="max-w-[70%] rounded-xl px-4 py-3 shadow-md bg-card text-card-foreground rounded-bl-none border">
                <p className="text-sm italic text-muted-foreground">Agent is typing...</p>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
