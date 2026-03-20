import { useCallback, useEffect, useState, useRef } from "react";
import { usePlayerSession } from "../hooks/usePlayerSession";
import { usePlayerState } from "../hooks/useQueries";
import { GamePhase, SessionStatus } from "../backend";
import { JoinFlow } from "./JoinFlow";
import { PlayerLobby } from "./PlayerLobby";
import { PlayerGameScreen } from "./PlayerGameScreen";
import { Button } from "@/components/ui/button";
import { WifiOff } from "lucide-react";
import { MuteButton } from "./MuteButton";
import { soundManager } from "../utils/soundManager";

const STALE_SESSION_ERRORS = [
  "Invalid room PIN",
  "No active session",
  "Invalid player token",
];

// If the host heartbeat is older than this, consider host disconnected
const HOST_HEARTBEAT_TIMEOUT_MS = 15_000;

export function PlayerRoute() {
  const { session, setSession, clearSession } = usePlayerSession();
  const [hostDisconnected, setHostDisconnected] = useState(false);

  const hasSession = session !== null;

  const {
    data: state,
    isLoading,
    isError,
    error,
  } = usePlayerState(
    hasSession ? session.roomPin : null,
    hasSession ? session.playerToken : null,
  );

  // Game music: play from lobby through gameplay, stop at podium/ended
  const phase = state?.currentPhase;
  const gameOver = phase === GamePhase.podium || phase === GamePhase.ended;
  const shouldPlayMusic = hasSession && !gameOver;

  useEffect(() => {
    if (!shouldPlayMusic) return;
    soundManager.playLoop("gameMusic", 8000);
    return () => soundManager.stopLoop("gameMusic");
  }, [shouldPlayMusic]);

  // Podium fanfare plays at rank reveal screen
  useEffect(() => {
    if (phase === GamePhase.podium) {
      soundManager.play("podiumFanfare");
    }
  }, [phase]);

  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!state || !hasSession || gameOver) return;
    const check = () => {
      const heartbeatNs = Number(state.lastHostHeartbeat);
      const heartbeatMs = heartbeatNs / 1_000_000;
      const now = Date.now();
      if (now - heartbeatMs > HOST_HEARTBEAT_TIMEOUT_MS) {
        setHostDisconnected(true);
      } else {
        setHostDisconnected(false);
      }
    };
    check();
    heartbeatRef.current = setInterval(check, 5_000);
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [state, hasSession, gameOver]);

  // When query errors with placeholder data showing, the session was likely ended
  const sessionEnded = isError && !!state;

  // Auto-clear stale sessions when the backend rejects the stored credentials
  useEffect(() => {
    if (isError && !state) {
      const msg = error?.message ?? "";
      if (STALE_SESSION_ERRORS.some((e) => msg.includes(e))) {
        clearSession();
      }
    }
  }, [isError, state, error, clearSession]);

  const handleJoined = useCallback(
    (playerToken: string, roomPin: string, displayName: string) => {
      setSession({ playerToken, roomPin, displayName });
    },
    [setSession],
  );

  // No session stored — show join flow
  if (!hasSession) {
    return <JoinFlow onJoined={handleJoined} />;
  }

  // Floating mute button for all in-session screens (lobby has its own in header)
  // Positioned bottom-right to avoid overlapping question number badge at top-right
  const floatingMute = (
    <div className="fixed bottom-4 right-4 z-50">
      <MuteButton className="text-white bg-black/30 backdrop-blur-sm rounded-full h-10 w-10" />
    </div>
  );

  // Session ended (query erroring but placeholder data still showing) or host disconnected
  if (sessionEnded || hostDisconnected) {
    return (
      <div className="dark min-h-screen bg-background flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
        {floatingMute}
        <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          {sessionEnded ? "Game Ended" : "Host Disconnected"}
        </h2>
        <p className="text-muted-foreground mb-6 text-center">
          {sessionEnded
            ? "The host has ended the session."
            : "The host appears to have left the game."}
        </p>
        {state && (
          <p className="text-lg font-bold text-primary mb-6">
            Your score: {Number(state.ownScore).toLocaleString()}
          </p>
        )}
        <Button size="lg" onClick={clearSession}>
          Back to Home
        </Button>
      </div>
    );
  }

  // Session stored but data not loaded yet
  if (isLoading && !state) {
    return (
      <PlayerLobby
        state={null}
        isLoading={true}
        isError={false}
        onLeave={clearSession}
      />
    );
  }

  // Still no state somehow
  if (!state) {
    return (
      <PlayerLobby
        state={null}
        isLoading={true}
        isError={false}
        onLeave={clearSession}
      />
    );
  }

  // Lobby — waiting for host to start (has MuteButton in its own header)
  if (state.status === SessionStatus.lobby) {
    return (
      <PlayerLobby
        state={state}
        isLoading={false}
        isError={false}
        onLeave={clearSession}
        playerToken={session.playerToken}
        roomPin={session.roomPin}
        displayName={session.displayName}
      />
    );
  }

  // Active game or ended
  return (
    <>
      {floatingMute}
      <PlayerGameScreen
        state={state}
        roomPin={session.roomPin}
        playerToken={session.playerToken}
        onPlayAgain={clearSession}
      />
    </>
  );
}
