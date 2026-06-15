import Constants from "expo-constants";

import type {
  CreateGameFromPresetRequest,
  CreateGameRequest,
  CreateChallengeRequest,
  CreateStationRequest,
  CreateTeamRequest,
  GameResponse,
  GamesResponse,
  GameState,
  PatchChallengeRequest,
  PatchStationRequest,
  PatchTeamRequest,
  PresetSummaryResponse,
  StartChallengeRequest,
  StartGameRequest,
} from "@/types/game";

function getLanBaseUrl() {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
  const host = hostUri?.split(":")[0];

  return host ? `http://${host}:8080` : "http://localhost:8080";
}

export const DEFAULT_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? getLanBaseUrl();

let apiBaseUrl = DEFAULT_API_BASE_URL;

export function getApiBaseUrl() {
  return apiBaseUrl;
}

export function setApiBaseUrl(url: string) {
  apiBaseUrl = url.replace(/\/$/, "");
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
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

export function createGame(body: CreateGameRequest) {
  return request<GameResponse>("/games", {
    body: JSON.stringify(body),
    method: "POST",
  });
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

export function startChallenge(
  gameId: string,
  challengeId: string,
  body: StartChallengeRequest,
) {
  return request<void>(`/games/${gameId}/challenges/${challengeId}/start`, {
    body: JSON.stringify(body),
    method: "POST",
  });
}

export function deleteChallenge(gameId: string, challengeId: string) {
  return request<void>(`/games/${gameId}/challenges/${challengeId}`, {
    method: "DELETE",
  });
}

export function patchChallenge(
  gameId: string,
  challengeId: string,
  body: PatchChallengeRequest,
) {
  return request<void>(`/games/${gameId}/challenges/${challengeId}`, {
    body: JSON.stringify(body),
    method: "PATCH",
  });
}

export function deleteTeam(gameId: string, teamId: string) {
  return request<void>(`/games/${gameId}/teams/${teamId}`, {
    method: "DELETE",
  });
}

export function patchTeam(gameId: string, teamId: string, body: PatchTeamRequest) {
  return request<void>(`/games/${gameId}/teams/${teamId}`, {
    body: JSON.stringify(body),
    method: "PATCH",
  });
}

export function deleteStation(gameId: string, stationId: string) {
  return request<void>(`/games/${gameId}/stations/${stationId}`, {
    method: "DELETE",
  });
}

export function patchStation(gameId: string, stationId: string, body: PatchStationRequest) {
  return request<void>(`/games/${gameId}/stations/${stationId}`, {
    body: JSON.stringify(body),
    method: "PATCH",
  });
}
