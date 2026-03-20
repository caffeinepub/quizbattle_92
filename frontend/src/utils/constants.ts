export const TIME_LIMIT_OPTIONS = [
  { value: 5, label: "5 seconds" },
  { value: 10, label: "10 seconds" },
  { value: 15, label: "15 seconds" },
  { value: 20, label: "20 seconds" },
  { value: 30, label: "30 seconds" },
  { value: 45, label: "45 seconds" },
  { value: 60, label: "1 minute" },
  { value: 90, label: "1 min 30s" },
  { value: 120, label: "2 minutes" },
  { value: 180, label: "3 minutes" },
  { value: 240, label: "4 minutes" },
] as const;

export const POINT_MODE_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "double", label: "Double Points" },
  { value: "none", label: "No Points" },
] as const;

export const MAX_OPTIONS = 4;
export const MIN_OPTIONS = 2;
export const MAX_TITLE_LENGTH = 200;
export const MAX_QUESTION_TEXT_LENGTH = 200;
export const MAX_OPTION_TEXT_LENGTH = 100;
export const MAX_ACCEPTED_ANSWERS = 20;
export const MAX_QUESTIONS_PER_QUIZ = 100;

export type ThemeValue =
  | "standard"
  | "winter"
  | "spring"
  | "festive"
  | "professional";

export interface ThemeConfig {
  label: string;
  bgGradient: string;
  textColor: string;
  accentColor: string;
  decorativeElements?: string;
}

export const THEME_OPTIONS: {
  value: ThemeValue;
  label: string;
  icon: string;
}[] = [
  { value: "standard", label: "Standard", icon: "🎮" },
  { value: "winter", label: "Winter", icon: "❄️" },
  { value: "spring", label: "Spring", icon: "🌸" },
  { value: "festive", label: "Festive", icon: "🎄" },
  { value: "professional", label: "Professional", icon: "💼" },
];

export const THEME_CONFIGS: Record<ThemeValue, ThemeConfig> = {
  standard: {
    label: "Standard",
    bgGradient:
      "bg-gradient-to-br from-violet-950 via-purple-950 to-indigo-950",
    textColor: "text-white",
    accentColor: "text-purple-300",
  },
  winter: {
    label: "Winter",
    bgGradient: "bg-gradient-to-br from-sky-950 via-cyan-950 to-blue-950",
    textColor: "text-white",
    accentColor: "text-cyan-300",
  },
  spring: {
    label: "Spring",
    bgGradient: "bg-gradient-to-br from-emerald-950 via-green-950 to-teal-950",
    textColor: "text-white",
    accentColor: "text-emerald-300",
  },
  festive: {
    label: "Festive",
    bgGradient: "bg-gradient-to-br from-red-950 via-rose-950 to-amber-950",
    textColor: "text-white",
    accentColor: "text-amber-300",
  },
  professional: {
    label: "Professional",
    bgGradient: "bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900",
    textColor: "text-white",
    accentColor: "text-slate-300",
  },
};

export function getThemeConfig(theme: string): ThemeConfig {
  return THEME_CONFIGS[theme as ThemeValue] ?? THEME_CONFIGS.standard;
}

export const OPTION_COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-green-500",
];

export const BAR_COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-green-500",
];

export function getImagePlacement(q: {
  imagePlacement?: string;
}): "centered" | "background" {
  if (q.imagePlacement === "background") return "background";
  return "centered";
}

export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

import { QuestionType } from "../backend";

export const QUESTION_TYPE_MAP: Record<string, string> = {
  [QuestionType.quiz]: "quiz",
  [QuestionType.trueFalse]: "trueFalse",
  [QuestionType.typeAnswer]: "typeAnswer",
  [QuestionType.slider]: "slider",
};
