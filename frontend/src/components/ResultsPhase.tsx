import {
  Loader2,
  Triangle,
  Diamond,
  Circle,
  Square,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OPTION_COLORS } from "../utils/constants";

interface AnswerDistribution {
  optionIndex: bigint;
  count: bigint;
  isCorrect: boolean;
}

interface ResultsData {
  questionText: string;
  options: string[];
  answerDistribution: AnswerDistribution[];
  totalAnswers: bigint;
  correctCount: bigint;
}

interface PlayerFeedback {
  wasCorrect: boolean | null;
  pointsEarned: number;
  totalScore: number;
  streak: number;
}

interface ResultsPhaseProps {
  results: ResultsData | undefined;
  isLoading: boolean;
  isError: boolean;
  playerFeedback?: PlayerFeedback;
}

const SHAPE_ICONS = [Triangle, Diamond, Circle, Square];

export function ResultsPhase({
  results,
  isLoading,
  isError,
  playerFeedback,
}: ResultsPhaseProps) {
  if (isLoading || !results) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load results.</p>
      </div>
    );
  }

  const totalAnswers = Number(results.totalAnswers);
  const correctCount = Number(results.correctCount);
  const maxCount = Math.max(
    ...results.answerDistribution.map((d) => Number(d.count)),
    1,
  );

  return (
    <div className="text-center space-y-5 sm:space-y-8 w-full">
      {/* Question text */}
      <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
        {results.questionText}
      </h2>

      {/* Player feedback banner */}
      {playerFeedback && playerFeedback.wasCorrect !== null && (
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold animate-pop-in",
            playerFeedback.wasCorrect
              ? "bg-green-500/10 text-green-500"
              : "bg-red-500/10 text-red-500",
          )}
        >
          {playerFeedback.wasCorrect ? "Correct!" : "Incorrect"}
          {playerFeedback.wasCorrect && playerFeedback.pointsEarned > 0 && (
            <span>+{playerFeedback.pointsEarned.toLocaleString()} pts</span>
          )}
          {playerFeedback.streak > 1 && (
            <span className="text-yellow-500">
              {playerFeedback.streak} streak
            </span>
          )}
        </div>
      )}

      {/* Vertical bar chart */}
      <div className="max-w-3xl lg:max-w-4xl mx-auto w-full px-4">
        <div
          className="flex items-end justify-center gap-3 sm:gap-6"
          style={{ height: "14rem" }}
        >
          {results.options.map((_, i) => {
            const dist = results.answerDistribution.find(
              (d) => Number(d.optionIndex) === i,
            );
            const count = dist ? Number(dist.count) : 0;
            const isCorrect = dist?.isCorrect ?? false;
            const barPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const colorClass = OPTION_COLORS[i % OPTION_COLORS.length];
            const ShapeIcon = SHAPE_ICONS[i % SHAPE_ICONS.length];

            return (
              <div
                key={i}
                className="flex-1 flex flex-col justify-end h-full max-w-28 sm:max-w-36"
              >
                {/* Bar - only render if there are votes */}
                {count > 0 && (
                  <div
                    className={cn(
                      "w-full rounded-t-md animate-bar-grow-up origin-bottom",
                      colorClass,
                    )}
                    style={{
                      height: `${barPct}%`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                )}
                {/* Label below bar */}
                <div
                  className={cn(
                    "w-full shrink-0 rounded-b-md px-1 py-1.5 sm:py-2 flex items-center justify-center gap-1 text-white text-xs sm:text-sm font-semibold",
                    colorClass,
                    count === 0 && "rounded-t-md",
                  )}
                >
                  <ShapeIcon
                    className="h-3 w-3 sm:h-4 sm:w-4"
                    fill="currentColor"
                  />
                  <span>{count}</span>
                  {isCorrect && <Check className="h-3 w-3 sm:h-4 sm:w-4" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Option tiles below chart */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-3xl lg:max-w-4xl mx-auto w-full px-4">
        {results.options.map((option, i) => {
          const dist = results.answerDistribution.find(
            (d) => Number(d.optionIndex) === i,
          );
          const isCorrect = dist?.isCorrect ?? false;
          const colorClass = OPTION_COLORS[i % OPTION_COLORS.length];
          const ShapeIcon = SHAPE_ICONS[i % SHAPE_ICONS.length];

          return (
            <div
              key={i}
              className={cn(
                "rounded-lg p-3 sm:p-4 text-white font-semibold text-sm sm:text-lg lg:text-xl flex items-center gap-2 sm:gap-3",
                colorClass,
                isCorrect &&
                  "ring-2 ring-white ring-offset-2 ring-offset-background",
              )}
            >
              <ShapeIcon
                className="h-5 w-5 sm:h-6 sm:w-6 shrink-0"
                fill="currentColor"
              />
              <span className="flex-1 text-left truncate">{option}</span>
              {isCorrect && (
                <Check className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm lg:text-base text-muted-foreground">
        <span>{totalAnswers} answers</span>
        <span>
          {correctCount} correct (
          {totalAnswers > 0
            ? Math.round((correctCount / totalAnswers) * 100)
            : 0}
          %)
        </span>
      </div>

      {/* Player total score */}
      {playerFeedback && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total Score</p>
          <p className="text-2xl font-bold text-foreground">
            {playerFeedback.totalScore.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
