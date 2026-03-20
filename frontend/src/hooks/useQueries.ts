import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";
import { GamePhase } from "../backend";

export function useProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["profile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.getProfile();
      return result ?? null;
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSetProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.setProfile(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile", identity?.getPrincipal().toString()],
      });
    },
  });
}

export function useQuizzes() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["quizzes", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.getQuizzes();
    },
    enabled: !!actor && !!identity,
  });
}

export function useQuiz(quizId: bigint | null) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["quiz", quizId?.toString(), identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (quizId === null) throw new Error("Quiz ID required");
      const result = await actor.getQuiz(quizId);
      return result ?? null;
    },
    enabled: !!actor && !!identity && quizId !== null,
  });
}

export function useCreateQuiz() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({
      title,
      questions,
    }: {
      title: string;
      questions: Parameters<NonNullable<typeof actor>["createQuiz"]>[1];
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.createQuiz(title, questions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["quizzes", identity?.getPrincipal().toString()],
      });
    },
  });
}

export function useUpdateQuiz() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({
      quizId,
      title,
      questions,
    }: {
      quizId: bigint;
      title: string;
      questions: Parameters<NonNullable<typeof actor>["updateQuiz"]>[2];
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.updateQuiz(quizId, title, questions);
    },
    onSuccess: (_data, variables) => {
      const principal = identity?.getPrincipal().toString();
      queryClient.invalidateQueries({
        queryKey: ["quizzes", principal],
      });
      queryClient.invalidateQueries({
        queryKey: ["quiz", variables.quizId.toString(), principal],
      });
    },
  });
}

export function useDeleteQuiz() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({ quizId }: { quizId: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.deleteQuiz(quizId);
    },
    onSuccess: (_data, variables) => {
      const principal = identity?.getPrincipal().toString();
      queryClient.invalidateQueries({
        queryKey: ["quizzes", principal],
      });
      queryClient.removeQueries({
        queryKey: ["quiz", variables.quizId.toString(), principal],
      });
    },
  });
}

export function useCheckRoomPin() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (roomPin: string) => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.checkRoomPin(roomPin);
    },
  });
}

export function useJoinSession() {
  const { actor } = useActor();

  const mutation = useMutation({
    mutationFn: async ({
      roomPin,
      displayName,
    }: {
      roomPin: string;
      displayName: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.joinSession(roomPin, displayName);
    },
  });

  return { ...mutation, isActorReady: !!actor };
}

export function useCreateSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ quizId }: { quizId: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.createSession(quizId);
    },
  });
}

export function useSessionState(sessionId: number | null) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (sessionId === null) throw new Error("Session ID required");
      return await actor.getSessionState(BigInt(sessionId));
    },
    enabled: !!actor && sessionId !== null,
    refetchInterval: (query) => {
      const phase = query.state.data?.currentPhase;
      if (phase === GamePhase.ended) {
        return false;
      }
      if (
        phase &&
        (phase === GamePhase.questionDisplay ||
          phase === GamePhase.answering ||
          phase === GamePhase.results ||
          phase === GamePhase.scoreboard)
      ) {
        return 1000;
      }
      return 2000;
    },
  });
}

export function useRemovePlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      playerId,
    }: {
      sessionId: bigint;
      playerId: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.removePlayer(sessionId, playerId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["session", Number(variables.sessionId)],
      });
    },
  });
}

export function useLockSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      locked,
    }: {
      sessionId: bigint;
      locked: boolean;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.lockSession(sessionId, locked);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["session", Number(variables.sessionId)],
      });
    },
  });
}

export function useStartGame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId }: { sessionId: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.startGame(sessionId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["session", Number(variables.sessionId)],
      });
    },
  });
}

export function usePlayerState(
  roomPin: string | null,
  playerToken: string | null,
) {
  const { actor } = useActor();

  const enabled = !!actor && !!roomPin && playerToken !== null;

  return useQuery({
    queryKey: ["playerState", roomPin, playerToken],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (!roomPin || playerToken === null)
        throw new Error("Room PIN and player token required");
      return await actor.getPlayerState(roomPin, BigInt(playerToken));
    },
    enabled,
    // Keep last successful data when query errors (e.g., PIN removed after game ends)
    placeholderData: (previousData) => previousData,
    refetchInterval: (query) => {
      // Stop polling if query errored and has no previous data to preserve
      if (query.state.status === "error" && !query.state.data) {
        return false;
      }
      const phase = query.state.data?.currentPhase;
      // Stop polling once game has ended or is on podium
      if (phase === GamePhase.ended || phase === GamePhase.podium) {
        return false;
      }
      if (
        phase &&
        (phase === GamePhase.questionDisplay ||
          phase === GamePhase.answering ||
          phase === GamePhase.results ||
          phase === GamePhase.scoreboard)
      ) {
        return 1000;
      }
      return 2000;
    },
    // Don't retry when game has ended (PIN is removed from backend)
    retry: (failureCount, error) => {
      if (error?.message?.includes("No active session")) return false;
      return failureCount < 3;
    },
  });
}

