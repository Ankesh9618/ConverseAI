"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";

export interface Message {
  id: string;
  speaker: "user" | "agent";
  text: string;
}

interface ConversationMessageProps {
  message: Message;
}

export function ConversationMessage({ message }: ConversationMessageProps) {
  const isUser = message.speaker === "user";

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
