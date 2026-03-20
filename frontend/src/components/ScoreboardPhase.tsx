import { useState, useEffect, useRef } from "react";
import { Loader2, Trophy, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlayerAvatar } from "./PlayerAvatar";

interface LeaderboardEntry {
  playerId: bigint;
  displayName: string;
  avatarIndex: bigint;
  score: bigint;
  rank: bigint;
  currentStreak: bigint;
}

interface StreakEntry {
  displayName: string;
  avatarIndex: bigint;
  streak: bigint;
}

interface ScoreboardPhaseProps {
  leaderboard?: {
    entries: LeaderboardEntry[];
    totalPlayers: bigint;
  };
  streaks?: StreakEntry[];
  isLoading: boolean;
  isError: boolean;
  playerContext?: {
    displayName: string;
    score: number;
    rank: number;
    currentStreak: number;
  };
}

const RANK_STYLES: Record<number, string> = {
  1: "border-yellow-500 bg-yellow-500/5",
  2: "border-slate-400 bg-slate-400/5",
  3: "border-amber-600 bg-amber-600/5",
};

// ROW_HEIGHT must match the actual rendered row height for position animation
const ROW_HEIGHT = 64; // px — matches py-3.5 + content

type PrevEntry = { playerId: string; rank: number; score: number };

function useAnimatedScore(target: number, duration = 800) {
  const [displayed, setDisplayed] = useState(target);
  const prevTarget = useRef(target);

  useEffect(() => {
    const from = prevTarget.current;
    prevTarget.current = target;
    if (from === target) return;

    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(from + (target - from) * eased));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return displayed;
}

function ScoreboardRow({
  entry,
  rank,
  offsetY,
  isOwnEntry,
  isFirstRender,
  index,
}: {
  entry: LeaderboardEntry;
  rank: number;
  offsetY: number;
  isOwnEntry: boolean;
  isFirstRender: boolean;
  index: number;
}) {
  const score = useAnimatedScore(Number(entry.score));

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 bg-card border",
        RANK_STYLES[rank],
        isOwnEntry && "ring-2 ring-primary",
        isFirstRender && "animate-slide-in-right",
      )}
      style={{
        transition: isFirstRender
          ? undefined
          : "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        transform: isFirstRender ? undefined : `translateY(${offsetY}px)`,
        animationDelay: isFirstRender ? `${index * 120}ms` : undefined,
      }}
    >
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-muted-foreground w-6 sm:w-8 shrink-0">
          {rank}
        </span>
        <PlayerAvatar avatarIndex={Number(entry.avatarIndex)} size="md" />
        <span className="text-base sm:text-xl lg:text-2xl font-semibold text-foreground truncate">
          {entry.displayName}
        </span>
      </div>
      <span
        className={cn(
          "text-base sm:text-xl lg:text-2xl font-bold text-primary shrink-0 ml-2",
          !isFirstRender && "animate-count-pulse",
        )}
      >
        {score.toLocaleString()}
      </span>
    </div>
  );
}

