import { useState, useEffect, useRef } from "react";
import { Loader2, Trophy, Medal, Award } from "lucide-react";
import { PodiumBlock } from "./PodiumBlock";
import { Confetti } from "./Confetti";
import { soundManager } from "../utils/soundManager";

interface PodiumEntry {
  displayName: string;
  avatarIndex: number;
  score: number;
  rank: number;
}

interface PodiumPhaseProps {
  entries: PodiumEntry[];
  isLoading: boolean;
  isError: boolean;
  playerContext?: {
    displayName: string;
    score: number;
    rank: number;
  };
}

const REVEAL_DELAY = 1500;

const PODIUM_CONFIG = [
  {
    label: "3rd",
    height: "h-20 sm:h-24 lg:h-32",
    bg: "bg-amber-700/80",
    icon: Award,
    iconColor: "text-amber-700",
    textSize: "text-lg sm:text-xl lg:text-2xl",
  },
  {
    label: "2nd",
    height: "h-28 sm:h-32 lg:h-40",
    bg: "bg-slate-300/80",
    icon: Medal,
    iconColor: "text-slate-400",
    textSize: "text-xl sm:text-2xl lg:text-3xl",
  },
  {
    label: "1st",
    height: "h-36 sm:h-40 lg:h-48",
    bg: "bg-yellow-400/80",
    icon: Trophy,
    iconColor: "text-yellow-500",
    textSize: "text-2xl sm:text-3xl lg:text-4xl",
  },
];

export function PodiumPhase({
  entries,
  isLoading,
  isError,
  playerContext,
}: PodiumPhaseProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const animationDoneRef = useRef(false);
  const entryCount = entries.length;

  useEffect(() => {
    if (entryCount === 0 || animationDoneRef.current) return;

    soundManager.play("podiumReveal");

    // Reveal order: 3rd (step 1) → 2nd (step 2) → 1st (step 3)
    // Skip delays for positions that don't exist (e.g., 1 or 2 players)
    const count = Math.min(3, entryCount);
    const timers: ReturnType<typeof setTimeout>[] = [];
    let delay = 0;

    for (let step = 1; step <= 3; step++) {
      // step 1 = 3rd place, step 2 = 2nd place, step 3 = 1st place
      const positionExists =
        (step === 1 && count >= 3) ||
        (step === 2 && count >= 2) ||
        (step === 3 && count >= 1);

      if (positionExists) {
        delay += REVEAL_DELAY;
      }

      const capturedStep = step;
      const isLast = step === 3;
      timers.push(
        setTimeout(
          () => {
            setRevealedCount(capturedStep);
            if (isLast) {
              animationDoneRef.current = true;
              setShowConfetti(true);
            }
          },
          positionExists ? delay : delay + 1,
        ),
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [entryCount]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load final results.</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No players to show.</p>
      </div>
    );
  }

  const top3 = entries.slice(0, 3);

  const showOwnRank =
    playerContext &&
    playerContext.rank > 3 &&
    playerContext.rank <= entries.length;

  return (
    <div className="w-full max-w-2xl lg:max-w-3xl mx-auto space-y-6 sm:space-y-8 relative">
      {showConfetti && <Confetti />}

      {/* Podium blocks - displayed as 2nd, 1st, 3rd for visual layout */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 lg:gap-6 pt-4 sm:pt-8">
        {top3.length >= 2 && (
          <PodiumBlock
            entry={top3[1]}
            config={PODIUM_CONFIG[1]}
            revealed={revealedCount >= 2}
          />
        )}
        {top3.length >= 1 && (
          <PodiumBlock
            entry={top3[0]}
            config={PODIUM_CONFIG[2]}
            revealed={revealedCount >= 3}
          />
        )}
        {top3.length >= 3 && (
          <PodiumBlock
            entry={top3[2]}
            config={PODIUM_CONFIG[0]}
            revealed={revealedCount >= 1}
          />
        )}
      </div>

      {/* Player's own rank if outside top 3 */}
      {showOwnRank && revealedCount >= 3 && (
        <div className="border rounded-lg p-4 sm:p-6 text-center bg-card animate-fade-up">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">
            Your Result
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            #{playerContext.rank}
          </p>
          <p className="text-base sm:text-lg text-muted-foreground">
            {playerContext.displayName}
          </p>
          <p className="text-lg sm:text-xl font-bold text-primary">
            {playerContext.score.toLocaleString()} pts
          </p>
        </div>
      )}
    </div>
  );
}
