import { useState } from "react";
import { format } from "date-fns";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FileQuestion,
  Play,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import {
  useQuizzes,
  useDeleteQuiz,
  useCreateSession,
} from "../hooks/useQueries";
import { fromNanoseconds } from "../utils/formatting";
import { HostSession } from "./HostSession";

export function QuizzesPage() {
  const { data: quizzes, isLoading, isError } = useQuizzes();
  const { mutate: deleteQuiz, isPending: isDeleting } = useDeleteQuiz();
  const { mutate: createSession, isPending: isCreatingSession } =
    useCreateSession();
  const navigate = useNavigate();
  const [quizToDelete, setQuizToDelete] = useState<{
    id: bigint;
    title: string;
  } | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);

  const handleStartSession = (quizId: bigint) => {
    createSession(
      { quizId },
      {
        onSuccess: (result) => {
          setActiveSessionId(Number(result.sessionId));
        },
        onError: (error) =>
          toast.error(error.message || "Failed to start session"),
      },
    );
  };

  const handleDelete = () => {
    if (!quizToDelete) return;
    deleteQuiz(
      { quizId: quizToDelete.id },
      {
        onSuccess: () => {
          toast.success("Quiz deleted");
          setQuizToDelete(null);
        },
        onError: () => toast.error("Failed to delete quiz"),
      },
    );
  };

  if (activeSessionId !== null) {
    return (
      <div className="dark fixed inset-0 z-50">
        <HostSession
          sessionId={activeSessionId}
          onBack={() => setActiveSessionId(null)}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-destructive">Failed to load quizzes.</p>
      </div>
    );
  }

  const quizList = quizzes ?? [];

  return (
    <main className="self-stretch w-full max-w-2xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/" })}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">My Quizzes</h2>
            <Button onClick={() => navigate({ to: "/builder" })}>
              <Plus className="h-4 w-4" />
              Create Quiz
            </Button>
          </div>
        </div>

        {quizList.length === 0 ? (
          <Card className="border-dashed w-full">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-1">
                No quizzes yet
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first quiz to get started.
              </p>
              <Button onClick={() => navigate({ to: "/builder" })}>
                <Plus className="h-4 w-4" />
                Create Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {quizList.map((quiz) => (
              <Card key={quiz.id.toString()} className="group">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg leading-snug line-clamp-2">
                    {quiz.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {quiz.questions.length}{" "}
                      {quiz.questions.length === 1 ? "question" : "questions"}
                    </span>
                    <span>
                      Edited{" "}
                      {format(fromNanoseconds(quiz.updatedAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStartSession(quiz.id)}
                      disabled={
                        isCreatingSession || quiz.questions.length === 0
                      }
                    >
                      {isCreatingSession ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                      Play
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate({
                          to: "/builder/$quizId",
                          params: { quizId: String(quiz.id) },
                        })
                      }
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setQuizToDelete({ id: quiz.id, title: quiz.title })
                      }
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!quizToDelete}
        onOpenChange={() => setQuizToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{quizToDelete?.title}&rdquo; will be permanently deleted.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
