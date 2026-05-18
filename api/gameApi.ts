import Constants from "expo-constants";

import type {
  CreateGameFromPresetRequest,
  GameResponse,
  GamesResponse,
  GameState,
  PresetSummaryResponse,
} from "@/types/game";

export const DEFAULT_GAME_ID = "1f0e193e-7543-49ee-bdad-6925925f2813";

function getLanBaseUrl() {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
  const host = hostUri?.split(":")[0];

  return host ? `http://${host}:8080` : "http://localhost:8080";
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? getLanBaseUrl();

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
    throw new Error(detail || `Request failed with ${response.status}`);
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
