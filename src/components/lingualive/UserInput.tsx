"use client";

import { useState, type FormEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Lightbulb, Loader2 } from "lucide-react";

interface UserInputProps {
  onSendMessage: (message: string) => void;
  onGetSuggestion?: () => void;
  isLoading: boolean;
  isLoadingSuggestion?: boolean;
  isSandboxMode: boolean;
  disabled?: boolean;
}

export function UserInput({
  onSendMessage,
  onGetSuggestion,
  isLoading,
  isLoadingSuggestion = false,
  isSandboxMode,
  disabled = false,
}: UserInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card p-4 rounded-lg border shadow-sm">
      <div className="flex items-end gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 resize-none rounded-lg text-base shadow-sm focus:ring-accent"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={disabled || isLoading}
          aria-label="Your message"
        />
        <div className="flex flex-col gap-2">
          {isSandboxMode && onGetSuggestion && (
            <Button
              type="button"
              onClick={onGetSuggestion}
              variant="outline"
              size="icon"
              className="rounded-lg h-11 w-11 border-accent text-accent hover:bg-accent/10"
              disabled={disabled || isLoading || isLoadingSuggestion}
              aria-label="Get a suggestion"
            >
              {isLoadingSuggestion ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Lightbulb className="h-5 w-5" />
              )}
            </Button>
          )}
           <Button
            type="submit"
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-11 w-11"
            disabled={disabled || isLoading || !message.trim()}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
