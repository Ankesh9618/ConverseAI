
"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Bot, Languages, Loader2, SpellCheck } from "lucide-react";

export interface Message {
  id: string;
  speaker: "user" | "agent";
  text: string;
  originalLanguage?: string;
  translatedText?: string;
  isTranslating?: boolean;
  grammarFeedback?: string;
  isCheckingGrammar?: boolean;
}

interface ConversationMessageProps {
  message: Message;
  selectedLanguage: string;
  onTranslate?: (messageId: string, textToTranslate: string, originalLanguage: string) => void;
  onCheckGrammar?: (messageId: string, textToCheck: string, language: string) => void;
}

export function ConversationMessage({ message, selectedLanguage, onTranslate, onCheckGrammar }: ConversationMessageProps) {
  const isUser = message.speaker === "user";

  const showTranslateButton = 
    message.originalLanguage &&
    message.originalLanguage !== "English" &&
    onTranslate;
  
  const showGrammarCheckButton = 
    isUser && 
    onCheckGrammar &&
    message.originalLanguage; // Only show if original language is known

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
        
        {(message.translatedText || message.grammarFeedback) && (
          <div className="mt-2 pt-2 border-t border-border/50 space-y-2">
            {message.translatedText && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-0.5">Translation (English):</p>
                <p className="text-sm italic leading-relaxed whitespace-pre-wrap text-muted-foreground">{message.translatedText}</p>
              </div>
            )}
            {message.grammarFeedback && (
               <div>
                <p className="text-xs font-semibold text-muted-foreground mb-0.5">Grammar Feedback:</p>
                <p className="text-sm italic leading-relaxed whitespace-pre-wrap text-muted-foreground">{message.grammarFeedback}</p>
              </div>
            )}
          </div>
        )}

        {(showTranslateButton || showGrammarCheckButton) && (
          <div className={cn("mt-2 flex items-center gap-2", (message.translatedText || message.grammarFeedback) ? "pt-2 border-t border-border/50" : "")}>
            {showTranslateButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto py-1 px-2 text-xs text-primary hover:bg-primary/10"
                onClick={() => onTranslate && message.originalLanguage && onTranslate(message.id, message.text, message.originalLanguage)}
                disabled={message.isTranslating || message.isCheckingGrammar}
              >
                {message.isTranslating ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Languages className="mr-1 h-3 w-3" />
                )}
                Translate
              </Button>
            )}
            {showGrammarCheckButton && message.originalLanguage && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto py-1 px-2 text-xs text-primary hover:bg-primary/10"
                onClick={() => onCheckGrammar && message.originalLanguage && onCheckGrammar(message.id, message.text, message.originalLanguage)}
                disabled={message.isCheckingGrammar || message.isTranslating}
              >
                {message.isCheckingGrammar ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <SpellCheck className="mr-1 h-3 w-3" />
                )}
                Check Grammar
              </Button>
            )}
          </div>
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
