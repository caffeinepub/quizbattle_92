import { useState, useEffect, useRef } from "react";
import { useSoundManager } from "./useSoundManager";
import { GamePhase } from "../backend";

interface CountdownTimerResult {
  timeRemaining: number | null;
  timerProgress: number;
}

export function useCountdownTimer(
  phase: string | undefined,
  phaseStartTime: bigint | undefined,
  timeLimit: number,
): CountdownTimerResult {
  const { play } = useSoundManager();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timerProgress, setTimerProgress] = useState(100);
  const lastTickRef = useRef(0);

  useEffect(() => {
    if (!phase || phase !== GamePhase.answering || !phaseStartTime) {
      setTimeRemaining(null);
      setTimerProgress(100);
      lastTickRef.current = 0;
      return;
    }

    const update = () => {
      const phaseStartNs = Number(phaseStartTime);
      const nowNs = Date.now() * 1_000_000;
      const elapsedS = (nowNs - phaseStartNs) / 1_000_000_000;
      const remaining = Math.max(0, timeLimit - elapsedS);

      setTimeRemaining(remaining);
      setTimerProgress(timeLimit > 0 ? (remaining / timeLimit) * 100 : 0);

      const sec = Math.ceil(remaining);
      if (remaining > 0 && remaining <= 5 && sec !== lastTickRef.current) {
        lastTickRef.current = sec;
        play("countdown");
      }
    };

    update();
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, [phase, phaseStartTime, timeLimit, play]);

  return { timeRemaining, timerProgress };
}
