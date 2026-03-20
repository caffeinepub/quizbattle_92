import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Save,
  GripVertical,
  Trash2,
  Copy,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  QuestionType,
  PointMode,
  ImagePlacement,
  ExternalBlob,
} from "../backend";
import { useNavigate } from "@tanstack/react-router";
import { useQuiz, useCreateQuiz, useUpdateQuiz } from "../hooks/useQueries";
import { QuestionStage } from "./QuestionStage";
import { PropertiesPanel } from "./PropertiesPanel";
import {
  OPTION_COLORS,
  MAX_TITLE_LENGTH,
  MAX_QUESTIONS_PER_QUIZ,
} from "../utils/constants";

export type QuestionTypeValue = "quiz" | "trueFalse" | "typeAnswer" | "slider";

export type ImagePlacementValue = "centered" | "background";

export interface QuestionDraft {
  questionType: QuestionTypeValue;
  text: string;
  options: string[];
  correctOptionIndices: number[];
  timeLimit: number;
  pointMode: "standard" | "double" | "none";
  isMultiSelect: boolean;
  acceptedAnswers: string[];
  sliderMin: number;
  sliderMax: number;
  sliderCorrect: number;
  image: ExternalBlob | null;
  imagePlacement: ImagePlacementValue;
  theme: string;
  showQuestionToPlayers: boolean;
}

function emptyQuestion(): QuestionDraft {
  return {
    questionType: "quiz",
    text: "",
    options: ["", ""],
    correctOptionIndices: [0],
    timeLimit: 20,
    pointMode: "standard",
    isMultiSelect: false,
    acceptedAnswers: [""],
    sliderMin: 0,
    sliderMax: 100,
    sliderCorrect: 50,
    image: null,
    imagePlacement: "centered",
    theme: "standard",
    showQuestionToPlayers: true,
  };
}

const QUESTION_TYPE_LABELS: Record<QuestionTypeValue, string> = {
  quiz: "MC",
  trueFalse: "T/F",
  typeAnswer: "Text",
  slider: "Slider",
};

const QUESTION_TYPE_FROM_BACKEND: Record<string, QuestionTypeValue> = {
  [QuestionType.quiz]: "quiz",
  [QuestionType.trueFalse]: "trueFalse",
  [QuestionType.typeAnswer]: "typeAnswer",
  [QuestionType.slider]: "slider",
};

const QUESTION_TYPE_TO_BACKEND: Record<QuestionTypeValue, QuestionType> = {
  quiz: QuestionType.quiz,
  trueFalse: QuestionType.trueFalse,
  typeAnswer: QuestionType.typeAnswer,
  slider: QuestionType.slider,
};

const POINT_MODE_FROM_BACKEND: Record<string, "standard" | "double" | "none"> =
  {
    [PointMode.standard]: "standard",
    [PointMode.double_]: "double",
    [PointMode.none]: "none",
  };

const POINT_MODE_TO_BACKEND: Record<string, PointMode> = {
  standard: PointMode.standard,
  double: PointMode.double_,
  none: PointMode.none,
};

interface QuizBuilderProps {
  quizId: number | null;
}

