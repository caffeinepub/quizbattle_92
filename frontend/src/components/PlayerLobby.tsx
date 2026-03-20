import { useState } from "react";
import { Loader2, Users, Pencil, Check, X, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUpdatePlayerName } from "../hooks/useQueries";
import { PlayerAvatar } from "./PlayerAvatar";
import { MuteButton } from "./MuteButton";

interface PlayerLobbyProps {
  state: {
    ownDisplayName: string;
    ownAvatarIndex: bigint;
    playerCount: bigint;
    isLocked: boolean;
    players: Array<{
      playerId: bigint;
      displayName: string;
      avatarIndex: bigint;
    }>;
  } | null;
  isLoading: boolean;
  isError: boolean;
  onLeave: () => void;
  playerToken?: string;
  roomPin?: string;
  displayName?: string;
}

export function PlayerLobby({
  state,
  isLoading,
  isError,
  onLeave,
  playerToken,
  roomPin,
  displayName = "",
}: PlayerLobbyProps) {
  const { mutate: updateName, isPending: isUpdating } = useUpdatePlayerName();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(displayName);

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error("Name cannot be empty");
      return;
    }
    if (trimmed.length > 50) {
      toast.error("Name must be 50 characters or fewer");
      return;
    }
    if (!roomPin || playerToken === undefined) return;
    updateName(
      { roomPin, playerToken: BigInt(playerToken), newName: trimmed },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Name updated");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update name");
        },
      },
    );
  };

  const handleCancelEdit = () => {
    setEditName(state?.ownDisplayName ?? displayName);
    setIsEditing(false);
  };

  if (isLoading || !state) {
    return (
      <div className="dark min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="dark min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load session.</p>
          <Button variant="outline" onClick={onLeave}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const players = state.players ?? [];

  return (
    <div className="dark min-h-screen bg-background flex flex-col">
      <header className="border-b border-white/10 bg-white/5 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLeave}
            className="text-white"
          >
            <LogOut className="h-4 w-4" />
            Leave
          </Button>
        </div>
        <h2 className="text-lg font-bold text-foreground">Game Lobby</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {Number(state.playerCount)} players
          </Badge>
          <MuteButton className="text-white" />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 py-6 sm:py-8 max-w-2xl mx-auto w-full">
        {/* Own player info */}
        <div className="text-center mb-8 space-y-3">
          <PlayerAvatar
            avatarIndex={Number(state.ownAvatarIndex)}
            size="xl"
            className="mx-auto"
          />

          {isEditing ? (
            <div className="flex items-center gap-2 justify-center">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={50}
                className="w-48 text-center text-white bg-white/10 border-white/20 placeholder:text-white/50"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") handleCancelEdit();
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleSaveName}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <span className="text-xl font-semibold text-foreground">
                {state.ownDisplayName}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  setEditName(state.ownDisplayName);
                  setIsEditing(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          )}
        </div>

        {/* Waiting message */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">
              Waiting for host to start the game...
            </span>
          </div>
        </div>

        {/* Player list */}
        {players.length > 0 && (
          <div className="w-full space-y-2">
            <p className="text-sm text-muted-foreground mb-3">
              Players in lobby
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
              {players.map((player, i) => (
                <Card
                  key={player.playerId.toString()}
                  className="animate-scale-in"
                  style={{ animationDelay: `${Math.min(i * 50, 500)}ms` }}
                >
                  <CardContent className="flex items-center gap-3 p-3">
                    <PlayerAvatar
                      avatarIndex={Number(player.avatarIndex)}
                      size="sm"
                    />
                    <span className="text-sm font-medium text-foreground truncate">
                      {player.displayName}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {state.isLocked && (
          <p className="text-sm text-muted-foreground mt-6">
            Session is locked — no more players can join.
          </p>
        )}
      </div>
    </div>
  );
}
