
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
    isUser && // Grammar check only for user messages
    onCheckGrammar &&
    message.originalLanguage;

  const renderActionButtons = () => {
    if (!showTranslateButton && !showGrammarCheckButton) {
      return null;
    }

    return (
      <div className={cn(
        "flex flex-col gap-1.5 self-start pt-1", // Align with top of bubble
         isUser ? "order-first mr-2" : "order-last ml-2" // Place before user bubble, after agent bubble
      )}>
        {showTranslateButton && (
          <Button
            variant="outline"
            size="sm"
            className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-accent-foreground hover:border-accent"
            onClick={() => onTranslate && message.originalLanguage && onTranslate(message.id, message.text, message.originalLanguage)}
            disabled={message.isTranslating || message.isCheckingGrammar}
            title="Translate to English"
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
            variant="outline"
            size="sm"
            className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-accent-foreground hover:border-accent"
            onClick={() => onCheckGrammar && message.originalLanguage && onCheckGrammar(message.id, message.text, message.originalLanguage)}
            disabled={message.isCheckingGrammar || message.isTranslating}
            title="Check Grammar"
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
    );
  };

  return (
    <div
      className={cn(
        "flex items-start gap-0 my-3 animate-in fade-in duration-300", // gap-0 as buttons/avatars handle their own margin
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 bg-accent text-accent-foreground shadow mr-2 self-start mt-1">
          <AvatarFallback>
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}

      {isUser && renderActionButtons()}

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
      </div>

      {!isUser && renderActionButtons()}

      {isUser && (
        <Avatar className="h-8 w-8 bg-secondary text-secondary-foreground shadow ml-2 self-start mt-1">
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