export function QuizBuilder({ quizId: quizIdNum }: QuizBuilderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const bottomStripRef = useRef<HTMLDivElement>(null);

  const quizId = quizIdNum !== null ? BigInt(quizIdNum) : null;
  const { data: existingQuiz, isLoading } = useQuiz(quizId);
  const { mutate: createQuiz, isPending: isCreating } = useCreateQuiz();
  const { mutate: updateQuiz, isPending: isUpdating } = useUpdateQuiz();

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    emptyQuestion(),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [propertiesOpen, setPropertiesOpen] = useState(false);

  const isSaving = isCreating || isUpdating;

  // Scroll the bottom strip to keep the selected question visible
  useEffect(() => {
    if (!isMobile || !bottomStripRef.current) return;
    const container = bottomStripRef.current;
    const selectedEl = container.children[selectedIndex] as
      | HTMLElement
      | undefined;
    if (selectedEl) {
      selectedEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedIndex, isMobile]);

  useEffect(() => {
    if (existingQuiz && !initialized) {
      setTitle(existingQuiz.title);
      setQuestions(
        existingQuiz.questions.map((q) => ({
          questionType: QUESTION_TYPE_FROM_BACKEND[q.questionType] ?? "quiz",
          text: q.text,
          options: [...q.options],
          correctOptionIndices: [...q.correctOptionIndices].map(Number),
          timeLimit: Number(q.timeLimit),
          pointMode: POINT_MODE_FROM_BACKEND[q.pointMode] ?? "standard",
          isMultiSelect: q.isMultiSelect,
          acceptedAnswers: [...q.acceptedAnswers],
          sliderMin: Number(q.sliderMin),
          sliderMax: Number(q.sliderMax),
          sliderCorrect: Number(q.sliderCorrect),
          image: q.image ?? null,
          imagePlacement: q.imagePlacement
            ? q.imagePlacement === ImagePlacement.centered
              ? "centered"
              : "background"
            : "centered",
          theme: q.theme ?? "standard",
          showQuestionToPlayers: q.showQuestionToPlayers ?? true,
        })),
      );
      setSelectedIndex(0);
      setInitialized(true);
    }
  }, [existingQuiz, initialized]);

  const updateQuestion = (index: number, updated: QuestionDraft) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? updated : q)));
  };

  const addQuestion = () => {
    if (questions.length >= MAX_QUESTIONS_PER_QUIZ) {
      toast.error(`Cannot have more than ${MAX_QUESTIONS_PER_QUIZ} questions`);
      return;
    }
    setQuestions((prev) => [...prev, emptyQuestion()]);
    setSelectedIndex(questions.length);
  };

  const deleteQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    if (selectedIndex >= index && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const applyTimeLimitToAll = (timeLimit: number) => {
    setQuestions((prev) => prev.map((q) => ({ ...q, timeLimit })));
  };

  const duplicateQuestion = (index: number) => {
    const src = questions[index];
    const copy = {
      ...src,
      options: [...src.options],
      correctOptionIndices: [...src.correctOptionIndices],
      acceptedAnswers: [...src.acceptedAnswers],
    };
    setQuestions((prev) => [
      ...prev.slice(0, index + 1),
      copy,
      ...prev.slice(index + 1),
    ]);
    setSelectedIndex(index + 1);
  };

  const moveQuestion = (from: number, to: number) => {
    if (from === to) return;
    setQuestions((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    if (selectedIndex === from) {
      setSelectedIndex(to);
    } else if (from < selectedIndex && to >= selectedIndex) {
      setSelectedIndex(selectedIndex - 1);
    } else if (from > selectedIndex && to <= selectedIndex) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  // Grip-handle touch drag: touching the grip icon starts drag immediately
  const handleGripTouchStart = useCallback(
    (index: number, e: React.TouchEvent) => {
      e.stopPropagation();
      const touch = e.touches[0];
      setDragIndex(index);
      setDragOverIndex(index);
      setDragPos({ x: touch.clientX, y: touch.clientY });
    },
    [],
  );

  const handleStripTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (dragIndex === null || !bottomStripRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      setDragPos({ x: touch.clientX, y: touch.clientY });
      const children = Array.from(
        bottomStripRef.current.children,
      ) as HTMLElement[];
      for (let i = 0; i < children.length; i++) {
        const rect = children[i].getBoundingClientRect();
        if (touch.clientX >= rect.left && touch.clientX <= rect.right) {
          setDragOverIndex(i);
          break;
        }
      }
    },
    [dragIndex],
  );

  const handleStripTouchEnd = useCallback(() => {
    if (
      dragIndex !== null &&
      dragOverIndex !== null &&
      dragIndex !== dragOverIndex
    ) {
      moveQuestion(dragIndex, dragOverIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
    setDragPos(null);
  }, [dragIndex, dragOverIndex, moveQuestion]);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Quiz title is required");
      return;
    }

    const hasEmptyQuestion = questions.some((q) => !q.text.trim());
    if (hasEmptyQuestion) {
      toast.error("All questions must have text");
      return;
    }

    const invalidTypeAnswer = questions.some(
      (q) =>
        q.questionType === "typeAnswer" &&
        q.acceptedAnswers.filter((a) => a.trim() !== "").length === 0,
    );
    if (invalidTypeAnswer) {
      toast.error("Type Answer questions need at least one accepted answer");
      return;
    }

    const invalidSlider = questions.some(
      (q) => q.questionType === "slider" && q.sliderMin >= q.sliderMax,
    );
    if (invalidSlider) {
      toast.error("Slider min must be less than max");
      return;
    }

    const formattedQuestions = questions.map((q) => {
      const isSlider = q.questionType === "slider";
      const isTypeAnswer = q.questionType === "typeAnswer";
      const noOptions = isSlider || isTypeAnswer;
      return {
        questionType: QUESTION_TYPE_TO_BACKEND[q.questionType],
        text: q.text,
        options:
          q.questionType === "trueFalse"
            ? ["True", "False"]
            : noOptions
              ? []
              : q.options,
        correctOptionIndices: noOptions
          ? []
          : q.correctOptionIndices.map(BigInt),
        timeLimit: BigInt(q.timeLimit),
        pointMode: POINT_MODE_TO_BACKEND[q.pointMode],
        isMultiSelect: q.questionType === "quiz" ? q.isMultiSelect : false,
        acceptedAnswers: isTypeAnswer
          ? q.acceptedAnswers.filter((a) => a.trim() !== "")
          : [],
        sliderMin: BigInt(isSlider ? q.sliderMin : 0),
        sliderMax: BigInt(isSlider ? q.sliderMax : 100),
        sliderCorrect: BigInt(isSlider ? q.sliderCorrect : 50),
        image: q.image ?? undefined,
        imagePlacement:
          q.imagePlacement === "background"
            ? ImagePlacement.background
            : ImagePlacement.centered,
        theme: q.theme,
        showQuestionToPlayers: q.showQuestionToPlayers,
      };
    });

    if (quizId === null) {
      createQuiz(
        { title: title.trim(), questions: formattedQuestions },
        {
          onSuccess: () => {
            toast.success("Quiz created");
            navigate({ to: "/" });
          },
          onError: (err) => toast.error(err.message || "Failed to create quiz"),
        },
      );
    } else {
      updateQuiz(
        {
          quizId: quizId!,
          title: title.trim(),
          questions: formattedQuestions,
        },
        {
          onSuccess: () => {
            toast.success("Quiz saved");
            navigate({ to: "/" });
          },
          onError: (err) => toast.error(err.message || "Failed to save quiz"),
        },
      );
    }
  };

  if (quizId !== null && isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (quizId !== null && !isLoading && !existingQuiz) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-destructive text-lg font-medium">Quiz not found</p>
        <Button variant="outline" onClick={() => navigate({ to: "/" })}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const selectedQuestion = questions[selectedIndex];

  return (
    <div
      className={cn(
        "flex flex-1 flex-col overflow-hidden",
        isMobile && "pb-20",
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b bg-card px-3 py-2 md:gap-3 md:px-4 md:py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/" })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Quiz"
          maxLength={MAX_TITLE_LENGTH}
          className="max-w-md text-lg font-semibold"
        />
        <div className="ml-auto flex items-center gap-2">
          {isMobile && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPropertiesOpen(true)}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isSaving ? "Saving..." : "Save"}
            </span>
          </Button>
        </div>
      </div>

      {/* Desktop: 3-column layout / Mobile: full-width stage */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - desktop only */}
        {!isMobile && (
          <div className="shrink-0 border-r bg-card">
            <ScrollArea className="h-full">
              <div className="space-y-2 p-3">
                {questions.map((q, index) => {
                  const correctDots =
                    q.questionType === "quiz" || q.questionType === "trueFalse"
                      ? q.options.map((_, i) =>
                          q.correctOptionIndices.includes(i),
                        )
                      : [];
                  return (
                    <Card
                      key={index}
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverIndex(index);
                      }}
                      onDrop={() => {
                        if (dragIndex !== null) {
                          moveQuestion(dragIndex, index);
                        }
                        setDragIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDragEnd={() => {
                        setDragIndex(null);
                        setDragOverIndex(null);
                      }}
                      className={cn(
                        "group w-44 cursor-pointer p-2 transition-colors",
                        selectedIndex === index
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50",
                        dragIndex === index && "opacity-50",
                        dragOverIndex === index &&
                          dragIndex !== index &&
                          "border-primary border-dashed",
                      )}
                      onClick={() => setSelectedIndex(index)}
                    >
                      <div className="flex items-start gap-1.5">
                        <GripVertical className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 cursor-grab text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className="text-xs font-medium text-muted-foreground">
                              {index + 1}
                            </p>
                            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1 rounded">
                              {QUESTION_TYPE_LABELS[q.questionType]}
                            </span>
                          </div>
                          <p className="truncate text-xs mt-0.5">
                            {q.text || "Untitled question"}
                          </p>
                          {correctDots.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {correctDots.map((isCorrect, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    "h-2 w-2 rounded-full",
                                    OPTION_COLORS[i % OPTION_COLORS.length],
                                    !isCorrect && "opacity-30",
                                  )}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateQuestion(index);
                            }}
                          >
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          </Button>
                          {questions.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteQuestion(index);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}

                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={addQuestion}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Center stage - WYSIWYG */}
        {selectedQuestion && (
          <QuestionStage
            question={selectedQuestion}
            onChange={(updated) => updateQuestion(selectedIndex, updated)}
            questionNumber={selectedIndex + 1}
          />
        )}

        {/* Right sidebar - desktop only */}
        {!isMobile && selectedQuestion && (
          <PropertiesPanel
            question={selectedQuestion}
            onChange={(updated) => updateQuestion(selectedIndex, updated)}
            totalQuestions={questions.length}
            onApplyTimeLimitToAll={applyTimeLimitToAll}
            onDelete={() => deleteQuestion(selectedIndex)}
            onDuplicate={() => duplicateQuestion(selectedIndex)}
            canDelete={questions.length > 1}
          />
        )}
      </div>

      {/* Mobile: bottom question strip */}
      {isMobile && (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t bg-card">
          <div
            className="flex items-center gap-2 px-2 py-2 overflow-x-auto"
            ref={bottomStripRef}
            onTouchMove={handleStripTouchMove}
            onTouchEnd={handleStripTouchEnd}
            onTouchCancel={handleStripTouchEnd}
          >
            {questions.map((q, index) => (
              <div
                key={index}
                className={cn(
                  "shrink-0 w-24 h-14 rounded-lg flex items-center gap-1 px-1 text-xs font-medium transition-all",
                  selectedIndex === index
                    ? "bg-primary/10 border-2 border-primary text-primary"
                    : "bg-muted/50 border border-border text-muted-foreground",
                  isMobile && dragIndex === index && "opacity-50 scale-90",
                  isMobile &&
                    dragOverIndex === index &&
                    dragIndex !== null &&
                    dragIndex !== index &&
                    "border-primary border-2 scale-110",
                )}
              >
                <div
                  className="shrink-0 h-full flex items-center px-1 touch-none cursor-grab"
                  onTouchStart={(e) => handleGripTouchStart(index, e)}
                >
                  <GripVertical className="h-3.5 w-3.5 opacity-40" />
                </div>
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left h-full"
                  onClick={() => setSelectedIndex(index)}
                >
                  <span className="text-[10px] font-bold block">
                    {index + 1}
                  </span>
                  <span className="text-[9px] block truncate">
                    {q.text || "Untitled"}
                  </span>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addQuestion}
              className="shrink-0 w-14 h-14 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile: floating drag ghost */}
      {isMobile && dragIndex !== null && dragPos && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: dragPos.x - 48,
            top: dragPos.y - 28,
          }}
        >
          <div className="w-24 h-14 rounded-lg flex items-center gap-1 px-1 text-xs font-medium bg-primary/20 border-2 border-primary text-primary shadow-lg backdrop-blur-sm">
            <GripVertical className="h-3.5 w-3.5 shrink-0 opacity-60" />
            <div className="min-w-0 flex-1 text-left">
              <span className="text-[10px] font-bold block">
                {dragIndex + 1}
              </span>
              <span className="text-[9px] block truncate">
                {questions[dragIndex]?.text || "Untitled"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile: properties sheet */}
      {isMobile && selectedQuestion && (
        <PropertiesPanel
          question={selectedQuestion}
          onChange={(updated) => updateQuestion(selectedIndex, updated)}
          totalQuestions={questions.length}
          onApplyTimeLimitToAll={applyTimeLimitToAll}
          onDelete={() => deleteQuestion(selectedIndex)}
          onDuplicate={() => duplicateQuestion(selectedIndex)}
          canDelete={questions.length > 1}
          mobileSheet
          open={propertiesOpen}
          onOpenChange={setPropertiesOpen}
        />
      )}
    </div>
  );
}
