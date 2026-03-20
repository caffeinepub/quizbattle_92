import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Check,
  X,
  Triangle,
  Diamond,
  Circle,
  Square,
  Send,
  Trophy,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useSoundManager } from "../hooks/useSoundManager";
import { usePhaseSounds } from "../hooks/usePhaseSounds";
import { useCountdownTimer } from "../hooks/useCountdownTimer";
import {
  usePlayerState,
  useSubmitAnswer,
  usePlayerLeaderboard,
  usePlayerStreaks,
} from "../hooks/useQueries";
import { ScoreboardPhase } from "./ScoreboardPhase";
import { PodiumPhase } from "./PodiumPhase";
import { QuestionImage } from "./QuestionImage";
import { ThemeBackground } from "./ThemeBackground";
import { cn } from "@/lib/utils";
import { GamePhase } from "../backend";
import {
  getThemeConfig,
  OPTION_COLORS,
  getImagePlacement,
  formatTimeRemaining,
  QUESTION_TYPE_MAP,
} from "../utils/constants";

const OPTION_ICONS = [Triangle, Diamond, Circle, Square];

type PlayerState = NonNullable<ReturnType<typeof usePlayerState>["data"]>;

interface PlayerGameScreenProps {
  state: PlayerState;
  roomPin: string;
  playerToken: string;
  onPlayAgain: () => void;
}

