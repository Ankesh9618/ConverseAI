import type { LucideIcon } from 'lucide-react';
import { Users, Utensils, ShoppingCart, MapPin, Box, Languages, Keyboard, Mic } from 'lucide-react';

export interface LanguageOption {
  value: string;
  label: string;
  Icon?: LucideIcon;
  bcp47: string; // Added for Web Speech API (STT & TTS)
}

export interface ScenarioOption {
  value: string;
  label: string;
  Icon: LucideIcon;
}

export interface InteractionModeOption {
  value: 'written' | 'verbal';
  label: string;
  Icon: LucideIcon;
}

export const LANGUAGES: LanguageOption[] = [
  { value: 'English', label: 'English', Icon: Languages, bcp47: 'en-US' },
  { value: 'Spanish', label: 'Español', Icon: Languages, bcp47: 'es-ES' },
  { value: 'French', label: 'Français', Icon: Languages, bcp47: 'fr-FR' },
  { value: 'German', label: 'Deutsch', Icon: Languages, bcp47: 'de-DE' },
  { value: 'Japanese', label: '日本語', Icon: Languages, bcp47: 'ja-JP' },
  { value: 'Mandarin Chinese', label: '中文 (普通话)', Icon: Languages, bcp47: 'zh-CN' },
  { value: 'Italian', label: 'Italiano', Icon: Languages, bcp47: 'it-IT' },
];

export const SCENARIOS: ScenarioOption[] = [
  { value: 'Meeting a stranger', label: 'Meeting a Stranger', Icon: Users },
  { value: 'Ordering food at a restaurant', label: 'Ordering Food', Icon: Utensils },
  { value: 'Buying groceries at a supermarket', label: 'Buying Groceries', Icon: ShoppingCart },
  { value: 'Asking for directions', label: 'Asking for Directions', Icon: MapPin },
  { value: 'Sandbox', label: 'Sandbox (Open Conversation)', Icon: Box },
];

export const INTERACTION_MODES: InteractionModeOption[] = [
  { value: 'written', label: 'Written', Icon: Keyboard },
  { value: 'verbal', label: 'Verbal', Icon: Mic },
];

export const DEFAULT_LANGUAGE = LANGUAGES[0].value;
export const DEFAULT_SCENARIO = SCENARIOS[0].value;
export const DEFAULT_INTERACTION_MODE = INTERACTION_MODES[0].value;
