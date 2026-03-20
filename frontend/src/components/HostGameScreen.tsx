import { useState, useEffect, useRef, useCallback } from "react";
import {
  Loader2,
  SkipForward,
  Users,
  MessageSquare,
  Timer,
  Triangle,
  Diamond,
  Circle,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  useSessionState,
  useAdvancePhase,
  useSetAutoAdvance,
  useQuestionResults,
  useLeaderboard,
  useStreaks,
  useEndSession,
  usePostGameSummary,
} from "../hooks/useQueries";
import { useHostHeartbeatInterval } from "../hooks/useHostHeartbeatInterval";
import { usePhaseSounds } from "../hooks/usePhaseSounds";
import { useCountdownTimer } from "../hooks/useCountdownTimer";
import { ResultsPhase } from "./ResultsPhase";
import { ScoreboardPhase } from "./ScoreboardPhase";
import { PodiumPhase } from "./PodiumPhase";
import { PostGameSummary } from "./PostGameSummary";
import { QuestionImage } from "./QuestionImage";
import { ThemeBackground } from "./ThemeBackground";
import { MuteButton } from "./MuteButton";
import { cn } from "@/lib/utils";
import { GamePhase } from "../backend";
import {
  getThemeConfig,
  OPTION_COLORS,
  getImagePlacement,
  formatTimeRemaining,
  QUESTION_TYPE_MAP,
} from "../utils/constants";

const OPTION_SHAPE_ICONS = [Triangle, Diamond, Circle, Square];

const PHASE_NAMES: Record<string, string> = {
  [GamePhase.questionDisplay]: "Get Ready!",
  [GamePhase.answering]: "Answering...",
  [GamePhase.results]: "Results",
  [GamePhase.scoreboard]: "Scoreboard",
  [GamePhase.podium]: "Final Results",
  [GamePhase.ended]: "Game Over",
  [GamePhase.lobby]: "Lobby",
};

interface HostGameScreenProps {
  sessionId: number;
  onBack: () => void;
}

