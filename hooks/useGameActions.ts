import {
  addStationChips,
  completeChallenge,
  createChallenge,
  createStation,
  createTeam,
  failChallenge,
  startChallenge,
  startGame,
} from "@/api/gameApi";
import type {
  CreateChallengeRequest,
  CreateStationRequest,
  CreateTeamRequest,
  StartChallengeRequest,
  StartGameRequest,
} from "@/types/game";

export function useGameActions({
  gameId,
  runMutation,
}: {
  gameId: string;
  runMutation: (action: () => Promise<void>) => Promise<void>;
}) {
  const normalizedGameId = gameId.trim();

  return {
    addStationChips: (stationId: string, body: { chips: number; teamId: string }) =>
      runMutation(() => addStationChips(normalizedGameId, stationId, body)),
    completeChallenge: (challengeId: string, body: { teamId: string }) =>
      runMutation(() => completeChallenge(normalizedGameId, challengeId, body)),
    createChallenge: (body: CreateChallengeRequest) =>
      runMutation(() => createChallenge(normalizedGameId, body)),
    createStation: (body: CreateStationRequest) =>
      runMutation(() => createStation(normalizedGameId, body)),
    createTeam: (body: CreateTeamRequest) =>
      runMutation(() => createTeam(normalizedGameId, body)),
    failChallenge: (challengeId: string, body: { teamId: string }) =>
      runMutation(() => failChallenge(normalizedGameId, challengeId, body)),
    startChallenge: (challengeId: string, body: StartChallengeRequest) =>
      runMutation(() => startChallenge(normalizedGameId, challengeId, body)),
    startGame: (body: StartGameRequest) =>
      runMutation(async () => {
        await startGame(normalizedGameId, body);
      }),
  };
}
