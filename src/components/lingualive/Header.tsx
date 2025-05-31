"use client";

import { MessageSquareText } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-primary/90 text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 md:px-6 md:py-4 flex items-center">
        <MessageSquareText className="h-8 w-8 mr-3 text-accent-foreground" />
        <h1 className="text-2xl md:text-3xl font-headline font-bold tracking-tight">
          ConverseAI
        </h1>
      </div>
    </header>
  );
}
