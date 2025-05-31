import type { LucideIcon } from 'lucide-react';
import { Users, Utensils, ShoppingCart, MapPin, Box, Languages } from 'lucide-react';

export interface LanguageOption {
  value: string;
  label: string;
  Icon?: LucideIcon;
}

export interface ScenarioOption {
  value: string;
  label: string;
  Icon: LucideIcon;
}

export const LANGUAGES: LanguageOption[] = [
  { value: 'English', label: 'English', Icon: Languages },
  { value: 'Spanish', label: 'Español', Icon: Languages },
  { value: 'French', label: 'Français', Icon: Languages },
  { value: 'German', label: 'Deutsch', Icon: Languages },
  { value: 'Japanese', label: '日本語', Icon: Languages },
  { value: 'Mandarin Chinese', label: '中文 (普通话)', Icon: Languages },
  { value: 'Italian', label: 'Italiano', Icon: Languages },
];

export const SCENARIOS: ScenarioOption[] = [
  { value: 'Meeting a stranger', label: 'Meeting a Stranger', Icon: Users },
  { value: 'Ordering food at a restaurant', label: 'Ordering Food', Icon: Utensils },
  { value: 'Buying groceries at a supermarket', label: 'Buying Groceries', Icon: ShoppingCart },
  { value: 'Asking for directions', label: 'Asking for Directions', Icon: MapPin },
  { value: 'Sandbox', label: 'Sandbox (Open Conversation)', Icon: Box },
];

export const DEFAULT_LANGUAGE = LANGUAGES[0].value;
export const DEFAULT_SCENARIO = SCENARIOS[0].value;
