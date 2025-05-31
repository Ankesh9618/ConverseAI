"use client";

import type { ConversationSummary } from '@/services/conversationService';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, MessageSquare } from 'lucide-react';

interface ConversationHistoryManagerProps {
  summaries: ConversationSummary[];
  activeConversationId: string | null;
  onLoadConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation?: (id: string) => void; // Optional: if deleting specific from list
  onDeleteCurrentConversation?: () => void; // For deleting the active one
  isLoading: boolean;
}

export function ConversationHistoryManager({
  summaries,
  activeConversationId,
  onLoadConversation,
  onNewConversation,
  onDeleteCurrentConversation,
  isLoading,
}: ConversationHistoryManagerProps) {
  return (
    <Card className="mb-4 md:mb-6 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <MessageSquare className="mr-2 h-6 w-6 text-primary" />
          My Conversations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <Button
            onClick={onNewConversation}
            disabled={isLoading}
            className="flex-1 sm:flex-auto"
            variant="outline"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> New Conversation
          </Button>
          {activeConversationId && onDeleteCurrentConversation && (
            <Button
              onClick={onDeleteCurrentConversation}
              disabled={isLoading || !activeConversationId}
              variant="destructive"
              className="flex-1 sm:flex-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Current
            </Button>
          )}
        </div>
        {summaries.length > 0 ? (
          <ScrollArea className="h-40 rounded-md border p-2 bg-background shadow-inner">
            <div className="space-y-1">
              {summaries.map((summary) => (
                <Button
                  key={summary.id}
                  variant={summary.id === activeConversationId ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => onLoadConversation(summary.id)}
                  disabled={isLoading}
                  title={`Load: ${summary.name}\nLast updated: ${summary.lastUpdatedAt.toLocaleString()}`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-xs sm:max-w-sm md:max-w-md">
                      {summary.name || `Conversation ${summary.id.substring(0,6)}...`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {summary.lastUpdatedAt.toLocaleDateString()} {summary.lastUpdatedAt.toLocaleTimeString()}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No saved conversations yet. Start a new one!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
