import { useRef } from "react";
import {
  Triangle,
  Diamond,
  Circle,
  Square,
  Check,
  Plus,
  X,
  ImagePlus,
  Loader2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { type QuestionDraft, type ImagePlacementValue } from "./QuizBuilder";
import { ThemeBackground } from "./ThemeBackground";
import {
  MAX_OPTIONS,
  MIN_OPTIONS,
  MAX_QUESTION_TEXT_LENGTH,
  MAX_OPTION_TEXT_LENGTH,
} from "../utils/constants";
import {
  handleImageUpload as uploadImage,
  toggleCorrect,
  updateOptionText,
  addOption,
  removeOption,
  updateAcceptedAnswer,
  addAcceptedAnswer,
  removeAcceptedAnswer,
} from "../utils/questionDraftHelpers";

const OPTION_ICONS = [Triangle, Diamond, Circle, Square];
const ANSWER_COLORS = [
  "bg-red-500 hover:bg-red-600",
  "bg-blue-500 hover:bg-blue-600",
  "bg-yellow-500 hover:bg-yellow-600",
  "bg-green-500 hover:bg-green-600",
];

interface QuestionStageProps {
  question: QuestionDraft;
  onChange: (updated: QuestionDraft) => void;
  questionNumber: number;
}

export function QuestionStage({
  question,
  onChange,
  questionNumber,
}: QuestionStageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUrl = question.image?.getDirectURL() ?? "";
  const isBackground = question.imagePlacement === "background";

  return (
    <ThemeBackground
      theme={question.theme}
      className="flex-1 flex flex-col min-h-0"
    >
      {/* Background image overlay */}
      {imageUrl && isBackground && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadImage(file, question, onChange);
          e.target.value = "";
        }}
      />

      <div className="relative flex flex-1 flex-col p-3 md:p-6 gap-3 md:gap-4 overflow-y-auto">
        {/* Question text */}
        <div className="flex justify-center">
          <textarea
            value={question.text}
            onChange={(e) => onChange({ ...question, text: e.target.value })}
            placeholder="Type your question here..."
            rows={2}
            maxLength={MAX_QUESTION_TEXT_LENGTH}
            className="bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20 text-white text-xl md:text-2xl font-bold text-center p-4 w-full max-w-2xl resize-none focus:border-white/40 focus:outline-none placeholder:text-white/30"
          />
        </div>

        {/* Image area */}
        {question.image ? (
          <div className="flex justify-center">
            {!isBackground && (
              <div className="relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Question"
                    className="max-h-48 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-32 w-48 items-center justify-center rounded-lg bg-white/10">
                    <Loader2 className="h-5 w-5 animate-spin text-white/50" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs bg-black/50 hover:bg-black/70 text-white border-0"
                    onClick={() =>
                      onChange({
                        ...question,
                        imagePlacement: isBackground
                          ? "centered"
                          : ("background" as ImagePlacementValue),
                      })
                    }
                  >
                    {isBackground ? "Centered" : "Use as background"}
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7 bg-black/50 hover:bg-red-500/80 text-white border-0"
                    onClick={() => onChange({ ...question, image: null })}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
            {isBackground && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs bg-black/50 hover:bg-black/70 text-white border-0"
                  onClick={() =>
                    onChange({
                      ...question,
                      imagePlacement: "centered" as ImagePlacementValue,
                    })
                  }
                >
                  Use as media
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7 bg-black/50 hover:bg-red-500/80 text-white border-0"
                  onClick={() => onChange({ ...question, image: null })}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-xl px-8 py-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-white/40 hover:bg-white/5 transition-colors"
            >
              <ImagePlus className="h-8 w-8 text-white/40" />
              <span className="text-sm text-white/40">Click to add image</span>
            </button>
          </div>
        )}

        {/* Answer area */}
        <div className="flex-1 flex flex-col justify-end gap-3">
          {/* MC answers */}
          {question.questionType === "quiz" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-3xl mx-auto w-full">
                {question.options.map((option, index) => {
                  const Icon = OPTION_ICONS[index % OPTION_ICONS.length];
                  const isCorrect =
                    question.correctOptionIndices.includes(index);
                  return (
                    <div
                      key={index}
                      className={cn(
                        "group relative rounded-xl text-white font-bold flex items-center gap-3 p-3 sm:p-4 min-h-[56px] sm:min-h-[70px] transition-colors",
                        ANSWER_COLORS[index % ANSWER_COLORS.length],
                      )}
                    >
                      <Icon
                        className="h-5 w-5 opacity-70 shrink-0"
                        fill="currentColor"
                      />
                      <input
                        value={option}
                        onChange={(e) =>
                          updateOptionText(
                            index,
                            e.target.value,
                            question,
                            onChange,
                          )
                        }
                        placeholder={`Option ${index + 1}`}
                        maxLength={MAX_OPTION_TEXT_LENGTH}
                        className="flex-1 bg-transparent text-white font-bold placeholder:text-white/40 border-none outline-none min-w-0"
                      />
                      <button
                        type="button"
                        onClick={() => toggleCorrect(index, question, onChange)}
                        className={cn(
                          "shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                          isCorrect
                            ? "bg-green-500 text-white"
                            : "bg-white/20 text-white/40 hover:bg-white/30",
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      {question.options.length > MIN_OPTIONS && (
                        <button
                          type="button"
                          onClick={() =>
                            removeOption(index, question, onChange)
                          }
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {question.options.length < MAX_OPTIONS && (
                <div className="flex justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 text-white border-0"
                    onClick={() => addOption(question, onChange)}
                  >
                    <Plus className="h-4 w-4" />
                    Add more answers
                  </Button>
                </div>
              )}
            </>
          )}

          {/* True/False answers */}
          {question.questionType === "trueFalse" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-3xl mx-auto w-full">
              {["True", "False"].map((label, index) => {
                const Icon = OPTION_ICONS[index];
                const isCorrect = question.correctOptionIndices.includes(index);
                return (
                  <div
                    key={label}
                    className={cn(
                      "rounded-xl text-white font-bold flex items-center gap-3 p-3 sm:p-4 min-h-[56px] sm:min-h-[70px]",
                      ANSWER_COLORS[index],
                    )}
                  >
                    <Icon
                      className="h-5 w-5 opacity-70 shrink-0"
                      fill="currentColor"
                    />
                    <span className="flex-1 text-lg">{label}</span>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({ ...question, correctOptionIndices: [index] })
                      }
                      className={cn(
                        "shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                        isCorrect
                          ? "bg-green-500 text-white"
                          : "bg-white/20 text-white/40 hover:bg-white/30",
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Type Answer */}
          {question.questionType === "typeAnswer" && (
            <div className="max-w-3xl mx-auto w-full space-y-3">
              {/* Primary answer */}
              <div className="rounded-xl bg-red-500 text-white font-bold flex items-center gap-3 p-4 min-h-[60px]">
                <Triangle
                  className="h-5 w-5 opacity-70 shrink-0"
                  fill="currentColor"
                />
                <input
                  value={question.acceptedAnswers[0] ?? ""}
                  onChange={(e) =>
                    updateAcceptedAnswer(0, e.target.value, question, onChange)
                  }
                  placeholder="Type the correct answer"
                  maxLength={MAX_OPTION_TEXT_LENGTH}
                  className="flex-1 bg-transparent text-white font-bold placeholder:text-white/40 border-none outline-none"
                />
              </div>

              {question.acceptedAnswers.length > 1 && (
                <p className="text-center text-white/60 text-sm font-medium">
                  Other accepted answers
                </p>
              )}

              {/* Additional answers */}
              <div className="flex flex-wrap gap-3">
                {question.acceptedAnswers.slice(1).map((answer, i) => {
                  const realIndex = i + 1;
                  const colorIndex = (realIndex % 3) + 1; // cycle blue, yellow, green
                  return (
                    <div
                      key={realIndex}
                      className={cn(
                        "group relative rounded-xl text-white font-bold flex items-center gap-3 p-3 min-h-[50px] flex-1 min-w-[150px]",
                        ANSWER_COLORS[colorIndex],
                      )}
                    >
                      <input
                        value={answer}
                        onChange={(e) =>
                          updateAcceptedAnswer(
                            realIndex,
                            e.target.value,
                            question,
                            onChange,
                          )
                        }
                        placeholder={`Alternative ${realIndex}`}
                        maxLength={MAX_OPTION_TEXT_LENGTH}
                        className="flex-1 bg-transparent text-white font-bold placeholder:text-white/40 border-none outline-none min-w-0"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          removeAcceptedAnswer(realIndex, question, onChange)
                        }
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-0"
                  onClick={() => addAcceptedAnswer(question, onChange)}
                >
                  <Plus className="h-4 w-4" />
                  Add accepted answer
                </Button>
              </div>
            </div>
          )}

          {/* Slider */}
          {question.questionType === "slider" && (
            <div className="max-w-md mx-auto w-full flex flex-col items-center gap-4">
              <span className="text-4xl font-bold text-white">
                {question.sliderCorrect}
              </span>
              <div className="w-full space-y-2">
                <Slider
                  value={[question.sliderCorrect]}
                  min={question.sliderMin}
                  max={question.sliderMax}
                  step={1}
                  onValueChange={([v]) =>
                    onChange({ ...question, sliderCorrect: v })
                  }
                />
                <div className="flex justify-between text-xs text-white/60">
                  <span>{question.sliderMin}</span>
                  <span>{question.sliderMax}</span>
                </div>
              </div>
              <Button
                size="sm"
                disabled
                className="bg-white/10 text-white/40 border-0"
              >
                <Send className="h-4 w-4" />
                Submit
              </Button>
            </div>
          )}
        </div>
      </div>
    </ThemeBackground>
  );
}
