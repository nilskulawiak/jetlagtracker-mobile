import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";

import { ApiError, getGameState } from "@/api/gameApi";
import type { GameState } from "@/types/game";

function normalizeGameState(data: GameState): GameState {
  return {
    ...data,
    actions: data.actions ?? [],
    challenges: data.challenges ?? [],
    stations: (data.stations ?? []).map((station) => ({
      ...station,
      chips: station.chips ?? [],
    })),
    teams: data.teams ?? [],
  };
}

const POLL_INTERVAL_MS = 5_000;

export function useGameState(initialGameId = "") {
  const [gameId, setGameId] = useState(initialGameId);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const loadAbortControllerRef = useRef<AbortController | null>(null);

  const loadGameState = useCallback(async (silent = false) => {
    if (!gameId.trim()) {
      setError("Enter a game id.");
      setIsLoading(false);
      return;
    }

    loadAbortControllerRef.current?.abort();
    const controller = new AbortController();
    loadAbortControllerRef.current = controller;

    try {
      if (!silent) {
        setError(null);
        setMutationError(null);
      }
      const data = await getGameState(gameId.trim(), controller.signal);
      setGameState(normalizeGameState(data));
      if (silent) setError(null);
    } catch (nextError) {
      if ((nextError as Error)?.name === "AbortError") return;
      console.error(nextError);
      if (!silent) setError("Could not load game state. Check the backend URL and game id.");
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    void loadGameState();
  }, [loadGameState]);

  useEffect(() => {
    const id = setInterval(() => {
      void loadGameState(true);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loadGameState]);

  useEffect(() => {
    return () => {
      loadAbortControllerRef.current?.abort();
    };
  }, []);

  const reload = useCallback(() => {
    setIsLoading(true);
    void loadGameState();
  }, [loadGameState]);

  const runMutation = useCallback(
    async (action: () => Promise<void>) => {
      try {
        setIsMutating(true);
        setMutationError(null);
        await action();
        await loadGameState();
      } catch (nextError) {
        console.error(nextError);
        const message =
          nextError instanceof ApiError
            ? nextError.message
            : "The backend rejected the action. Check the current team, station, or challenge.";
        setMutationError(message);
        if (Platform.OS !== "web") {
          Alert.alert("Action failed", message);
        }
      } finally {
        setIsMutating(false);
      }
    },
    [loadGameState],
  );

  return {
    error,
    gameId,
    gameState,
    isLoading,
    isMutating,
    loadGameState,
    mutationError,
    reload,
    runMutation,
  };
}
