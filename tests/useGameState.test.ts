import { act, renderHook, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

import { ApiError, getGameState } from "../api/gameApi";
import { useGameState } from "../hooks/useGameState";
import type { GameState } from "../types/game";

jest.mock("../api/gameApi", () => {
  const actual = jest.requireActual<typeof import("../api/gameApi")>("../api/gameApi");
  return { ...actual, getGameState: jest.fn() };
});

const mockedGetGameState = getGameState as jest.Mock;

const mockGameState: GameState = {
  game: {
    id: "g1",
    name: "Test Game",
    status: "STARTED",
    createdAt: "2024-01-01T00:00:00Z",
    mapWidth: 1000,
    mapHeight: 1000,
    mapImage: "map.png",
  },
  teams: [],
  stations: [],
  challenges: [],
  actions: [],
};

beforeEach(() => {
  mockedGetGameState.mockReset();
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

describe("useGameState", () => {
  test("starts with isLoading true and no game state", async () => {
    mockedGetGameState.mockReturnValue(new Promise(() => {}));

    const { result } = await renderHook(() => useGameState("g1"));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.gameState).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test("sets gameState and clears isLoading after a successful fetch", async () => {
    mockedGetGameState.mockResolvedValue(mockGameState);

    const { result } = await renderHook(() => useGameState("g1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.gameState).toEqual(mockGameState);
    expect(result.current.error).toBeNull();
  });

  test("normalizes null arrays from the backend to empty arrays", async () => {
    mockedGetGameState.mockResolvedValue({
      ...mockGameState,
      teams: null,
      challenges: null,
      actions: null,
      stations: null,
    });

    const { result } = await renderHook(() => useGameState("g1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.gameState?.teams).toEqual([]);
    expect(result.current.gameState?.challenges).toEqual([]);
    expect(result.current.gameState?.actions).toEqual([]);
    expect(result.current.gameState?.stations).toEqual([]);
  });

  test("sets error and clears isLoading when fetch fails", async () => {
    mockedGetGameState.mockRejectedValue(new Error("Network error"));

    const { result } = await renderHook(() => useGameState("g1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe(
      "Could not load game state. Check the backend URL and game id.",
    );
    expect(result.current.gameState).toBeNull();
  });

  test("sets error immediately when gameId is empty without calling the API", async () => {
    const { result } = await renderHook(() => useGameState(""));

    await waitFor(() => expect(result.current.error).toBe("Enter a game id."));
    expect(mockedGetGameState).not.toHaveBeenCalled();
  });

  test("runMutation sets isMutating to true during the action", async () => {
    mockedGetGameState.mockResolvedValue(mockGameState);

    const { result } = await renderHook(() => useGameState("g1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let resolveMutation!: () => void;
    const pendingAction = new Promise<void>((resolve) => {
      resolveMutation = resolve;
    });

    await act(async () => {
      void result.current.runMutation(() => pendingAction);
    });

    expect(result.current.isMutating).toBe(true);

    await act(async () => {
      resolveMutation();
    });

    await waitFor(() => expect(result.current.isMutating).toBe(false));
  });

  test("runMutation reloads game state after a successful action", async () => {
    const updatedState: GameState = {
      ...mockGameState,
      teams: [{ id: "t1", name: "Team A", color: "#ff0000", availableChips: 5 }],
    };

    mockedGetGameState
      .mockResolvedValueOnce(mockGameState)
      .mockResolvedValueOnce(updatedState);

    const { result } = await renderHook(() => useGameState("g1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.runMutation(async () => {});
    });

    expect(result.current.gameState?.teams).toEqual(updatedState.teams);
    expect(mockedGetGameState).toHaveBeenCalledTimes(2);
  });

  test("runMutation sets mutationError with backend message on ApiError", async () => {
    mockedGetGameState.mockResolvedValue(mockGameState);

    const { result } = await renderHook(() => useGameState("g1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.runMutation(async () => {
        throw new ApiError("Not enough chips", 400);
      });
    });

    expect(result.current.mutationError).toBe("Not enough chips");
    expect(result.current.isMutating).toBe(false);
  });

  test("runMutation sets generic mutationError on non-ApiError", async () => {
    mockedGetGameState.mockResolvedValue(mockGameState);

    const { result } = await renderHook(() => useGameState("g1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.runMutation(async () => {
        throw new Error("Network error");
      });
    });

    expect(result.current.mutationError).toBe(
      "The backend rejected the action. Check the current team, station, or challenge.",
    );
  });
});
