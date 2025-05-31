
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Volume2 } from 'lucide-react'; // Icon for voice selection

interface VoiceSelectorProps {
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string | undefined;
  onSelectVoiceURI: (uri: string | undefined) => void;
  disabled?: boolean;
}

export function VoiceSelector({
  voices,
  selectedVoiceURI,
  onSelectVoiceURI,
  disabled = false,
}: VoiceSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="voice-select" className="flex items-center text-base">
        <Volume2 className="mr-2 h-5 w-5 text-primary" />
        Choose a Voice
      </Label>
      <Select
        value={selectedVoiceURI}
        onValueChange={(value) => onSelectVoiceURI(value === "default" ? undefined : value)}
        disabled={disabled || voices.length === 0}
      >
        <SelectTrigger id="voice-select" className="w-full text-base py-3 h-auto rounded-lg shadow-sm">
          <SelectValue placeholder="Select a voice..." />
        </SelectTrigger>
        <SelectContent>
          {voices.length === 0 && (
            <SelectItem value="no-voices" disabled className="text-base py-2">
              No voices available for this language
            </SelectItem>
          )}
          <SelectItem value="default" className="text-base py-2">
            Default Voice
          </SelectItem>
          {voices.map((voice) => (
            <SelectItem key={voice.voiceURI} value={voice.voiceURI} className="text-base py-2">
              {voice.name} ({voice.lang})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