export function useUpdatePlayerName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomPin,
      playerToken,
      newName,
    }: {
      roomPin: string;
      playerToken: bigint;
      newName: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.updatePlayerName(roomPin, playerToken, newName);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["playerState", variables.roomPin],
      });
    },
  });
}

export function useAdvancePhase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId }: { sessionId: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.advancePhase(sessionId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["session", Number(variables.sessionId)],
      });
    },
  });
}

import { type AnswerSubmission } from "../backend";
export type { AnswerSubmission };

export function useSubmitAnswer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomPin,
      playerToken,
      answer,
    }: {
      roomPin: string;
      playerToken: bigint;
      answer: AnswerSubmission;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.submitAnswer(roomPin, playerToken, answer);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["playerState", variables.roomPin],
      });
    },
  });
}

export function useQuestionResults(
  sessionId: number | null,
  questionIndex: number | null,
) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["questionResults", sessionId, questionIndex],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (sessionId === null || questionIndex === null)
        throw new Error("Session ID and question index required");
      return await actor.getQuestionResults(
        BigInt(sessionId),
        BigInt(questionIndex),
      );
    },
    enabled: !!actor && sessionId !== null && questionIndex !== null,
  });
}

export function usePlayerQuestionResults(
  roomPin: string | null,
  playerToken: string | null,
  questionIndex: number | null,
) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["playerQuestionResults", roomPin, playerToken, questionIndex],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (!roomPin || playerToken === null || questionIndex === null)
        throw new Error("Room PIN, player token, and question index required");
      return await actor.getPlayerQuestionResults(
        roomPin,
        BigInt(playerToken),
        BigInt(questionIndex),
      );
    },
    enabled:
      !!actor && !!roomPin && playerToken !== null && questionIndex !== null,
  });
}

export function useLeaderboard(sessionId: number | null, enabled: boolean) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["leaderboard", sessionId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (sessionId === null) throw new Error("Session ID required");
      return await actor.getLeaderboard(BigInt(sessionId));
    },
    enabled: !!actor && sessionId !== null && enabled,
  });
}

export function useStreaks(sessionId: number | null, enabled: boolean) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["streaks", sessionId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (sessionId === null) throw new Error("Session ID required");
      return await actor.getStreaks(BigInt(sessionId));
    },
    enabled: !!actor && sessionId !== null && enabled,
  });
}

export function usePlayerLeaderboard(
  roomPin: string | null,
  playerToken: string | null,
  enabled: boolean,
) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["playerLeaderboard", roomPin, playerToken],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (!roomPin || playerToken === null)
        throw new Error("Room PIN and player token required");
      return await actor.getPlayerLeaderboard(roomPin, BigInt(playerToken));
    },
    enabled: !!actor && !!roomPin && playerToken !== null && enabled,
  });
}

export function usePlayerStreaks(
  roomPin: string | null,
  playerToken: string | null,
  enabled: boolean,
) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["playerStreaks", roomPin, playerToken],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (!roomPin || playerToken === null)
        throw new Error("Room PIN and player token required");
      return await actor.getPlayerStreaks(roomPin, BigInt(playerToken));
    },
    enabled: !!actor && !!roomPin && playerToken !== null && enabled,
  });
}

export function useEndSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId }: { sessionId: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.endSession(sessionId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["session", Number(variables.sessionId)],
      });
    },
  });
}

export function usePostGameSummary(sessionId: number | null, enabled: boolean) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["postGameSummary", sessionId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (sessionId === null) throw new Error("Session ID required");
      return await actor.getPostGameSummary(BigInt(sessionId));
    },
    enabled: !!actor && sessionId !== null && enabled,
  });
}

export function useHostHeartbeat() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ sessionId }: { sessionId: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.hostHeartbeat(sessionId);
    },
  });
}

export function useSetAutoAdvance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      enabled,
    }: {
      sessionId: bigint;
      enabled: boolean;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.setAutoAdvance(sessionId, enabled);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["session", Number(variables.sessionId)],
      });
    },
  });
}

export function useReports() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["reports", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.getReports();
    },
    enabled: !!actor && !!identity,
  });
}

export function useReport(reportId: bigint | null) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: [
      "report",
      reportId?.toString(),
      identity?.getPrincipal().toString(),
    ],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (reportId === null) throw new Error("Report ID required");
      const result = await actor.getReport(reportId);
      return result ?? null;
    },
    enabled: !!actor && !!identity && reportId !== null,
  });
}

export function useDeleteReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({ reportId }: { reportId: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.deleteReport(reportId);
    },
    onSuccess: (_data, variables) => {
      const principal = identity?.getPrincipal().toString();
      queryClient.invalidateQueries({
        queryKey: ["reports", principal],
      });
      queryClient.removeQueries({
        queryKey: ["report", variables.reportId.toString(), principal],
      });
    },
  });
}
