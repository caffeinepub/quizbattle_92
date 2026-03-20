import { useState, useCallback } from "react";

const STORAGE_KEY = "quizbattle-player-session";

export interface PlayerSession {
  playerToken: string;
  roomPin: string;
  displayName: string;
}

function loadSession(): PlayerSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.playerToken === "string" &&
      typeof parsed.roomPin === "string" &&
      typeof parsed.displayName === "string"
    ) {
      return parsed as PlayerSession;
    }
    return null;
  } catch {
    return null;
  }
}

export function usePlayerSession() {
  const [session, setSessionState] = useState<PlayerSession | null>(
    loadSession,
  );

  const setSession = useCallback((s: PlayerSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    setSessionState(s);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSessionState(null);
  }, []);

  return { session, setSession, clearSession };
}
