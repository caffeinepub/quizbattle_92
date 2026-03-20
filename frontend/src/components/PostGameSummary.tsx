import { Loader2, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BAR_COLORS } from "../utils/constants";

interface AnswerDistribution {
  optionIndex: bigint;
  count: bigint;
  isCorrect: boolean;
}

interface QuestionSummary {
  questionIndex: bigint;
  questionText: string;
  options: string[];
  answerDistribution: AnswerDistribution[];
  totalAnswers: bigint;
  correctCount: bigint;
  correctPercent: bigint;
}

interface PostGameSummaryData {
  questionSummaries: QuestionSummary[];
  totalPlayers: bigint;
  totalQuestions: bigint;
}

interface PostGameSummaryProps {
  summary: PostGameSummaryData | undefined;
  isLoading: boolean;
  isError: boolean;
  onBackToDashboard: () => void;
}

export function PostGameSummary({
  summary,
  isLoading,
  isError,
  onBackToDashboard,
}: PostGameSummaryProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (isLoading || !summary) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center space-y-4 py-12">
        <p className="text-destructive">Failed to load summary.</p>
        <Button variant="outline" onClick={onBackToDashboard}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const totalPlayers = Number(summary.totalPlayers);
  const totalQuestions = Number(summary.totalQuestions);

  const sorted = [...summary.questionSummaries].sort(
    (a, b) => Number(a.correctPercent) - Number(b.correctPercent),
  );
  const hardestQuestion = sorted.length > 0 ? sorted[0] : null;
  const easiestQuestion = sorted.length > 0 ? sorted[sorted.length - 1] : null;

  return (
    <div className="w-full space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Game Summary</h2>
        <p className="text-muted-foreground">
          {totalQuestions} questions &middot; {totalPlayers} players
        </p>
      </div>

      {/* Highlight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {hardestQuestion && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
            <p className="text-xs font-medium text-red-400 uppercase tracking-wide mb-1">
              Hardest Question
            </p>
            <p className="text-sm font-semibold text-foreground truncate">
              {hardestQuestion.questionText}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {Number(hardestQuestion.correctPercent)}% correct
            </p>
          </div>
        )}
        {easiestQuestion && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
            <p className="text-xs font-medium text-green-400 uppercase tracking-wide mb-1">
              Easiest Question
            </p>
            <p className="text-sm font-semibold text-foreground truncate">
              {easiestQuestion.questionText}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {Number(easiestQuestion.correctPercent)}% correct
            </p>
          </div>
        )}
      </div>

      {/* Per-question breakdown */}
      <div className="space-y-3 max-w-3xl mx-auto">
        {summary.questionSummaries.map((q) => {
          const idx = Number(q.questionIndex);
          const isExpanded = expandedIndex === idx;
          const correctPct = Number(q.correctPercent);
          const totalAnswers = Number(q.totalAnswers);
          const maxCount = Math.max(
            ...q.answerDistribution.map((d) => Number(d.count)),
            1,
          );

          return (
            <div key={idx} className="rounded-lg border border-border bg-card">
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex-shrink-0 text-sm font-mono text-muted-foreground w-8">
                    Q{idx + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground truncate">
                    {q.questionText}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          correctPct >= 70
                            ? "bg-green-500"
                            : correctPct >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500",
                        )}
                        style={{ width: `${correctPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                      {correctPct}%
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {q.options.map((option, i) => {
                    const dist = q.answerDistribution.find(
                      (d) => Number(d.optionIndex) === i,
                    );
                    const count = dist ? Number(dist.count) : 0;
                    const isCorrect = dist?.isCorrect ?? false;
                    const barWidth =
                      totalAnswers > 0 ? (count / maxCount) * 100 : 0;

                    return (
                      <div
                        key={i}
                        className={cn(
                          "rounded-md border p-3 text-left",
                          isCorrect
                            ? "border-green-500/50 bg-green-500/5"
                            : "border-border/50 bg-background",
                        )}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isCorrect ? "text-green-500" : "text-foreground",
                            )}
                          >
                            {option}
                            {isCorrect && (
                              <span className="ml-1.5 text-xs text-green-500">
                                Correct
                              </span>
                            )}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
                            {count}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isCorrect
                                ? "bg-green-500"
                                : BAR_COLORS[i % BAR_COLORS.length],
                              !isCorrect && "opacity-60",
                            )}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-muted-foreground pt-1">
                    {totalAnswers} answers &middot; {Number(q.correctCount)}{" "}
                    correct ({correctPct}%)
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <Button onClick={onBackToDashboard} size="lg">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
