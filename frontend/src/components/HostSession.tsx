import { useEffect } from "react";
import { useSessionState } from "../hooks/useQueries";
import { GamePhase, SessionStatus } from "../backend";
import { HostLobby } from "./HostLobby";
import { HostGameScreen } from "./HostGameScreen";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { soundManager } from "../utils/soundManager";

interface HostSessionProps {
  sessionId: number;
  onBack: () => void;
}

export function HostSession({ sessionId, onBack }: HostSessionProps) {
  const {
    data: session,
    isLoading,
    isError,
    error,
  } = useSessionState(sessionId);

  // Game music: play from lobby through gameplay, stop at podium/ended
  const phase = session?.currentPhase;
  const shouldPlayMusic =
    phase !== undefined &&
    phase !== GamePhase.podium &&
    phase !== GamePhase.ended;

  useEffect(() => {
    if (!shouldPlayMusic) return;
    soundManager.playLoop("gameMusic", 8000);
    return () => soundManager.stopLoop("gameMusic");
  }, [shouldPlayMusic]);

  if (isError) {
    const msg = error?.message ?? "";
    const isNotFound =
      msg.includes("not found") || msg.includes("No active session");
    return (
      <div className="dark min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md px-4">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">
            {isNotFound ? "Session Not Found" : "Failed to Load Session"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isNotFound
              ? "This session no longer exists or has already ended."
              : msg || "An unexpected error occurred."}
          </p>
          <Button variant="outline" onClick={onBack}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !session) {
    return (
      <div className="dark min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (session.status === SessionStatus.lobby) {
    return <HostLobby sessionId={sessionId} onBack={onBack} />;
  }

  return <HostGameScreen sessionId={sessionId} onBack={onBack} />;
}
