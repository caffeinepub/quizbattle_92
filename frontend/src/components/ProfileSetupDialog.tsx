import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSetProfile } from "../hooks/useQueries";
import { toast } from "sonner";

interface ProfileSetupDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  currentName?: string;
}

export function ProfileSetupDialog({
  open,
  onOpenChange,
  currentName,
}: ProfileSetupDialogProps) {
  const isEditing = !!currentName;
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { mutate: setProfile, isPending: isSettingProfile } = useSetProfile();

  useEffect(() => {
    if (open) {
      setName(currentName ?? "");
      setError(null);
    }
  }, [open, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setProfile(
      { name: name.trim() },
      {
        onSuccess: () => {
          if (isEditing) {
            toast.success("Name updated");
            onOpenChange?.(false);
          }
        },
        onError: (err: unknown) => {
          setError(
            err instanceof Error ? err.message : "Failed to save profile",
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={isEditing ? onOpenChange : undefined}>
      <DialogContent showCloseButton={isEditing} className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Profile" : "Welcome to QuizBattle!"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update your display name."
                : "Set up your host profile to start creating quizzes."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim() || isSettingProfile}>
              {isSettingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSettingProfile
                ? "Saving..."
                : isEditing
                  ? "Save"
                  : "Get Started"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
