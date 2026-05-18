export interface GameResponse {
  id: string;
  name: string;
  status: string;
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

export interface CreateGameFromPresetRequest {
  presetId: string;
  name: string;
  teams: CreateTeamRequest[];
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

export interface ChallengeResponse {
  id: string;
  name: string;
  description: string;
  rewardChips: number;
  status: string;
  xCoordinate: number;
  yCoordinate: number;
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
