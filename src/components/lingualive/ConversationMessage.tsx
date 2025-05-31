
"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Bot, Languages, Loader2 } from "lucide-react";

export interface Message {
  id: string;
  speaker: "user" | "agent";
  text: string;
  originalLanguage?: string; // Language the message was originally in
  translatedText?: string;  // English translation
  isTranslating?: boolean;  // To show loading state for translation
}

interface ConversationMessageProps {
  message: Message;
  selectedLanguage: string;
  onTranslate?: (messageId: string, textToTranslate: string, originalLanguage: string) => void;
}

export function ConversationMessage({ message, selectedLanguage, onTranslate }: ConversationMessageProps) {
  const isUser = message.speaker === "user";
  const showTranslateButton = 
    !isUser && 
    selectedLanguage !== "English" &&
    message.originalLanguage === selectedLanguage && // Only show for current non-English convo
    onTranslate;

  return (
    <div
      className={cn(
        "flex items-start gap-3 my-3 animate-in fade-in duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 bg-accent text-accent-foreground shadow">
          <AvatarFallback>
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-xl px-4 py-3 shadow-md",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card text-card-foreground rounded-bl-none border"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        {message.translatedText && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground mb-0.5">Translation (English):</p>
            <p className="text-sm italic leading-relaxed whitespace-pre-wrap text-muted-foreground">{message.translatedText}</p>
          </div>
        )}
        {showTranslateButton && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 h-auto py-1 px-2 text-xs text-primary hover:bg-primary/10"
            onClick={() => onTranslate && onTranslate(message.id, message.text, message.originalLanguage || selectedLanguage)}
            disabled={message.isTranslating}
          >
            {message.isTranslating ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Languages className="mr-1 h-3 w-3" />
            )}
            Translate to English
          </Button>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 bg-secondary text-secondary-foreground shadow">
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
