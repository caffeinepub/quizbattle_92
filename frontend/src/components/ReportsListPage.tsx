import { useState } from "react";
import { format } from "date-fns";
import {
  Trash2,
  Loader2,
  ClipboardList,
  Users,
  HelpCircle,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useReports, useDeleteReport } from "../hooks/useQueries";
import { fromNanoseconds } from "../utils/formatting";

export function ReportsListPage() {
  const { data: reports, isLoading, isError } = useReports();
  const { mutate: deleteReport, isPending: isDeletingReport } =
    useDeleteReport();
  const navigate = useNavigate();
  const [reportToDelete, setReportToDelete] = useState<{
    id: bigint;
    title: string;
  } | null>(null);

  const handleDeleteReport = () => {
    if (!reportToDelete) return;
    deleteReport(
      { reportId: reportToDelete.id },
      {
        onSuccess: () => {
          toast.success("Report deleted");
          setReportToDelete(null);
        },
        onError: () => toast.error("Failed to delete report"),
      },
    );
  };

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
        <p className="text-destructive">Failed to load reports.</p>
      </div>
    );
  }

  const reportList = reports ?? [];

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
          <h2 className="text-2xl font-bold text-foreground">Reports</h2>
        </div>

        {reportList.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-1">
                No reports yet
              </p>
              <p className="text-sm text-muted-foreground">
                Play a quiz to see results here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {reportList.map((report) => (
              <Card
                key={report.id.toString()}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() =>
                  navigate({
                    to: "/reports/$reportId",
                    params: { reportId: String(report.id) },
                  })
                }
              >
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-6 min-w-0">
                    <span className="font-medium text-foreground truncate">
                      {report.quizTitle}
                    </span>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(
                          fromNanoseconds(report.playedAt),
                          "MMM d, yyyy",
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {Number(report.playerCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <HelpCircle className="h-3.5 w-3.5" />
                        {Number(report.questionCount)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReportToDelete({
                        id: report.id,
                        title: report.quizTitle,
                      });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!reportToDelete}
        onOpenChange={() => setReportToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete report?</AlertDialogTitle>
            <AlertDialogDescription>
              Report for &ldquo;{reportToDelete?.title}&rdquo; will be
              permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingReport}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReport}
              disabled={isDeletingReport}
            >
              {isDeletingReport && <Loader2 className="h-4 w-4 animate-spin" />}
              {isDeletingReport ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
