import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useNavigate } from "@tanstack/react-router";
import { useCheckRoomPin, useJoinSession } from "../hooks/useQueries";

type Step = "pin" | "name";

interface JoinFlowProps {
  onJoined: (playerToken: string, roomPin: string, displayName: string) => void;
}

export function JoinFlow({ onJoined }: JoinFlowProps) {
  const [step, setStep] = useState<Step>("pin");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { mutate: checkRoomPin, isPending: isChecking } = useCheckRoomPin();
  const { mutate: joinSession, isPending, isActorReady } = useJoinSession();

  const handlePinComplete = (value: string) => {
    setPin(value);
    if (value.length === 6) {
      setError("");
      checkRoomPin(value, {
        onSuccess: (valid) => {
          if (valid) {
            setStep("name");
          } else {
            setError("Invalid room code. Please try again.");
          }
        },
        onError: () => {
          setError("Could not verify room code. Please try again.");
        },
      });
    }
  };

  const handlePinNext = () => {
    if (pin.length !== 6) return;
    setError("");
    checkRoomPin(pin, {
      onSuccess: (valid) => {
        if (valid) {
          setStep("name");
        } else {
          setError("Invalid room code. Please try again.");
        }
      },
      onError: () => {
        setError("Could not verify room code. Please try again.");
      },
    });
  };

  const handleJoin = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a display name.");
      return;
    }
    if (trimmed.length > 50) {
      setError("Name must be 50 characters or fewer.");
      return;
    }
    setError("");
    joinSession(
      { roomPin: pin, displayName: trimmed },
      {
        onSuccess: (result) => {
          onJoined(String(result.playerToken), pin, trimmed);
        },
        onError: (err) => {
          const msg = err.message || "Failed to join session";
          if (msg.includes("No active session") || msg.includes("pin")) {
            setStep("pin");
            setPin("");
            setError("Invalid room code. Please try again.");
          } else {
            setError(msg);
          }
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (step === "pin") {
        handlePinNext();
      } else {
        handleJoin();
      }
    }
  };

  return (
    <div className="h-dvh bg-background flex flex-col">
      <header className="flex items-center px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (step === "name") {
              setStep("pin");
              setError("");
            } else {
              navigate({ to: "/" });
            }
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8 text-center">
          <div>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {step === "pin" ? "Enter Room Code" : "Choose Your Name"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {step === "pin"
                ? "Ask the host for the 6-digit room code."
                : "Pick a display name for the game."}
            </p>
          </div>

          {step === "pin" ? (
            <div className="space-y-6" onKeyDown={handleKeyDown}>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={pin}
                  onChange={handlePinComplete}
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                size="lg"
                onClick={handlePinNext}
                disabled={pin.length !== 6 || isChecking}
                className="w-full rounded-xl font-bold"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6" onKeyDown={handleKeyDown}>
              <Input
                placeholder="Your display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                autoFocus
                className="text-center text-lg h-12"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                size="lg"
                onClick={handleJoin}
                disabled={isPending || !name.trim() || !isActorReady}
                className="w-full rounded-xl font-bold"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Game"
                )}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
