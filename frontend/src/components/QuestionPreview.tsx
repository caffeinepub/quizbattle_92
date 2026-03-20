import { Triangle, Diamond, Circle, Square, Send, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { type QuestionDraft } from "./QuizBuilder";
import {
  TIME_LIMIT_OPTIONS,
  getThemeConfig,
  OPTION_COLORS,
} from "../utils/constants";
import { ThemeBackground } from "./ThemeBackground";

const OPTION_ICONS = [Triangle, Diamond, Circle, Square];

function formatTimeLimit(seconds: number): string {
  const opt = TIME_LIMIT_OPTIONS.find((o) => o.value === seconds);
  if (opt) return opt.label;
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

interface QuestionPreviewProps {
  question: QuestionDraft;
  questionNumber: number;
}

export function QuestionPreview({
  question,
  questionNumber,
}: QuestionPreviewProps) {
  const questionType = question.questionType;
  const hasContent = question.text.trim() !== "";
  const imageUrl = question.image?.getDirectURL() ?? "";
  const isBackground = question.imagePlacement === "background";
  const theme = getThemeConfig(question.theme);

  return (
    <ThemeBackground
      theme={question.theme}
      className="flex flex-col rounded-xl border"
    >
      {/* Background image */}
      {imageUrl && isBackground && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      {/* Timer bar */}
      <div className="px-4 pt-4 space-y-1 relative">
        <div className="flex items-center justify-between text-sm">
          <span
            className={cn(
              "flex items-center gap-1.5 font-mono font-bold text-lg",
              theme.textColor,
            )}
          >
            <Clock className={cn("h-4 w-4", theme.accentColor)} />
            {formatTimeLimit(question.timeLimit)}
          </span>
          <Badge
            variant="outline"
            className={cn("text-xs border-white/20", theme.textColor)}
          >
            Q{questionNumber}
          </Badge>
        </div>
        <Progress value={100} className="h-2" />
      </div>

      {/* Question text */}
      <div className="px-4 py-4 relative">
        <h2
          className={cn(
            "text-xl font-bold text-center leading-tight",
            hasContent ? theme.textColor : "text-white/30",
          )}
        >
          {hasContent ? question.text : "Question text..."}
        </h2>
      </div>

      {/* Centered image */}
      {imageUrl && !isBackground && (
        <div className="px-4 pb-3 relative">
          <img
            src={imageUrl}
            alt="Question"
            className="max-h-32 w-full object-contain rounded-lg"
          />
        </div>
      )}

      {/* Answer area */}
      <div className="flex-1 px-4 pb-4 relative">
        {/* MC / True-False tiles */}
        {(questionType === "quiz" || questionType === "trueFalse") && (
          <div className="grid grid-cols-2 gap-2">
            {(questionType === "trueFalse"
              ? ["True", "False"]
              : question.options
            ).map((option, i) => {
              const colorClass = OPTION_COLORS[i % OPTION_COLORS.length];
              const Icon = OPTION_ICONS[i % OPTION_ICONS.length];
              const isCorrect = question.correctOptionIndices.includes(i);
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl text-white font-bold text-sm flex flex-col items-center justify-center gap-1 py-4 px-2 relative",
                    colorClass,
                    isCorrect && "ring-2 ring-white/60",
                  )}
                >
                  <Icon className="h-4 w-4 opacity-70" fill="currentColor" />
                  <span className="text-center leading-tight">
                    {option || `Option ${i + 1}`}
                  </span>
                  {isCorrect && (
                    <span className="absolute top-1 right-1.5 text-[10px] font-medium bg-white/20 rounded px-1">
                      correct
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Type Answer */}
        {questionType === "typeAnswer" && (
          <div className="flex flex-col items-center gap-3">
            <Input
              disabled
              placeholder="Type your answer..."
              className="max-w-xs text-center h-12"
            />
            <Button size="sm" disabled className="px-6">
              <Send className="h-4 w-4" />
              Submit
            </Button>
            {question.acceptedAnswers.filter((a) => a.trim()).length > 0 && (
              <p className={cn("text-xs mt-1", theme.accentColor)}>
                Accepted:{" "}
                {question.acceptedAnswers.filter((a) => a.trim()).join(", ")}
              </p>
            )}
          </div>
        )}

        {/* Slider */}
        {questionType === "slider" && (
          <div className="flex flex-col items-center gap-3">
            <span className={cn("text-3xl font-bold", theme.accentColor)}>
              {question.sliderCorrect}
            </span>
            <div className="w-full max-w-xs space-y-2">
              <Slider
                value={[question.sliderCorrect]}
                min={question.sliderMin}
                max={question.sliderMax}
                step={1}
                disabled
              />
              <div
                className={cn(
                  "flex justify-between text-xs",
                  theme.accentColor,
                )}
              >
                <span>{question.sliderMin}</span>
                <span>{question.sliderMax}</span>
              </div>
            </div>
            <Button size="sm" disabled className="px-6">
              <Send className="h-4 w-4" />
              Submit
            </Button>
          </div>
        )}
      </div>

      {/* Footer with settings */}
      <div
        className={cn(
          "border-t border-white/10 px-4 py-2 flex items-center gap-3 text-xs relative",
          theme.accentColor,
        )}
      >
        <span>
          {question.pointMode === "standard"
            ? "Standard pts"
            : question.pointMode === "double"
              ? "Double pts"
              : "No pts"}
        </span>
        {questionType === "quiz" && question.isMultiSelect && (
          <span className="border-l border-white/10 pl-3">
            Multiple correct
          </span>
        )}
        {!question.showQuestionToPlayers && (
          <span className="border-l border-white/10 pl-3">
            Host-only question
          </span>
        )}
      </div>
    </ThemeBackground>
  );
}
