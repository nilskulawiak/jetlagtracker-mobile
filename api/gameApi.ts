import Constants from "expo-constants";

import type {
  CreateGameFromPresetRequest,
  CreateChallengeRequest,
  CreateStationRequest,
  CreateTeamRequest,
  GameResponse,
  GamesResponse,
  GameState,
  PresetSummaryResponse,
  StartGameRequest,
} from "@/types/game";

function getLanBaseUrl() {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
  const host = hostUri?.split(":")[0];

  return host ? `http://${host}:8080` : "http://localhost:8080";
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? getLanBaseUrl();

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new ApiError(detail || `Request failed with ${response.status}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getGameState(gameId: string) {
  return request<GameState>(`/games/${gameId}/state`);
}

export function getGames() {
  return request<GamesResponse>("/games");
}

export function getPresets() {
  return request<PresetSummaryResponse[]>("/preset");
}

export function createGameFromPreset(body: CreateGameFromPresetRequest) {
  return request<GameResponse>("/games/from-preset", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

export function startGame(gameId: string, body: StartGameRequest) {
  return request<GameResponse>(`/games/${gameId}/start`, {
    body: JSON.stringify(body),
    method: "POST",
  });
}

export function createTeam(gameId: string, body: CreateTeamRequest) {
  return request<void>(`/games/${gameId}/teams`, {
    body: JSON.stringify(body),
    method: "POST",
  });
}

export function createStation(gameId: string, body: CreateStationRequest) {
  return request<void>(`/games/${gameId}/stations`, {
    body: JSON.stringify(body),
    method: "POST",
  });
}

export function createChallenge(gameId: string, body: CreateChallengeRequest) {
  return request<void>(`/games/${gameId}/challenges`, {
    body: JSON.stringify(body),
    method: "POST",
  });
}

export function addStationChips(
  gameId: string,
  stationId: string,
  body: { chips: number; teamId: string },
) {
  return request<void>(`/games/${gameId}/stations/${stationId}/chips`, {
    body: JSON.stringify(body),
    method: "POST",
  });
}

export function completeChallenge(
  gameId: string,
  challengeId: string,
  body: { teamId: string },
) {
  return request<void>(`/games/${gameId}/challenges/${challengeId}/complete`, {
    body: JSON.stringify(body),
    method: "POST",
  });
}

export function failChallenge(
  gameId: string,
  challengeId: string,
  body: { teamId: string },
) {
  return request<void>(`/games/${gameId}/challenges/${challengeId}/fail`, {
    body: JSON.stringify(body),
    method: "POST",
  });
}
