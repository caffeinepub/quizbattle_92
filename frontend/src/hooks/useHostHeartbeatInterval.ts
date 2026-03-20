import { useEffect } from "react";
import { useHostHeartbeat } from "./useQueries";

export function useHostHeartbeatInterval(sessionId: number) {
  const { mutate: heartbeat } = useHostHeartbeat();

  useEffect(() => {
    heartbeat({ sessionId: BigInt(sessionId) });
    const id = setInterval(() => {
      heartbeat({ sessionId: BigInt(sessionId) });
    }, 5_000);
    return () => clearInterval(id);
  }, [sessionId, heartbeat]);
}