export function PlayerGameScreen({
  state,
  roomPin,
  playerToken,
  onPlayAgain,
}: PlayerGameScreenProps) {
  const { mutate: submitAnswer, isPending: isSubmitting } = useSubmitAnswer();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textInput, setTextInput] = useState("");
  const [sliderInput, setSliderInput] = useState<number | null>(null);
  const [lastQuestionIndex, setLastQuestionIndex] = useState<number | null>(
    null,
  );
  const [showRankReveal, setShowRankReveal] = useState(true);

  const phase = state?.currentPhase;
  const question = state?.currentQuestion;
  const timeLimit = question ? Number(question.timeLimit) : 0;
  const questionIndex = state ? Number(state.currentQuestionIndex) : 0;

  const questionType = question?.questionType
    ? (QUESTION_TYPE_MAP[question.questionType] ?? "quiz")
    : "quiz";

  const questionTheme = getThemeConfig(question?.theme ?? "standard");
  const questionImageUrl = question?.image?.getDirectURL() ?? "";

  usePhaseSounds(phase);

  const { timeRemaining, timerProgress } = useCountdownTimer(
    phase,
    state?.phaseStartTime,
    timeLimit,
  );

  const isScoreboardPhase = phase ? phase === GamePhase.scoreboard : false;
  const isPodiumPhase = phase ? phase === GamePhase.podium : false;
  const needsLeaderboard = isScoreboardPhase || isPodiumPhase;
  const {
    data: leaderboard,
    isLoading: isLeaderboardLoading,
    isError: isLeaderboardError,
  } = usePlayerLeaderboard(
    needsLeaderboard ? roomPin : null,
    needsLeaderboard ? playerToken : null,
    needsLeaderboard,
  );
  const { data: streaks } = usePlayerStreaks(
    isScoreboardPhase ? roomPin : null,
    isScoreboardPhase ? playerToken : null,
    isScoreboardPhase,
  );

  // Reset selection when question changes
  useEffect(() => {
    if (lastQuestionIndex !== null && questionIndex !== lastQuestionIndex) {
      setSelectedOption(null);
      setTextInput("");
      setSliderInput(null);
    }
    setLastQuestionIndex(questionIndex);
  }, [questionIndex, lastQuestionIndex]);

  // Reset rank reveal when podium phase starts
  useEffect(() => {
    if (phase === GamePhase.podium) {
      setShowRankReveal(true);
    }
  }, [phase]);

  const { play } = useSoundManager();

  // Play correct/incorrect/streak sounds when results phase starts
  useEffect(() => {
    if (!phase || phase !== GamePhase.results) return;
    if (state?.lastAnswerCorrect) {
      play("correct");
      if (Number(state.currentStreak) >= 2) {
        setTimeout(() => play("streak"), 400);
      }
    } else if (state?.lastAnswerCorrect === false) {
      play("incorrect");
    }
  }, [phase, state?.lastAnswerCorrect, state?.currentStreak, play]);

  // Initialize slider to midpoint when question loads
  useEffect(() => {
    if (questionType === "slider" && question && sliderInput === null) {
      const min = Number(question.sliderMin);
      const max = Number(question.sliderMax);
      setSliderInput(Math.round((min + max) / 2));
    }
  }, [questionType, question, sliderInput]);

  const handleSelectOption = (index: number) => {
    if (state.hasAnsweredCurrent || isSubmitting) return;

    setSelectedOption(index);
    submitAnswer(
      {
        roomPin,
        playerToken: BigInt(playerToken),
        answer: { __kind__: "options" as const, options: [BigInt(index)] },
      },
      {
        onError: (error) => {
          setSelectedOption(null);
          toast.error(error.message || "Failed to submit answer");
        },
      },
    );
  };

  const handleSubmitText = () => {
    if (state.hasAnsweredCurrent || isSubmitting) return;
    if (!textInput.trim()) return;

    submitAnswer(
      {
        roomPin,
        playerToken: BigInt(playerToken),
        answer: { __kind__: "text" as const, text: textInput.trim() },
      },
      {
        onError: (error) => {
          toast.error(error.message || "Failed to submit answer");
        },
      },
    );
  };

  const handleSubmitSlider = () => {
    if (state.hasAnsweredCurrent || isSubmitting) return;
    if (sliderInput === null) return;

    submitAnswer(
      {
        roomPin,
        playerToken: BigInt(playerToken),
        answer: { __kind__: "slider" as const, slider: BigInt(sliderInput) },
      },
      {
        onError: (error) => {
          toast.error(error.message || "Failed to submit answer");
        },
      },
    );
  };

  const hasAnswered = state.hasAnsweredCurrent || selectedOption !== null;

  // Question display phase
  if (phase && phase === GamePhase.questionDisplay && question) {
    const placement = getImagePlacement(question);
    return (
      <ThemeBackground
        theme={question.theme}
        className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8"
      >
        {questionImageUrl && placement === "background" && (
          <QuestionImage
            imageUrl={questionImageUrl}
            imagePlacement="background"
          />
        )}
        <p
          className={cn(
            "text-sm font-medium uppercase tracking-wide mb-4 sm:mb-6 relative animate-fade-up",
            questionTheme.accentColor,
          )}
        >
          Question {questionIndex + 1}
        </p>
        {question.text && (
          <h2
            className={cn(
              "text-2xl sm:text-4xl lg:text-5xl font-bold text-center leading-tight max-w-3xl relative animate-fade-up-delay-1",
              questionTheme.textColor,
            )}
          >
            {question.text}
          </h2>
        )}
        {questionImageUrl && placement === "centered" && (
          <div className="mt-6 relative animate-fade-up-delay-2">
            <QuestionImage
              imageUrl={questionImageUrl}
              imagePlacement="centered"
            />
          </div>
        )}
        <p
          className={cn(
            "text-lg mt-8 relative animate-fade-up-delay-2",
            questionTheme.accentColor,
          )}
        >
          Get ready to answer...
        </p>
      </ThemeBackground>
    );
  }

  // Answering phase
  if (phase && phase === GamePhase.answering && question) {
    const timerBar = timeRemaining !== null && (
      <div className="px-3 sm:px-4 pt-3 sm:pt-4 space-y-1 relative">
        <div className="flex items-center justify-between text-sm">
          <span
            className={cn(
              "font-mono font-bold text-lg",
              questionTheme.textColor,
            )}
          >
            {formatTimeRemaining(timeRemaining)}
          </span>
          <Badge
            variant="outline"
            className={cn("text-xs border-white/20", questionTheme.textColor)}
          >
            Q{questionIndex + 1}
          </Badge>
        </div>
        <Progress value={timerProgress} className="h-2" />
      </div>
    );

    const questionText = question.text ? (
      <div className="px-3 sm:px-4 py-3 sm:py-4 relative">
        <h2
          className={cn(
            "text-lg sm:text-2xl font-bold text-center leading-tight",
            questionTheme.textColor,
          )}
        >
          {question.text}
        </h2>
      </div>
    ) : null;

    const answeredState = (
      <div className="flex-1 flex items-center justify-center px-4 pb-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xl font-semibold text-foreground">
            Answer submitted!
          </p>
          <p className="text-muted-foreground">Waiting for results...</p>
        </div>
      </div>
    );

    const placement = getImagePlacement(question);
    const backgroundImage = questionImageUrl && placement === "background" && (
      <QuestionImage imageUrl={questionImageUrl} imagePlacement="background" />
    );
    const centeredImage = questionImageUrl && placement === "centered" && (
      <QuestionImage imageUrl={questionImageUrl} imagePlacement="centered" />
    );

    // MC / True-False answer tiles
    if (questionType === "quiz" || questionType === "trueFalse") {
      return (
        <ThemeBackground
          theme={question.theme}
          className="min-h-screen flex flex-col"
        >
          {backgroundImage}
          {timerBar}
          {questionText}
          {centeredImage}
          <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3 px-3 sm:px-4 pb-3 sm:pb-4 relative">
            {question.options.map((option, i) => {
              const colorClass = OPTION_COLORS[i % OPTION_COLORS.length];
              const Icon = OPTION_ICONS[i % OPTION_ICONS.length];
              const isSelected = selectedOption === i;
              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(i)}
                  disabled={hasAnswered || isSubmitting}
                  className={cn(
                    "rounded-xl text-white font-bold text-base sm:text-xl flex flex-col items-center justify-center gap-1.5 sm:gap-2 min-h-[80px] relative",
                    colorClass,
                    hasAnswered && !isSelected && "opacity-40",
                    !hasAnswered && "transition-transform active:scale-95",
                    isSubmitting &&
                      !hasAnswered &&
                      "opacity-50 cursor-not-allowed",
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                  <Icon
                    className="h-5 w-5 sm:h-6 sm:w-6 opacity-70"
                    fill="currentColor"
                  />
                  <span className="px-2 text-center leading-tight">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </ThemeBackground>
      );
    }

    // Type Answer
    if (questionType === "typeAnswer") {
      return (
        <ThemeBackground
          theme={question.theme}
          className="min-h-screen flex flex-col"
        >
          {backgroundImage}
          {timerBar}
          {questionText}
          {centeredImage}
          {hasAnswered ? (
            answeredState
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4 gap-4 relative">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value.slice(0, 100))}
                maxLength={100}
                placeholder="Type your answer..."
                className="max-w-md text-lg text-center h-14 text-white bg-white/10 border-white/20 placeholder:text-white/50"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmitText();
                  }
                }}
                disabled={isSubmitting}
                autoFocus
              />
              <Button
                size="lg"
                onClick={handleSubmitText}
                disabled={isSubmitting || !textInput.trim()}
                className="text-lg px-8"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                Submit
              </Button>
            </div>
          )}
        </ThemeBackground>
      );
    }

    // Slider
    if (questionType === "slider") {
      const min = Number(question.sliderMin);
      const max = Number(question.sliderMax);
      return (
        <ThemeBackground
          theme={question.theme}
          className="min-h-screen flex flex-col"
        >
          {backgroundImage}
          {timerBar}
          {questionText}
          {centeredImage}
          {hasAnswered ? (
            answeredState
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4 gap-6 relative">
              <div className="w-full max-w-md space-y-4">
                <div className="text-center">
                  <span
                    className={cn(
                      "text-4xl font-bold",
                      questionTheme.textColor,
                    )}
                  >
                    {sliderInput ?? min}
                  </span>
                </div>
                <Slider
                  value={[sliderInput ?? min]}
                  onValueChange={([val]) => setSliderInput(val)}
                  min={min}
                  max={max}
                  step={1}
                  disabled={isSubmitting}
                />
                <div
                  className={cn(
                    "flex justify-between text-sm",
                    questionTheme.accentColor,
                  )}
                >
                  <span>{min}</span>
                  <span>{max}</span>
                </div>
              </div>
              <Button
                size="lg"
                onClick={handleSubmitSlider}
                disabled={isSubmitting || sliderInput === null}
                className="text-lg px-8"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                Submit
              </Button>
            </div>
          )}
        </ThemeBackground>
      );
    }
  }

  // Results phase — Kahoot-style feedback
  if (phase && phase === GamePhase.results) {
    const wasCorrect = state.lastAnswerCorrect;
    const pointsEarned = Number(state.lastPointsEarned);
    const streak = Number(state.currentStreak);
    const totalScore = Number(state.ownScore);

    const isCorrectDisplay = wasCorrect === true;
    const bgColor =
      wasCorrect === null
        ? "bg-zinc-900"
        : isCorrectDisplay
          ? "bg-green-950"
          : "bg-red-950";
    const accentColor =
      wasCorrect === null
        ? "text-zinc-400"
        : isCorrectDisplay
          ? "text-green-400"
          : "text-red-400";
    const iconBg =
      wasCorrect === null
        ? "bg-zinc-600"
        : isCorrectDisplay
          ? "bg-green-500"
          : "bg-red-500";
    const label =
      wasCorrect === null
        ? "No Answer"
        : isCorrectDisplay
          ? "Correct"
          : "Incorrect";

    return (
      <div
        className={cn(
          "dark min-h-screen relative flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8",
          bgColor,
        )}
      >
        <div className="flex flex-col items-center gap-6 animate-fade-up">
          <h2 className={cn("text-3xl sm:text-5xl font-bold", accentColor)}>
            {label}
          </h2>

          <div
            className={cn(
              "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center",
              iconBg,
            )}
          >
            {isCorrectDisplay ? (
              <Check
                className="h-10 w-10 sm:h-12 sm:w-12 text-white"
                strokeWidth={3}
              />
            ) : (
              <X
                className="h-10 w-10 sm:h-12 sm:w-12 text-white"
                strokeWidth={3}
              />
            )}
          </div>

          {streak >= 2 && (
            <div className="flex items-center gap-2 text-yellow-400 font-semibold text-lg">
              <Flame className="h-5 w-5" />
              Answer Streak {streak}
            </div>
          )}

          {isCorrectDisplay && pointsEarned > 0 && (
            <div className="bg-black/40 rounded-lg px-8 py-3">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                + {pointsEarned.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 py-4 flex items-center gap-3 bg-black/30">
          <div className="flex-1">
            <p className="text-sm text-white/60">{state.ownDisplayName}</p>
            <p className="text-lg font-bold text-white">
              {totalScore.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Scoreboard phase
  if (phase && phase === GamePhase.scoreboard) {
    const sortedPlayers = state.players
      .slice()
      .sort((a, b) => Number(b.score) - Number(a.score));
    const ownRank =
      sortedPlayers.findIndex((p) => p.displayName === state.ownDisplayName) +
      1;

    return (
      <div className="dark min-h-screen bg-background flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
        <ScoreboardPhase
          leaderboard={leaderboard ?? undefined}
          streaks={streaks ?? undefined}
          isLoading={isLeaderboardLoading}
          isError={isLeaderboardError}
          playerContext={{
            displayName: state.ownDisplayName,
            score: Number(state.ownScore),
            rank: ownRank,
            currentStreak: Number(state.currentStreak),
          }}
        />
      </div>
    );
  }

  // Podium phase
  if (phase && phase === GamePhase.podium) {
    const sortedPlayers = state.players
      .slice()
      .sort((a, b) => Number(b.score) - Number(a.score));
    const ownRank =
      sortedPlayers.findIndex((p) => p.displayName === state.ownDisplayName) +
      1;
    const totalPlayers = sortedPlayers.length;

    // Rank reveal screen
    if (showRankReveal) {
      const rankMessage =
        ownRank === 1
          ? "Remarkable win!"
          : ownRank === 2
            ? "So close!"
            : ownRank === 3
              ? "On the podium!"
              : ownRank <= Math.ceil(totalPlayers / 2)
                ? "Great effort!"
                : "Better luck next time!";

      return (
        <div className="dark min-h-screen relative bg-gradient-to-b from-purple-950 to-background flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col items-center gap-6">
            <p className="text-lg text-purple-300 font-medium animate-fade-up">
              You finished
            </p>
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-purple-500/20 border-4 border-purple-400 flex items-center justify-center animate-rank-reveal">
              <span className="text-5xl sm:text-7xl font-bold text-white">
                {ownRank}
              </span>
            </div>
            <p
              className="text-2xl sm:text-3xl font-bold text-white animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              {rankMessage}
            </p>
            <p
              className="text-lg text-purple-300 animate-fade-up"
              style={{ animationDelay: "0.5s" }}
            >
              {Number(state.ownScore).toLocaleString()} pts
            </p>
            <Button
              size="lg"
              onClick={() => setShowRankReveal(false)}
              className="mt-4 animate-fade-up"
              style={{ animationDelay: "0.7s" }}
            >
              <Trophy className="h-5 w-5" />
              See Podium
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="dark min-h-screen bg-background flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
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
          playerContext={{
            displayName: state.ownDisplayName,
            score: Number(state.ownScore),
            rank: ownRank,
          }}
        />
        <Button size="lg" onClick={onPlayAgain} className="mt-8">
          Play Again
        </Button>
      </div>
    );
  }

  // Ended phase
  if (phase && phase === GamePhase.ended) {
    return (
      <div className="dark min-h-screen bg-background flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
        <Trophy className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Game Over
        </h2>
        <p className="text-sm text-muted-foreground mb-1">Final Score</p>
        <p className="text-3xl sm:text-4xl font-bold text-primary mb-6">
          {Number(state.ownScore).toLocaleString()}
        </p>
        <Button size="lg" onClick={onPlayAgain}>
          Play Again
        </Button>
      </div>
    );
  }

  // Fallback
  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