export function HostGameScreen({ sessionId, onBack }: HostGameScreenProps) {
  // Hooks
  const { data: session, isLoading, isError } = useSessionState(sessionId);
  const { mutate: advancePhase, isPending: isAdvancing } = useAdvancePhase();
  const { mutate: setAutoAdvance } = useSetAutoAdvance();
  const { mutate: endSession, isPending: isEnding } = useEndSession();

  const phase = session?.currentPhase;
  const needsLeaderboard =
    phase === GamePhase.scoreboard || phase === GamePhase.podium;

  useHostHeartbeatInterval(sessionId);
  usePhaseSounds(phase);

  const {
    data: questionResults,
    isLoading: isResultsLoading,
    isError: isResultsError,
  } = useQuestionResults(
    phase === GamePhase.results ? sessionId : null,
    phase === GamePhase.results && session
      ? Number(session.currentQuestionIndex)
      : null,
  );
  const {
    data: leaderboard,
    isLoading: isLeaderboardLoading,
    isError: isLeaderboardError,
  } = useLeaderboard(needsLeaderboard ? sessionId : null, needsLeaderboard);
  const { data: streaks } = useStreaks(
    phase === GamePhase.scoreboard ? sessionId : null,
    phase === GamePhase.scoreboard,
  );
  const {
    data: postGameSummary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = usePostGameSummary(
    phase === GamePhase.ended ? sessionId : null,
    phase === GamePhase.ended,
  );

  const question = session?.currentQuestion;
  const timeLimit = question ? Number(question.timeLimit) : 0;
  const questionTheme = getThemeConfig(question?.theme ?? "standard");
  const questionImageUrl = question?.image?.getDirectURL() ?? "";

  const { timeRemaining, timerProgress } = useCountdownTimer(
    phase,
    session?.phaseStartTime,
    timeLimit,
  );

  // State
  const [displayCountdown, setDisplayCountdown] = useState<number | null>(null);

  // Auto-advance from questionDisplay to answering after 3-second countdown
  const advanceRef = useRef(false);
  useEffect(() => {
    if (phase !== GamePhase.questionDisplay) {
      setDisplayCountdown(null);
      advanceRef.current = false;
      return;
    }
    advanceRef.current = false;
    setDisplayCountdown(3);
    const tick = setInterval(() => {
      setDisplayCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(tick);
          if (!advanceRef.current) {
            advanceRef.current = true;
            advancePhase(
              { sessionId: BigInt(sessionId) },
              {
                onError: (error) =>
                  toast.error(error.message || "Failed to advance phase"),
              },
            );
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [phase, sessionId, advancePhase]);

  // Auto-advance when timer expires
  const timerExpiredRef = useRef(false);
  useEffect(() => {
    if (phase !== GamePhase.answering) {
      timerExpiredRef.current = false;
      return;
    }
    if (
      timeRemaining !== null &&
      timeRemaining <= 0 &&
      timeLimit > 0 &&
      !timerExpiredRef.current
    ) {
      timerExpiredRef.current = true;
      advancePhase(
        { sessionId: BigInt(sessionId) },
        {
          onError: (error) =>
            toast.error(error.message || "Failed to advance phase"),
        },
      );
    }
  }, [phase, timeRemaining, timeLimit, sessionId, advancePhase]);

  const handleAdvance = () => {
    advancePhase(
      { sessionId: BigInt(sessionId) },
      {
        onError: (error) =>
          toast.error(error.message || "Failed to advance phase"),
      },
    );
  };

  const handleEndSession = () => {
    endSession(
      { sessionId: BigInt(sessionId) },
      {
        onError: (error) =>
          toast.error(error.message || "Failed to end session"),
      },
    );
  };

  const handleAutoAdvanceToggle = (enabled: boolean) => {
    setAutoAdvance(
      { sessionId: BigInt(sessionId), enabled },
      {
        onError: (error) =>
          toast.error(error.message || "Failed to toggle auto-advance"),
      },
    );
  };

  if (isError) {
    return (
      <div className="dark min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load game session.</p>
          <Button variant="outline" onClick={onBack}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !session) {
    return (
      <div className="dark min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const questionIndex = Number(session.currentQuestionIndex);
  const questionCount = Number(session.questionCount);
  const answerCount = Number(session.answerCount);
  const playerCount = Number(session.playerCount);

  const phaseName = phase ? (PHASE_NAMES[phase] ?? "Lobby") : "Unknown";

  const isLastQuestion = questionIndex + 1 >= questionCount;
  const NEXT_LABELS: Record<string, string> = {
    [GamePhase.answering]: "End Answering",
    [GamePhase.results]: "Scoreboard",
    [GamePhase.scoreboard]: isLastQuestion ? "Final Results" : "Next Question",
    [GamePhase.podium]: "End Game",
  };
  const nextLabel = phase ? (NEXT_LABELS[phase] ?? null) : null;

  const hostQType = question?.questionType
    ? (QUESTION_TYPE_MAP[question.questionType] ?? "quiz")
    : "quiz";

  const isQuestionPhase =
    phase === GamePhase.questionDisplay || phase === GamePhase.answering;

  const wrapperContent = (
    <>
      {/* Top bar */}
      <header
        className={cn(
          "border-b px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2",
          isQuestionPhase
            ? "bg-black/20 border-white/10"
            : "bg-white/5 border-white/10",
        )}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          <Badge
            variant="outline"
            className={cn(
              "text-xs sm:text-sm gap-1",
              isQuestionPhase && "border-white/20 text-white",
            )}
          >
            <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />Q{" "}
            {questionIndex + 1}/{questionCount}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-xs sm:text-sm gap-1",
              isQuestionPhase && "border-white/20 text-white",
            )}
          >
            <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {playerCount}
          </Badge>
          {phase && phase === GamePhase.answering && (
            <Badge
              variant="secondary"
              className={cn(
                "text-xs sm:text-sm gap-1",
                isQuestionPhase && "bg-white/10 text-white border-white/20",
              )}
            >
              <Timer className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {answerCount}/{playerCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {phase && phase !== GamePhase.podium && phase !== GamePhase.ended && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndSession}
              disabled={isEnding}
            >
              {isEnding && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span className="hidden sm:inline">End Session</span>
              <span className="sm:hidden">End</span>
            </Button>
          )}
          <label
            className={cn(
              "hidden sm:flex items-center gap-2 text-sm",
              isQuestionPhase ? "text-white/70" : "text-muted-foreground",
            )}
          >
            Auto-advance
            <Switch
              checked={session.autoAdvance}
              onCheckedChange={handleAutoAdvanceToggle}
            />
          </label>
          <MuteButton className="text-white" />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-6xl mx-auto w-full">
        {/* Phase label */}
        <p
          className={cn(
            "text-sm font-medium uppercase tracking-wide mb-4",
            isQuestionPhase
              ? questionTheme.accentColor
              : "text-muted-foreground",
          )}
        >
          {phaseName}
        </p>

        {/* Question display phase */}
        {phase && phase === GamePhase.questionDisplay && question && (
          <>
            {questionImageUrl &&
              getImagePlacement(question) === "background" && (
                <QuestionImage
                  imageUrl={questionImageUrl}
                  imagePlacement="background"
                />
              )}
            <div className="text-center space-y-6 w-full relative animate-fade-up">
              {questionImageUrl &&
                getImagePlacement(question) === "centered" && (
                  <QuestionImage
                    imageUrl={questionImageUrl}
                    imagePlacement="centered"
                  />
                )}
              <h2
                className={cn(
                  "text-3xl sm:text-5xl lg:text-7xl font-bold leading-tight",
                  questionTheme.textColor,
                )}
              >
                {question.text}
              </h2>
              {displayCountdown !== null && (
                <p
                  className={cn(
                    "text-4xl sm:text-6xl lg:text-8xl font-bold animate-count-pulse",
                    questionTheme.accentColor,
                  )}
                >
                  {displayCountdown}
                </p>
              )}
            </div>
          </>
        )}

        {/* Answering phase */}
        {phase && phase === GamePhase.answering && question && (
          <>
            {questionImageUrl &&
              getImagePlacement(question) === "background" && (
                <QuestionImage
                  imageUrl={questionImageUrl}
                  imagePlacement="background"
                />
              )}
            <div className="text-center space-y-8 w-full relative">
              {questionImageUrl &&
                getImagePlacement(question) === "centered" && (
                  <QuestionImage
                    imageUrl={questionImageUrl}
                    imagePlacement="centered"
                  />
                )}
              <h2
                className={cn(
                  "text-2xl sm:text-4xl lg:text-6xl font-bold leading-tight",
                  questionTheme.textColor,
                )}
              >
                {question.text}
              </h2>

              {/* Timer bar */}
              {timeRemaining !== null && (
                <div className="w-full max-w-4xl mx-auto space-y-2">
                  <div
                    className={cn(
                      "flex items-center justify-between text-sm sm:text-base",
                      questionTheme.accentColor,
                    )}
                  >
                    <span>Time remaining</span>
                    <span
                      className={cn(
                        "font-mono font-bold text-lg sm:text-2xl",
                        questionTheme.textColor,
                      )}
                    >
                      {formatTimeRemaining(timeRemaining)}
                    </span>
                  </div>
                  <Progress value={timerProgress} className="h-3 sm:h-4" />
                </div>
              )}

              {/* MC / True-False option tiles */}
              {(hostQType === "quiz" || hostQType === "trueFalse") && (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-4xl mx-auto w-full">
                  {question.options.map((option, i) => {
                    const ShapeIcon =
                      OPTION_SHAPE_ICONS[i % OPTION_SHAPE_ICONS.length];
                    return (
                      <div
                        key={i}
                        className={cn(
                          "rounded-lg p-4 sm:p-6 lg:p-8 text-white font-semibold text-base sm:text-xl lg:text-2xl text-center flex items-center justify-center gap-2 sm:gap-3",
                          OPTION_COLORS[i % OPTION_COLORS.length],
                        )}
                      >
                        <ShapeIcon
                          className="h-5 w-5 sm:h-6 sm:w-6 opacity-70 shrink-0"
                          fill="currentColor"
                        />
                        {option}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Type Answer prompt */}
              {hostQType === "typeAnswer" && (
                <div className="max-w-2xl mx-auto">
                  <p
                    className={cn(
                      "text-lg sm:text-xl lg:text-2xl",
                      questionTheme.accentColor,
                    )}
                  >
                    Players are typing their answers...
                  </p>
                  <p
                    className={cn(
                      "text-sm sm:text-base mt-2",
                      questionTheme.accentColor,
                    )}
                  >
                    {question.acceptedAnswers.length} accepted answer
                    {question.acceptedAnswers.length !== 1 && "s"}
                  </p>
                </div>
              )}

              {/* Slider prompt */}
              {hostQType === "slider" && (
                <div className="max-w-2xl mx-auto space-y-2">
                  <p
                    className={cn(
                      "text-lg sm:text-xl lg:text-2xl",
                      questionTheme.accentColor,
                    )}
                  >
                    Players are choosing a value...
                  </p>
                  <p
                    className={cn(
                      "text-sm sm:text-base",
                      questionTheme.accentColor,
                    )}
                  >
                    Range: {Number(question.sliderMin)} –{" "}
                    {Number(question.sliderMax)} (Correct:{" "}
                    {Number(question.sliderCorrect)})
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Results phase */}
        {phase && phase === GamePhase.results && (
          <ResultsPhase
            results={questionResults ?? undefined}
            isLoading={isResultsLoading}
            isError={isResultsError}
          />
        )}

        {/* Scoreboard phase */}
        {phase && phase === GamePhase.scoreboard && (
          <ScoreboardPhase
            leaderboard={leaderboard ?? undefined}
            streaks={streaks ?? undefined}
            isLoading={isLeaderboardLoading}
            isError={isLeaderboardError}
          />
        )}

        {/* Podium phase */}
        {phase && phase === GamePhase.podium && (
          <PodiumPhase
            entries={
              leaderboard?.entries.map((e) => ({
                displayName: e.displayName,
                avatarIndex: Number(e.avatarIndex),
                score: Number(e.score),
                rank: Number(e.rank),
              })) ?? []
            }
            isLoading={isLeaderboardLoading}
            isError={isLeaderboardError}
          />
        )}

        {/* Ended phase - post-game summary */}
        {phase && phase === GamePhase.ended && (
          <PostGameSummary
            summary={postGameSummary ?? undefined}
            isLoading={isSummaryLoading}
            isError={isSummaryError}
            onBackToDashboard={() => onBack()}
          />
        )}
      </div>

      {/* Bottom controls */}
      {nextLabel && (
        <footer
          className={cn(
            "border-t px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-center",
            isQuestionPhase ? "bg-black/20 border-white/10" : "bg-card",
          )}
        >
          <Button
            size="lg"
            onClick={handleAdvance}
            disabled={isAdvancing}
            className="text-base sm:text-lg lg:text-2xl px-8 sm:px-10 lg:px-14 py-5 sm:py-6 lg:py-7"
          >
            {isAdvancing && <Loader2 className="h-5 w-5 animate-spin" />}
            <SkipForward className="h-5 w-5 lg:h-6 lg:w-6" />
            {isAdvancing ? "Advancing..." : nextLabel}
          </Button>
        </footer>
      )}
    </>
  );

  if (isQuestionPhase) {
    return (
      <ThemeBackground
        theme={question?.theme ?? "standard"}
        className="min-h-screen flex flex-col"
      >
        {wrapperContent}
      </ThemeBackground>
    );
  }

  return (
    <div className="dark min-h-screen flex flex-col bg-background">
      {wrapperContent}
    </div>
  );
}
