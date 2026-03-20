import {
  Clock,
  Award,
  Settings2,
  Eye,
  SlidersHorizontal,
  Palette,
  ListChecks,
  Trash2,
  Copy,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { type QuestionDraft, type QuestionTypeValue } from "./QuizBuilder";
import { ThemeBackground } from "./ThemeBackground";
import {
  TIME_LIMIT_OPTIONS,
  POINT_MODE_OPTIONS,
  THEME_OPTIONS,
} from "../utils/constants";
import { handleTypeChange as changeType } from "../utils/questionDraftHelpers";

const QUESTION_TYPE_OPTIONS: { value: QuestionTypeValue; label: string }[] = [
  { value: "quiz", label: "Multiple Choice" },
  { value: "trueFalse", label: "True / False" },
  { value: "typeAnswer", label: "Type Answer" },
  { value: "slider", label: "Slider" },
];

interface PropertiesPanelProps {
  question: QuestionDraft;
  onChange: (updated: QuestionDraft) => void;
  totalQuestions: number;
  onApplyTimeLimitToAll: (timeLimit: number) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  canDelete: boolean;
  mobileSheet?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PropertiesPanel({
  question,
  onChange,
  totalQuestions,
  onApplyTimeLimitToAll,
  onDelete,
  onDuplicate,
  canDelete,
  mobileSheet,
  open,
  onOpenChange,
}: PropertiesPanelProps) {
  const themesContent = (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-2">
        {THEME_OPTIONS.map((theme) => (
          <button
            key={theme.value}
            type="button"
            onClick={() => onChange({ ...question, theme: theme.value })}
            className={cn(
              "relative rounded-lg overflow-hidden aspect-[4/3] transition-all",
              question.theme === theme.value
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "hover:ring-1 hover:ring-white/30",
            )}
          >
            <ThemeBackground theme={theme.value} className="absolute inset-0">
              <span className="sr-only">{theme.label}</span>
            </ThemeBackground>
            <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs font-medium py-1 text-center">
              {theme.icon} {theme.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const propertiesContent = (
    <div className="p-4 space-y-5">
      {/* Question type */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <ListChecks className="h-4 w-4 text-muted-foreground" />
          Question type
        </Label>
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

      {/* Time limit */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Time limit
        </Label>
        <Select
          value={String(question.timeLimit)}
          onValueChange={(v) => onChange({ ...question, timeLimit: Number(v) })}
        >
          <SelectTrigger>
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
          <button
            type="button"
            className="text-sm text-primary hover:underline cursor-pointer"
            onClick={() => {
              onApplyTimeLimitToAll(question.timeLimit);
              toast.success("Time limit applied to all questions");
            }}
          >
            Apply to all questions
          </button>
        )}
      </div>

      {/* Points */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Award className="h-4 w-4 text-muted-foreground" />
          Points
        </Label>
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

      {/* Answer options (MC only) */}
      {question.questionType === "quiz" && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            Answer options
          </Label>
          <Select
            value={question.isMultiSelect ? "multi" : "single"}
            onValueChange={(v) =>
              onChange({
                ...question,
                isMultiSelect: v === "multi",
                correctOptionIndices:
                  v === "multi"
                    ? question.correctOptionIndices
                    : [question.correctOptionIndices[0]],
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single select</SelectItem>
              <SelectItem value="multi">Multi select</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Show to players */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Eye className="h-4 w-4 text-muted-foreground" />
          Show to players
        </Label>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Show question on player devices
          </p>
          <Switch
            checked={question.showQuestionToPlayers}
            onCheckedChange={(checked) =>
              onChange({ ...question, showQuestionToPlayers: checked })
            }
          />
        </div>
      </div>

      {/* Slider settings */}
      {question.questionType === "slider" && (
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            Slider range
          </Label>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Min</Label>
              <Input
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
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Max</Label>
              <Input
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
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Correct value
              </Label>
              <Input
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

      <Separator />

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onDelete}
          disabled={!canDelete}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onDuplicate}
        >
          <Copy className="h-4 w-4" />
          Duplicate
        </Button>
      </div>
    </div>
  );

  if (mobileSheet) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="max-h-[80vh] p-0 flex flex-col">
          <SheetHeader className="px-4 pt-4 pb-0 shrink-0">
            <SheetTitle>Question Settings</SheetTitle>
          </SheetHeader>
          <Tabs
            defaultValue="properties"
            className="flex flex-col flex-1 min-h-0"
          >
            <TabsList className="w-full rounded-none border-b h-auto p-0 bg-transparent shrink-0">
              <TabsTrigger
                value="themes"
                className="flex-1 gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3"
              >
                <Palette className="h-4 w-4" />
                Themes
              </TabsTrigger>
              <TabsTrigger
                value="properties"
                className="flex-1 gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Properties
              </TabsTrigger>
            </TabsList>
            <TabsContent value="themes" className="flex-1 m-0 overflow-y-auto">
              {themesContent}
            </TabsContent>
            <TabsContent
              value="properties"
              className="flex-1 m-0 overflow-y-auto"
            >
              {propertiesContent}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-72 flex-shrink-0 border-l bg-card flex flex-col">
      <Tabs defaultValue="properties" className="flex flex-col flex-1 min-h-0">
        <TabsList className="w-full rounded-none border-b h-auto p-0 bg-transparent shrink-0">
          <TabsTrigger
            value="themes"
            className="flex-1 gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3"
          >
            <Palette className="h-4 w-4" />
            Themes
          </TabsTrigger>
          <TabsTrigger
            value="properties"
            className="flex-1 gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Properties
          </TabsTrigger>
        </TabsList>
        <TabsContent value="themes" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">{themesContent}</ScrollArea>
        </TabsContent>
        <TabsContent value="properties" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">{propertiesContent}</ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
