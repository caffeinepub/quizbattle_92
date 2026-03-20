import { cn } from "@/lib/utils";
import { type ThemeValue, getThemeConfig } from "../utils/constants";

interface ThemeBackgroundProps {
  theme: string;
  className?: string;
  children: React.ReactNode;
}

const DECORATIVE_ELEMENTS: Record<ThemeValue, React.ReactNode> = {
  standard: (
    <>
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-indigo-500/5 blur-3xl" />
    </>
  ),
  winter: (
    <>
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-400/8 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-blue-400/8 blur-3xl" />
      <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white/10" />
      <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-white/8" />
      <div className="absolute bottom-1/4 right-1/4 w-1 h-1 rounded-full bg-white/10" />
      <div className="absolute top-2/3 left-1/5 w-2 h-2 rounded-full bg-white/6" />
    </>
  ),
  spring: (
    <>
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-emerald-400/8 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full bg-teal-400/6 blur-3xl" />
      <div className="absolute top-1/4 right-1/6 w-3 h-3 rounded-full bg-green-300/10 blur-sm" />
      <div className="absolute bottom-1/3 left-1/4 w-4 h-4 rounded-full bg-emerald-300/8 blur-sm" />
    </>
  ),
  festive: (
    <>
      <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full bg-red-500/8 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-amber-400/8 blur-3xl" />
      <div className="absolute top-1/5 right-1/5 w-2 h-2 rounded-full bg-amber-300/15" />
      <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 rounded-full bg-red-300/12" />
      <div className="absolute bottom-1/4 right-1/3 w-2 h-2 rounded-full bg-amber-200/10" />
    </>
  ),
  professional: (
    <>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-slate-500/3 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-zinc-500/3 blur-3xl" />
    </>
  ),
};

export function ThemeBackground({
  theme,
  className,
  children,
}: ThemeBackgroundProps) {
  const config = getThemeConfig(theme);
  const themeKey = (
    ["standard", "winter", "spring", "festive", "professional"].includes(theme)
      ? theme
      : "standard"
  ) as ThemeValue;

  return (
    <div
      className={cn("relative overflow-hidden", config.bgGradient, className)}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {DECORATIVE_ELEMENTS[themeKey]}
      </div>
      {children}
    </div>
  );
}
