import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  BarChart3,
  Plus,
  ChevronRight,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuizzes, useReports } from "../hooks/useQueries";

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: quizzes } = useQuizzes();
  const { data: reports } = useReports();

  const quizCount = quizzes?.length ?? 0;
  const reportCount = reports?.length ?? 0;

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="space-y-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">
            Create quizzes, host games, and review results.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* My Quizzes card */}
          <button
            onClick={() => navigate({ to: "/quizzes" })}
            className={cn(
              "group relative text-left rounded-2xl border-2 border-primary/30 bg-card p-6",
              "shadow-md hover:shadow-lg transition-all duration-200",
              "hover:border-primary/60 hover:-translate-y-0.5",
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-xl bg-primary/10 p-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">
              My Quizzes
            </h3>
            <p className="text-sm text-muted-foreground">
              {quizCount === 0
                ? "No quizzes yet"
                : `${quizCount} quiz${quizCount !== 1 ? "zes" : ""}`}
            </p>
          </button>

          {/* Reports card */}
          <button
            onClick={() => navigate({ to: "/reports" })}
            className={cn(
              "group relative text-left rounded-2xl border-2 border-accent/30 bg-card p-6",
              "shadow-md hover:shadow-lg transition-all duration-200",
              "hover:border-accent/60 hover:-translate-y-0.5",
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-xl bg-accent/10 p-3">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">Reports</h3>
            <p className="text-sm text-muted-foreground">
              {reportCount === 0
                ? "No reports yet"
                : `${reportCount} report${reportCount !== 1 ? "s" : ""}`}
            </p>
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex justify-center gap-3 pt-2">
          <Button
            size="lg"
            onClick={() => navigate({ to: "/builder" })}
            className="shadow-md"
          >
            <Plus className="h-4 w-4" />
            Create New Quiz
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate({ to: "/join" })}
            className="shadow-md"
          >
            <Gamepad2 className="h-4 w-4" />
            Join a Game
          </Button>
        </div>
      </div>
    </main>
  );
}
