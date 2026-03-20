import { useEffect, useCallback } from "react";
import { useAppStore } from "./useAppStore";
import { soundManager, type SoundName } from "../utils/soundManager";

export function useSoundManager() {
  const isMuted = useAppStore((s) => s.isMuted);
  const setMuted = useAppStore((s) => s.setMuted);

  useEffect(() => {
    soundManager.setMuted(isMuted);
  }, [isMuted]);

  const play = useCallback((name: SoundName) => {
    soundManager.play(name);
  }, []);

  const playLoop = useCallback((name: SoundName, intervalMs: number) => {
    soundManager.playLoop(name, intervalMs);
  }, []);

  const stopLoop = useCallback((name: SoundName) => {
    soundManager.stopLoop(name);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(!isMuted);
  }, [isMuted, setMuted]);

  return { play, playLoop, stopLoop, isMuted, toggleMute };
}
