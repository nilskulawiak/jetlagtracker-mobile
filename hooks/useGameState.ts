import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

import { ApiError, DEFAULT_GAME_ID, getGameState } from "@/api/gameApi";
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

export function useGameState(initialGameId = DEFAULT_GAME_ID) {
  const [gameId, setGameId] = useState(initialGameId);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const loadGameState = useCallback(async () => {
    if (!gameId.trim()) {
      setError("Enter a game id.");
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      setMutationError(null);
      const data = await getGameState(gameId.trim());
      setGameState(normalizeGameState(data));
    } catch (nextError) {
      console.error(nextError);
      setError("Could not load game state. Check the backend URL and game id.");
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    void loadGameState();
  }, [loadGameState]);

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
    setGameId,
  };
}
