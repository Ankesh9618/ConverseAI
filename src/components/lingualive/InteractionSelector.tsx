// src/components/lingualive/InteractionSelector.tsx
"use client";

import type { InteractionModeOption } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MessageCircle } from 'lucide-react'; // Generic icon for interaction mode

interface InteractionSelectorProps {
  interactionModes: InteractionModeOption[];
  selectedInteractionMode: InteractionModeOption['value'];
  onSelectInteractionMode: (mode: InteractionModeOption['value']) => void;
  disabled?: boolean;
}

export function InteractionSelector({
  interactionModes,
  selectedInteractionMode,
  onSelectInteractionMode,
  disabled = false,
}: InteractionSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="interaction-mode-select" className="flex items-center text-base">
        <MessageCircle className="mr-2 h-5 w-5 text-primary" />
        Interaction Mode
      </Label>
      <Select
        value={selectedInteractionMode}
        onValueChange={onSelectInteractionMode}
        disabled={disabled}
      >
        <SelectTrigger id="interaction-mode-select" className="w-full text-base py-3 h-auto rounded-lg shadow-sm">
          <SelectValue placeholder="Select interaction mode..." />
        </SelectTrigger>
        <SelectContent>
          {interactionModes.map((mode) => (
            <SelectItem key={mode.value} value={mode.value} className="text-base py-2">
              <div className="flex items-center">
                <mode.Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                {mode.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
