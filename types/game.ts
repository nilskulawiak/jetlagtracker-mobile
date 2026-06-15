export type GameStatus = "CREATED" | "STARTED" | "DONE";

export type ChallengeStatus = "CREATED" | "AVAILABLE" | "DONE";

export type ChallengeType = "CHIPS" | "MULTIPLIER" | "STEAL" | "CALL_YOUR_SHOT";

export type ChallengeAttemptStatus = "IN_PROGRESS" | "SUCCESS" | "FAILED";

export interface GameResponse {
  id: string;
  name: string;
  status: GameStatus;
  createdAt: string;
  mapWidth: number;
  mapHeight: number;
  mapImage: string;
}

export interface GamesResponse {
  gameResponses: GameResponse[];
}

export interface PresetSummaryResponse {
  id: string;
  name: string;
  mapImage: string;
}

export interface CreateTeamRequest {
  name: string;
  color: string;
  startingChips: number | null;
}

export interface StartGameRequest {
  numberOfChallenges: number;
}

export interface CreateGameFromPresetRequest {
  presetId: string;
  name: string;
  teams: CreateTeamRequest[];
}

export interface CreateStationRequest {
  name: string;
  xCoordinate: number;
  yCoordinate: number;
}

export interface CreateChallengeRequest {
  name: string;
  description: string;
  reward: number;
  status: ChallengeStatus;
  challengeType: ChallengeType;
  xCoordinate: number;
  yCoordinate: number;
}

export interface TeamResponse {
  id: string;
  name: string;
  color: string;
  availableChips: number;
}

export interface StationChipStateResponse {
  stationId: string;
  stationName: string;
  teamId: string;
  teamName: string;
  chipsOnStation: number;
  teamAvailableChips: number;
}

export interface StationStateResponse {
  id: string;
  name: string;
  xCoordinate: number;
  yCoordinate: number;
  ownerTeamId: string | null;
  chips: StationChipStateResponse[];
}

export interface ChallengeAttemptResponse {
  teamId: string;
  status: ChallengeAttemptStatus;
}

export interface ChallengeResponse {
  id: string;
  name: string;
  description: string;
  reward: number;
  status: ChallengeStatus;
  challengeType: ChallengeType;
  xCoordinate: number;
  yCoordinate: number;
  challengeAttempts: ChallengeAttemptResponse[];
}

export interface StartChallengeRequest {
  teamId: string;
  callShot?: number;
}

export interface PatchChallengeRequest {
  name?: string;
  description?: string;
  reward?: number;
  status?: ChallengeStatus;
  challengeType?: ChallengeType;
  xCoordinate?: number;
  yCoordinate?: number;
}

export interface PatchTeamRequest {
  name?: string;
  color?: string;
  availableChips?: number;
}

export interface PatchStationRequest {
  name?: string;
  xCoordinate?: number;
  yCoordinate?: number;
}

export interface GameActionResponse {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface GameState {
  game: GameResponse;
  teams: TeamResponse[];
  stations: StationStateResponse[];
  challenges: ChallengeResponse[];
  actions: GameActionResponse[];
}
