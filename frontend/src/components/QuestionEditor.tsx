import { useRef } from "react";
import {
  Plus,
  Trash2,
  Check,
  CopyCheck,
  ImagePlus,
  X,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  type QuestionDraft,
  type QuestionTypeValue,
  type ImagePlacementValue,
} from "./QuizBuilder";
import {
  TIME_LIMIT_OPTIONS,
  POINT_MODE_OPTIONS,
  MAX_OPTIONS,
  MIN_OPTIONS,
  THEME_OPTIONS,
} from "../utils/constants";
import {
  handleImageUpload as uploadImage,
  handleTypeChange as changeType,
  toggleCorrect,
  updateOptionText,
  addOption,
  removeOption,
  updateAcceptedAnswer,
  addAcceptedAnswer,
  removeAcceptedAnswer,
} from "../utils/questionDraftHelpers";

const EDITOR_OPTION_STYLES = [
  "bg-red-500/15 border-red-500/30 hover:border-red-500/50",
  "bg-blue-500/15 border-blue-500/30 hover:border-blue-500/50",
  "bg-yellow-500/15 border-yellow-500/30 hover:border-yellow-500/50",
  "bg-green-500/15 border-green-500/30 hover:border-green-500/50",
];

const EDITOR_OPTION_STYLES_SELECTED = [
  "bg-red-500/30 border-red-500 ring-1 ring-red-500/50",
  "bg-blue-500/30 border-blue-500 ring-1 ring-blue-500/50",
  "bg-yellow-500/30 border-yellow-500 ring-1 ring-yellow-500/50",
  "bg-green-500/30 border-green-500 ring-1 ring-green-500/50",
];

const QUESTION_TYPE_OPTIONS: { value: QuestionTypeValue; label: string }[] = [
  { value: "quiz", label: "Multiple Choice" },
  { value: "trueFalse", label: "True / False" },
  { value: "typeAnswer", label: "Type Answer" },
  { value: "slider", label: "Slider" },
];

interface QuestionEditorProps {
  question: QuestionDraft;
  onChange: (updated: QuestionDraft) => void;
  questionNumber: number;
  totalQuestions: number;
  onApplyTimeLimitToAll: (timeLimit: number) => void;
}

