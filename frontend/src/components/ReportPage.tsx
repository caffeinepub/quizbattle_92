import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  Trash2,
  Users,
  HelpCircle,
  Trophy,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useReport, useDeleteReport } from "../hooks/useQueries";
import { fromNanoseconds } from "../utils/formatting";
import { BAR_COLORS } from "../utils/constants";
import {
  QuestionType,
  type ArchivedQuestion,
  type ArchivedPlayerAnswer,
} from "../backend";

const AVATAR_COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-cyan-500",
];

interface ReportPageProps {
  reportId: number;
}

function getPlayerAnswer(
  answer: ArchivedPlayerAnswer,
  question: ArchivedQuestion,
): string {
  if (question.questionType === QuestionType.typeAnswer) {
    return answer.textAnswer || "No answer";
  }

  if (question.questionType === QuestionType.slider) {
    return String(Number(answer.sliderValue));
  }

  // quiz or trueFalse
  if (answer.selectedOptions.length === 0) return "No answer";
  return answer.selectedOptions
    .map((i) => question.options[Number(i)] ?? `Option ${Number(i) + 1}`)
    .join(", ");
}

function getCorrectAnswer(question: ArchivedQuestion): string {
  if (question.questionType === QuestionType.typeAnswer) {
    return question.acceptedAnswers.join(" / ");
  }

  if (question.questionType === QuestionType.slider) {
    return String(Number(question.sliderCorrect));
  }

  // quiz or trueFalse
  return question.correctOptionIndices
    .map((i) => question.options[Number(i)] ?? `Option ${Number(i) + 1}`)
    .join(", ");
}

