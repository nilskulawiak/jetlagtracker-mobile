import {
  addStationChips,
  completeChallenge,
  createChallenge,
  createStation,
  createTeam,
  deleteChallenge,
  deleteStation,
  deleteTeam,
  failChallenge,
  patchChallenge,
  patchStation,
  patchTeam,
  startChallenge,
  startGame,
} from "@/api/gameApi";
import type {
  CreateChallengeRequest,
  CreateStationRequest,
  CreateTeamRequest,
  PatchChallengeRequest,
  PatchStationRequest,
  PatchTeamRequest,
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
    deleteChallenge: (challengeId: string) =>
      runMutation(() => deleteChallenge(normalizedGameId, challengeId)),
    deleteStation: (stationId: string) =>
      runMutation(() => deleteStation(normalizedGameId, stationId)),
    deleteTeam: (teamId: string) =>
      runMutation(() => deleteTeam(normalizedGameId, teamId)),
    patchChallenge: (challengeId: string, body: PatchChallengeRequest) =>
      runMutation(() => patchChallenge(normalizedGameId, challengeId, body)),
    patchStation: (stationId: string, body: PatchStationRequest) =>
      runMutation(() => patchStation(normalizedGameId, stationId, body)),
    patchTeam: (teamId: string, body: PatchTeamRequest) =>
      runMutation(() => patchTeam(normalizedGameId, teamId, body)),
    startChallenge: (challengeId: string, body: StartChallengeRequest) =>
      runMutation(() => startChallenge(normalizedGameId, challengeId, body)),
    startGame: (body: StartGameRequest) =>
      runMutation(async () => {
        await startGame(normalizedGameId, body);
      }),
  };
}