export function QuestionEditor({
  question,
  onChange,
  questionNumber,
  totalQuestions,
  onApplyTimeLimitToAll,
}: QuestionEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUrl = question.image?.getDirectURL() ?? "";

  const handleRemoveImage = () => {
    onChange({ ...question, image: null });
  };

  const handleMultiSelectToggle = (checked: boolean) => {
    onChange({
      ...question,
      isMultiSelect: checked,
      correctOptionIndices: checked
        ? question.correctOptionIndices
        : [question.correctOptionIndices[0]],
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">
        Question {questionNumber}
      </h3>

      {/* Question type selector */}
      <div className="space-y-2">
        <Label>Question Type</Label>
        <Select
          value={question.questionType}
          onValueChange={(v) =>
            changeType(v as QuestionTypeValue, question, onChange)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Question text */}
      <div className="space-y-2">
        <Label htmlFor="question-text">Question Text</Label>
        <Textarea
          id="question-text"
          value={question.text}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
          placeholder="Enter your question..."
          className="min-h-[80px] text-base"
        />
      </div>

      {/* Image attachment */}
      <div className="space-y-2">
        <Label>Image (optional)</Label>
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
        {question.image ? (
          <div className="space-y-2">
            <div className="relative rounded-lg border overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Question image"
                  className="max-h-48 w-full object-contain bg-muted"
                />
              ) : (
                <div className="flex h-32 items-center justify-center bg-muted">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-xs text-muted-foreground">Display</Label>
              <Select
                value={question.imagePlacement}
                onValueChange={(v) =>
                  onChange({
                    ...question,
                    imagePlacement: v as ImagePlacementValue,
                  })
                }
              >
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="centered">Centered media</SelectItem>
                  <SelectItem value="background">Full background</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
            Add Image
          </Button>
        )}
      </div>

      {/* MC answer options */}
      {question.questionType === "quiz" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Answer Options</Label>
            <span className="text-xs text-muted-foreground">
              Click checkmark to mark correct
            </span>
          </div>

          {question.options.map((option, index) => {
            const isCorrect = question.correctOptionIndices.includes(index);
            return (
              <div key={index} className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => toggleCorrect(index, question, onChange)}
                      className={cn(
                        "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border transition-colors",
                        isCorrect
                          ? EDITOR_OPTION_STYLES_SELECTED[index]
                          : EDITOR_OPTION_STYLES[index],
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 transition-opacity",
                          isCorrect ? "opacity-100" : "opacity-30",
                        )}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isCorrect ? "Marked as correct" : "Mark as correct"}
                  </TooltipContent>
                </Tooltip>
                <Input
                  value={option}
                  onChange={(e) =>
                    updateOptionText(index, e.target.value, question, onChange)
                  }
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                {question.options.length > MIN_OPTIONS && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 flex-shrink-0"
                    onClick={() => removeOption(index, question, onChange)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            );
          })}

          {question.options.length < MAX_OPTIONS && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => addOption(question, onChange)}
              className="mt-1"
            >
              <Plus className="h-4 w-4" />
              Add Option
            </Button>
          )}
        </div>
      )}

      {/* True/False correct answer */}
      {question.questionType === "trueFalse" && (
        <div className="space-y-3">
          <Label>Correct Answer</Label>
          <div className="flex gap-3">
            {["True", "False"].map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() =>
                  onChange({ ...question, correctOptionIndices: [index] })
                }
                className={cn(
                  "flex-1 rounded-lg border-2 p-4 text-center font-semibold text-lg transition-colors",
                  question.correctOptionIndices[0] === index
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted hover:border-muted-foreground/30",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Type Answer accepted answers */}
      {question.questionType === "typeAnswer" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Accepted Answers</Label>
            <span className="text-xs text-muted-foreground">
              Case-insensitive matching
            </span>
          </div>

          {question.acceptedAnswers.map((answer, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={answer}
                onChange={(e) =>
                  updateAcceptedAnswer(
                    index,
                    e.target.value,
                    question,
                    onChange,
                  )
                }
                placeholder={`Accepted answer ${index + 1}`}
                className="flex-1"
              />
              {question.acceptedAnswers.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0"
                  onClick={() =>
                    removeAcceptedAnswer(index, question, onChange)
                  }
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => addAcceptedAnswer(question, onChange)}
            className="mt-1"
          >
            <Plus className="h-4 w-4" />
            Add Accepted Answer
          </Button>
        </div>
      )}

      {/* Slider settings */}
      {question.questionType === "slider" && (
        <div className="space-y-4">
          <Label>Slider Range & Correct Value</Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="slider-min"
                className="text-xs text-muted-foreground"
              >
                Min
              </Label>
              <Input
                id="slider-min"
                type="number"
                value={question.sliderMin}
                onChange={(e) =>
                  onChange({
                    ...question,
                    sliderMin: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="slider-max"
                className="text-xs text-muted-foreground"
              >
                Max
              </Label>
              <Input
                id="slider-max"
                type="number"
                value={question.sliderMax}
                onChange={(e) =>
                  onChange({
                    ...question,
                    sliderMax: Number(e.target.value) || 100,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="slider-correct"
                className="text-xs text-muted-foreground"
              >
                Correct
              </Label>
              <Input
                id="slider-correct"
                type="number"
                value={question.sliderCorrect}
                onChange={(e) =>
                  onChange({
                    ...question,
                    sliderCorrect: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Settings row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Time Limit</Label>
          <div className="flex gap-2">
            <Select
              value={String(question.timeLimit)}
              onValueChange={(v) =>
                onChange({ ...question, timeLimit: Number(v) })
              }
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_LIMIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {totalQuestions > 1 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 flex-shrink-0"
                    onClick={() => {
                      onApplyTimeLimitToAll(question.timeLimit);
                      toast.success("Time limit applied to all questions");
                    }}
                  >
                    <CopyCheck className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Apply to all questions</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Points</Label>
          <Select
            value={question.pointMode}
            onValueChange={(v) =>
              onChange({
                ...question,
                pointMode: v as "standard" | "double" | "none",
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POINT_MODE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Theme</Label>
          <Select
            value={question.theme}
            onValueChange={(v) => onChange({ ...question, theme: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEME_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Multi-select toggle (MC only) */}
      {question.questionType === "quiz" && (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="multi-select" className="cursor-pointer">
              Multiple correct answers
            </Label>
            <p className="text-xs text-muted-foreground">
              More than one option can be the right answer
            </p>
          </div>
          <Switch
            id="multi-select"
            checked={question.isMultiSelect}
            onCheckedChange={handleMultiSelectToggle}
          />
        </div>
      )}

      {/* Show question text to players */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <Label htmlFor="show-question" className="cursor-pointer">
            Show question on player devices
          </Label>
          <p className="text-xs text-muted-foreground">
            Turn off if the question is only shown on the host screen
          </p>
        </div>
        <Switch
          id="show-question"
          checked={question.showQuestionToPlayers}
          onCheckedChange={(checked) =>
            onChange({ ...question, showQuestionToPlayers: checked })
          }
        />
      </div>
    </div>
  );
}
