"use client";

import type { LanguageOption } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Languages } from 'lucide-react';

interface LanguageSelectorProps {
  languages: LanguageOption[];
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
  disabled?: boolean;
}

export function LanguageSelector({
  languages,
  selectedLanguage,
  onSelectLanguage,
  disabled = false,
}: LanguageSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="language-select" className="flex items-center text-base">
        <Languages className="mr-2 h-5 w-5 text-primary" />
        Choose a Language
      </Label>
      <Select
        value={selectedLanguage}
        onValueChange={onSelectLanguage}
        disabled={disabled}
      >
        <SelectTrigger id="language-select" className="w-full text-base py-3 h-auto rounded-lg shadow-sm">
          <SelectValue placeholder="Select a language..." />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.value} value={lang.value} className="text-base py-2">
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