export function ReportPage({ reportId }: ReportPageProps) {
  const navigate = useNavigate();
  const { data: report, isLoading, isError } = useReport(BigInt(reportId));
  const { mutate: deleteReport, isPending: isDeleting } = useDeleteReport();

  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<
    number | null
  >(null);
  const [expandedPlayerIndex, setExpandedPlayerIndex] = useState<number | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="text-center space-y-4 py-24">
        <p className="text-destructive">Failed to load report.</p>
        <Button variant="outline" onClick={() => navigate({ to: "/reports" })}>
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const playerCount = Number(report.playerCount);
  const questionCount = Number(report.questionCount);
  const playedDate = format(
    fromNanoseconds(report.playedAt),
    "MMM d, yyyy h:mm a",
  );

  const sortedPlayers = [...report.players].sort(
    (a, b) => Number(a.rank) - Number(b.rank),
  );

  const handleDelete = () => {
    deleteReport(
      { reportId: BigInt(reportId) },
      {
        onSuccess: () => {
          toast.success("Report deleted");
          navigate({ to: "/reports" });
        },
        onError: () => {
          toast.error("Failed to delete report");
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/reports" })}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The report for &ldquo;
                    {report.quizTitle}&rdquo; will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {report.quizTitle}
            </h1>
            <p className="text-sm text-muted-foreground">{playedDate}</p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                <Users className="h-3 w-3" />
                {playerCount} player{playerCount !== 1 && "s"}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                <HelpCircle className="h-3 w-3" />
                {questionCount} question{questionCount !== 1 && "s"}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">
              Overview
            </TabsTrigger>
            <TabsTrigger value="players" className="flex-1">
              Players
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Leaderboard */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">
                Leaderboard
              </h2>
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="text-left px-4 py-2.5 font-medium w-12">
                        #
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium">
                        Player
                      </th>
                      <th className="text-right px-4 py-2.5 font-medium">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPlayers.map((player, i) => {
                      const rank = Number(player.rank);
                      const colorIndex =
                        Number(player.avatarIndex) % AVATAR_COLORS.length;
                      const initial = player.displayName
                        .charAt(0)
                        .toUpperCase();

                      return (
                        <tr
                          key={i}
                          className={cn(
                            "border-b border-border/50 last:border-b-0",
                            rank <= 3 && "bg-muted/30",
                          )}
                        >
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "text-sm font-semibold",
                                rank === 1 && "text-yellow-500",
                                rank === 2 && "text-gray-400",
                                rank === 3 && "text-amber-600",
                                rank > 3 && "text-muted-foreground",
                              )}
                            >
                              {rank}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={cn(
                                  "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0",
                                  AVATAR_COLORS[colorIndex],
                                )}
                              >
                                {initial}
                              </div>
                              <span className="text-sm font-medium text-foreground truncate">
                                {player.displayName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-mono text-foreground">
                              {Number(player.score).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Question breakdown */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">
                Question Breakdown
              </h2>
              <div className="space-y-3">
                {report.summary.questionSummaries.map((q) => {
                  const idx = Number(q.questionIndex);
                  const isExpanded = expandedQuestionIndex === idx;
                  const correctPct = Number(q.correctPercent);
                  const totalAnswers = Number(q.totalAnswers);
                  const maxCount = Math.max(
                    ...q.answerDistribution.map((d) => Number(d.count)),
                    1,
                  );

                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-card"
                    >
                      <button
                        className="w-full flex items-center justify-between p-4 text-left"
                        onClick={() =>
                          setExpandedQuestionIndex(isExpanded ? null : idx)
                        }
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
                                      isCorrect
                                        ? "text-green-500"
                                        : "text-foreground",
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
                            {totalAnswers} answers &middot;{" "}
                            {Number(q.correctCount)} correct ({correctPct}%)
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="players" className="space-y-3 mt-6">
            {sortedPlayers.map((player, playerIdx) => {
              const rank = Number(player.rank);
              const colorIndex =
                Number(player.avatarIndex) % AVATAR_COLORS.length;
              const initial = player.displayName.charAt(0).toUpperCase();
              const isExpanded = expandedPlayerIndex === playerIdx;
              const correctCount = player.answers.filter(
                (a) => a.isCorrect,
              ).length;
              const accuracy =
                questionCount > 0
                  ? Math.round((correctCount / questionCount) * 100)
                  : 0;

              return (
                <div
                  key={playerIdx}
                  className="rounded-lg border border-border bg-card"
                >
                  <button
                    className="w-full flex items-center justify-between p-4 text-left"
                    onClick={() =>
                      setExpandedPlayerIndex(isExpanded ? null : playerIdx)
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex-shrink-0 text-sm font-semibold text-muted-foreground w-6">
                        {rank}
                      </span>
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0",
                          AVATAR_COLORS[colorIndex],
                        )}
                      >
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {player.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Number(player.score).toLocaleString()} pts &middot;{" "}
                          {accuracy}% accuracy
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Trophy className="h-3.5 w-3.5" />
                        {correctCount}/{questionCount}
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
                      {player.answers
                        .sort(
                          (a, b) =>
                            Number(a.questionIndex) - Number(b.questionIndex),
                        )
                        .map((answer) => {
                          const qIdx = Number(answer.questionIndex);
                          const question = report.questions[qIdx];
                          if (!question) return null;

                          const playerAnswer = getPlayerAnswer(
                            answer,
                            question,
                          );
                          const correctAnswer = getCorrectAnswer(question);

                          return (
                            <div
                              key={qIdx}
                              className={cn(
                                "rounded-md border p-3",
                                answer.isCorrect
                                  ? "border-green-500/30 bg-green-500/5"
                                  : "border-red-500/30 bg-red-500/5",
                              )}
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="text-xs font-mono text-muted-foreground">
                                  Q{qIdx + 1}
                                </p>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {answer.isCorrect ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                  ) : (
                                    <X className="h-3.5 w-3.5 text-red-500" />
                                  )}
                                  <span className="text-xs font-mono text-muted-foreground">
                                    +{Number(answer.pointsEarned)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-foreground mb-1">
                                {question.text}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Answer:{" "}
                                <span
                                  className={cn(
                                    "font-medium",
                                    answer.isCorrect
                                      ? "text-green-500"
                                      : "text-red-400",
                                  )}
                                >
                                  {playerAnswer}
                                </span>
                              </p>
                              {!answer.isCorrect && (
                                <p className="text-xs text-muted-foreground">
                                  Correct:{" "}
                                  <span className="font-medium text-green-500">
                                    {correctAnswer}
                                  </span>
                                </p>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
