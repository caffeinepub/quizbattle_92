import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";

const FLOATING_SHAPES = [
  {
    char: "\u25B2",
    color: "text-chart-1",
    className:
      "top-[15%] left-[8%] text-4xl sm:text-5xl animate-float opacity-20",
  },
  {
    char: "\u25C6",
    color: "text-chart-2",
    className:
      "top-[22%] right-[12%] text-3xl sm:text-4xl animate-float-slow opacity-20",
  },
  {
    char: "\u25CF",
    color: "text-chart-3",
    className:
      "bottom-[20%] left-[15%] text-5xl sm:text-6xl animate-float opacity-15",
  },
  {
    char: "\u25A0",
    color: "text-chart-4",
    className:
      "bottom-[25%] right-[10%] text-3xl sm:text-5xl animate-float-slow opacity-20",
  },
  {
    char: "\u25B2",
    color: "text-chart-1",
    className: "top-[55%] left-[5%] text-2xl animate-float-slow opacity-10",
  },
  {
    char: "\u25C6",
    color: "text-chart-5",
    className: "top-[12%] left-[45%] text-2xl animate-float opacity-10",
  },
  {
    char: "\u25A0",
    color: "text-chart-2",
    className: "bottom-[12%] right-[30%] text-2xl animate-float opacity-10",
  },
  {
    char: "\u25CF",
    color: "text-chart-4",
    className: "top-[40%] right-[5%] text-3xl animate-float opacity-10",
  },
] as const;

function AnswerTileStrip() {
  const tiles = [
    { char: "\u25B2", bg: "bg-chart-1" },
    { char: "\u25C6", bg: "bg-chart-2" },
    { char: "\u25CF", bg: "bg-chart-3" },
    { char: "\u25A0", bg: "bg-chart-4" },
  ];

  return (
    <div
      className="absolute bottom-[12%] left-[5%] hidden md:flex gap-1.5 animate-float-slow pointer-events-none select-none"
      style={{ animationDelay: "0.5s" }}
      aria-hidden="true"
    >
      {tiles.map((tile, i) => (
        <div
          key={i}
          className={cn(
            tile.bg,
            "w-10 h-8 rounded-lg shadow-sm flex items-center justify-center text-white text-sm font-bold",
          )}
        >
          {tile.char}
        </div>
      ))}
    </div>
  );
}

function MiniLeaderboard() {
  const players = [
    { emoji: "\uD83D\uDC3C", name: "nova", score: "2654" },
    { emoji: "\uD83D\uDC28", name: "kai", score: "2100" },
    { emoji: "\uD83D\uDC27", name: "milo", score: "980" },
  ];

  return (
    <div
      className="absolute top-[14%] right-[4%] hidden lg:block animate-float pointer-events-none select-none"
      style={{ animationDelay: "1.2s" }}
      aria-hidden="true"
    >
      <div className="bg-card border border-border rounded-xl shadow-md px-3 py-2.5 w-44">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
          Leaderboard
        </p>
        <div className="space-y-1">
          {players.map((p, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{p.emoji}</span>
                <span className="text-card-foreground font-medium">
                  {p.name}
                </span>
              </div>
              <span className="text-primary font-bold text-[11px]">
                {p.score}pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CountdownRing() {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const fillPercent = 0.3;

  return (
    <div
      className="absolute top-[16%] left-[6%] hidden md:flex items-center justify-center animate-float-slow pointer-events-none select-none"
      style={{ animationDelay: "2s" }}
      aria-hidden="true"
    >
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth="4"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          className="stroke-primary"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fillPercent)}
          transform="rotate(-90 28 28)"
        />
      </svg>
      <span className="absolute text-xs font-bold text-foreground">20s</span>
    </div>
  );
}

function StreakBadge() {
  return (
    <div
      className="absolute top-[28%] right-[6%] hidden lg:block animate-float pointer-events-none select-none"
      style={{ animationDelay: "0.8s" }}
      aria-hidden="true"
    >
      <div className="bg-chart-3 text-foreground rounded-full px-3 py-1 text-xs font-bold shadow-sm flex items-center gap-1">
        <span>{"\uD83D\uDD25"}</span> Streak {"\u00D7"}4
      </div>
    </div>
  );
}

export function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();

  return (
    <div className="h-dvh overflow-hidden bg-landing relative flex flex-col">
      {/* Floating background shapes */}
      {FLOATING_SHAPES.map((shape, i) => (
        <span
          key={i}
          className={`absolute select-none pointer-events-none ${shape.color} ${shape.className}`}
          aria-hidden="true"
          style={{ animationDelay: `${i * 0.7}s` }}
        >
          {shape.char}
        </span>
      ))}

      {/* Decorative game UI elements */}
      <AnswerTileStrip />
      <MiniLeaderboard />
      <CountdownRing />
      <StreakBadge />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 pt-5">
        <div className="flex items-center gap-2">
          <span className="text-primary text-xl sm:text-2xl">{"\u25C6"}</span>
          <span className="font-sans text-xl sm:text-2xl font-bold text-foreground tracking-wide">
            QuizBattle
          </span>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 -mt-8">
        <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground text-center leading-tight animate-fade-up-delay-1">
          Quiz nights just got
          <br />
          <span className="text-primary italic text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
            competitive.
          </span>
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground text-center max-w-lg animate-fade-up-delay-2">
          Host a quiz, share the code, battle your friends in real time.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-up-delay-3">
          <Button
            size="lg"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="rounded-2xl px-8 text-base font-bold shadow-md hover:shadow-lg transition-shadow"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Host a Quiz"
            )}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate({ to: "/join" })}
            className="rounded-2xl px-8 text-base font-bold shadow-md hover:shadow-lg transition-shadow"
          >
            Join a Game
          </Button>
        </div>

        <div className="mt-6 sm:mt-8 animate-fade-up-delay-4">
          <div className="inline-flex items-center gap-2 bg-card text-card-foreground font-mono text-sm sm:text-base px-5 py-2.5 rounded-full shadow-lg border-2 border-primary/40">
            <span className="text-base">{"\uD83C\uDFAE"}</span>
            <span className="text-muted-foreground">Room Code:</span>
            <span className="font-bold tracking-widest text-primary">
              847291
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-5 pt-2 text-center animate-fade-up-delay-4">
        <p className="text-xs sm:text-sm text-muted-foreground">
          {"\u00A9"} 2026. Built with {"\u2764\uFE0F"} using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-semibold"
          >
            Caffeine
          </a>
        </p>
      </footer>
    </div>
  );
}
