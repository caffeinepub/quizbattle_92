import { useState } from "react";
import {
  Loader2,
  Lock,
  LockOpen,
  Play,
  UserMinus,
  ArrowLeft,
  Users,
  Copy,
  Check,
} from "lucide-react";
import { MuteButton } from "./MuteButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  useSessionState,
  useRemovePlayer,
  useLockSession,
  useStartGame,
} from "../hooks/useQueries";
import { useHostHeartbeatInterval } from "../hooks/useHostHeartbeatInterval";
import { PlayerAvatar } from "./PlayerAvatar";

interface HostLobbyProps {
  sessionId: number;
  onBack: () => void;
}

export function HostLobby({ sessionId, onBack }: HostLobbyProps) {
  useHostHeartbeatInterval(sessionId);

  const { data: session, isLoading, isError } = useSessionState(sessionId);
  const { mutate: removePlayer, isPending: isRemoving } = useRemovePlayer();
  const { mutate: lockSession, isPending: isLocking } = useLockSession();
  const { mutate: startGame, isPending: isStarting } = useStartGame();

  const [playerToRemove, setPlayerToRemove] = useState<{
    playerId: bigint;
    name: string;
  } | null>(null);
  const [pinCopied, setPinCopied] = useState(false);

  const handleCopyPin = async () => {
    if (!session) return;
    await navigator.clipboard.writeText(session.roomPin);
    setPinCopied(true);
    setTimeout(() => setPinCopied(false), 2000);
  };

  const handleRemovePlayer = () => {
    if (!playerToRemove) return;
    removePlayer(
      {
        sessionId: BigInt(sessionId),
        playerId: playerToRemove.playerId,
      },
      {
        onSuccess: () => {
          toast.success(`${playerToRemove.name} removed`);
          setPlayerToRemove(null);
        },
        onError: (error) =>
          toast.error(error.message || "Failed to remove player"),
      },
    );
  };

  const handleToggleLock = () => {
    const newLocked = !session?.isLocked;
    lockSession(
      { sessionId: BigInt(sessionId), locked: newLocked },
      {
        onSuccess: () =>
          toast.success(newLocked ? "Session locked" : "Session unlocked"),
        onError: (error) =>
          toast.error(error.message || "Failed to update lock"),
      },
    );
  };

  const handleStart = () => {
    startGame(
      { sessionId: BigInt(sessionId) },
      {
        onError: (error) =>
          toast.error(error.message || "Failed to start game"),
      },
    );
  };

  if (isError) {
    return (
      <div className="dark min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load session.</p>
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

  const players = session.players ?? [];

  return (
    <div className="dark min-h-screen bg-background flex flex-col text-white">
      <header className="border-b border-white/10 bg-white/5 px-6 py-3 flex items-center justify-between [&_svg]:text-white/70">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-white"
          onClick={() => onBack()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          {session.isLocked && (
            <Badge variant="secondary">
              <Lock className="h-3 w-3" />
              Locked
            </Badge>
          )}
          <Badge variant="outline" className="gap-1 text-white border-white/30">
            <Users className="h-3 w-3" />
            {Number(session.playerCount)} players
          </Badge>
          <MuteButton />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto w-full">
        {/* PIN display */}
        <div className="text-center mb-6 sm:mb-10">
          <p className="text-sm sm:text-base uppercase tracking-wider text-muted-foreground mb-2 sm:mb-3">
            Join with PIN
          </p>
          <button
            onClick={handleCopyPin}
            className="group relative text-6xl sm:text-8xl lg:text-[10rem] font-mono font-bold tracking-[0.3em] text-foreground cursor-pointer hover:text-primary transition-colors"
          >
            {session.roomPin}
            <span className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              {pinCopied ? (
                <Check className="h-6 w-6 text-green-500" />
              ) : (
                <Copy className="h-6 w-6 text-muted-foreground" />
              )}
            </span>
          </button>
          {pinCopied && <p className="text-sm text-green-500 mt-1">Copied!</p>}
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Players join at the landing page with this PIN
          </p>
        </div>

        {/* Player cards */}
        {players.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Users className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3" />
            <p className="text-base sm:text-lg text-muted-foreground">
              Waiting for players to join...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 w-full mb-8">
            {players.map((player, i) => (
              <Card
                key={player.playerId.toString()}
                className="group relative animate-scale-in"
                style={{ animationDelay: `${Math.min(i * 50, 500)}ms` }}
              >
                <CardContent className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
                  <PlayerAvatar
                    avatarIndex={Number(player.avatarIndex)}
                    size="md"
                  />
                  <span className="text-sm sm:text-base font-medium text-foreground truncate">
                    {player.displayName}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-destructive hover:text-destructive"
                    onClick={() =>
                      setPlayerToRemove({
                        playerId: player.playerId,
                        name: player.displayName,
                      })
                    }
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4 mt-auto pb-4 sm:pb-6">
          <Button
            variant="outline"
            size="lg"
            className="text-white border-white/30 hover:text-white"
            onClick={handleToggleLock}
            disabled={isLocking}
          >
            {isLocking && <Loader2 className="h-4 w-4 animate-spin" />}
            {session.isLocked ? (
              <>
                <LockOpen className="h-4 w-4" />
                Unlock Session
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Lock Session
              </>
            )}
          </Button>
          <Button
            onClick={handleStart}
            disabled={isStarting || players.length === 0}
            size="lg"
            className="text-lg lg:text-xl px-8 sm:px-10 py-5 sm:py-6"
          >
            {isStarting && <Loader2 className="h-5 w-5 animate-spin" />}
            <Play className="h-5 w-5" />
            {isStarting ? "Starting..." : "Start Game"}
          </Button>
        </div>
      </div>

      {/* Remove player confirmation */}
      <AlertDialog
        open={!!playerToRemove}
        onOpenChange={() => setPlayerToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove player?</AlertDialogTitle>
            <AlertDialogDescription>
              "{playerToRemove?.name}" will be removed from this session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemovePlayer}
              disabled={isRemoving}
            >
              {isRemoving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isRemoving ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