export function ScoreboardPhase({
  leaderboard,
  streaks,
  isLoading,
  isError,
  playerContext,
}: ScoreboardPhaseProps) {
  const prevEntriesRef = useRef<PrevEntry[] | null>(null);
  const [isFirstRender, setIsFirstRender] = useState(true);

  const entries = leaderboard?.entries ?? [];
  const top5 = entries.slice(0, 5);
  const totalPlayers = leaderboard ? Number(leaderboard.totalPlayers) : 0;

  // Track previous entries for position animation
  useEffect(() => {
    if (top5.length === 0) return;
    // After first render, mark subsequent renders as not first
    const timer = setTimeout(
      () => {
        prevEntriesRef.current = top5.map((e) => ({
          playerId: e.playerId.toString(),
          rank: Number(e.rank),
          score: Number(e.score),
        }));
        setIsFirstRender(false);
      },
      isFirstRender ? 800 : 0,
    );
    return () => clearTimeout(timer);
    // Only run when the entries array reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaderboard]);

  // Compute translateY offset for each entry based on rank change
  const getOffsetY = (entry: LeaderboardEntry): number => {
    if (isFirstRender || !prevEntriesRef.current) return 0;
    const playerIdStr = entry.playerId.toString();
    const prevEntry = prevEntriesRef.current.find(
      (e) => e.playerId === playerIdStr,
    );
    if (!prevEntry) return 0;
    const currentRank = Number(entry.rank);
    const prevRank = prevEntry.rank;
    // Positive = moved down, negative = moved up
    return (prevRank - currentRank) * ROW_HEIGHT;
  };

  // For players not in top 5
  const playerAbove =
    playerContext && playerContext.rank > 5
      ? entries.find((e) => Number(e.rank) === playerContext.rank - 1)
      : null;

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
        <p className="text-destructive">Failed to load scoreboard.</p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4 sm:space-y-6 w-full max-w-2xl lg:max-w-3xl">
      <Trophy className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-yellow-500 mx-auto animate-pop-in" />
      <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground animate-fade-up">
        Scoreboard
      </h2>

      {/* Player's own rank (if player and not in top 5) */}
      {playerContext && playerContext.rank > 5 && (
        <div className="text-center space-y-1 mb-2">
          <p className="text-4xl sm:text-5xl font-bold text-foreground">
            #{playerContext.rank}
          </p>
          <p className="text-base sm:text-lg text-muted-foreground">
            {playerContext.displayName}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-primary">
            {playerContext.score.toLocaleString()} pts
          </p>
        </div>
      )}

      {/* Top 5 leaderboard */}
      <div className="space-y-2 sm:space-y-3">
        {top5.map((entry, i) => {
          const rank = Number(entry.rank);
          const isOwnEntry = playerContext?.displayName === entry.displayName;
          return (
            <ScoreboardRow
              key={entry.playerId.toString()}
              entry={entry}
              rank={rank}
              offsetY={getOffsetY(entry)}
              isOwnEntry={isOwnEntry}
              isFirstRender={isFirstRender}
              index={i}
            />
          );
        })}

        {/* Player above + own rank row (if outside top 5) */}
        {playerContext && playerContext.rank > 5 && (
          <>
            <div className="text-muted-foreground text-sm py-1">···</div>
            {playerAbove && (
              <div className="flex items-center justify-between rounded-lg px-4 sm:px-6 py-3 sm:py-4 bg-card border">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <span className="text-xl sm:text-2xl font-bold text-muted-foreground w-6 sm:w-8 shrink-0">
                    {Number(playerAbove.rank)}
                  </span>
                  <PlayerAvatar
                    avatarIndex={Number(playerAbove.avatarIndex)}
                    size="md"
                  />
                  <span className="text-base sm:text-xl font-semibold text-foreground truncate">
                    {playerAbove.displayName}
                  </span>
                </div>
                <span className="text-base sm:text-xl font-bold text-primary shrink-0 ml-2">
                  {Number(playerAbove.score).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between rounded-lg px-4 sm:px-6 py-3 sm:py-4 bg-card border ring-2 ring-primary">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <span className="text-xl sm:text-2xl font-bold text-muted-foreground w-6 sm:w-8 shrink-0">
                  {playerContext.rank}
                </span>
                <span className="text-base sm:text-xl font-semibold text-foreground truncate">
                  {playerContext.displayName}
                </span>
              </div>
              <span className="text-base sm:text-xl font-bold text-primary shrink-0 ml-2">
                {playerContext.score.toLocaleString()}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Player count */}
      {totalPlayers > 5 && (
        <p className="text-sm text-muted-foreground">
          {totalPlayers} players total
        </p>
      )}

      {/* Streaks */}
      {streaks && streaks.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Active Streaks
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {streaks.map((streak) => {
              const isOwn = playerContext?.displayName === streak.displayName;
              return (
                <div
                  key={streak.displayName}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 bg-orange-500/10 border border-orange-500/30 text-sm font-medium",
                    isOwn && "ring-2 ring-primary",
                  )}
                >
                  <PlayerAvatar
                    avatarIndex={Number(streak.avatarIndex)}
                    size="sm"
                  />
                  <span className="text-foreground">{streak.displayName}</span>
                  <span className="text-orange-500 font-bold">
                    {Number(streak.streak)}x
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Personal streak notification for players */}
      {playerContext && playerContext.currentStreak >= 2 && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/30 px-6 py-3">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="text-lg font-semibold text-foreground">
            You&apos;re on a {playerContext.currentStreak} streak!
          </span>
        </div>
      )}
    </div>
  );
}
