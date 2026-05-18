import type { StationStateResponse, TeamResponse } from "@/types/game";

export function getOwnedStationCounts(stations: StationStateResponse[]) {
  const counts = new Map<string, number>();

  for (const station of stations) {
    if (station.ownerTeamId) {
      counts.set(station.ownerTeamId, (counts.get(station.ownerTeamId) ?? 0) + 1);
    }
  }

  return counts;
}

export function getTeamChipTotal(stations: StationStateResponse[], teamId: string) {
  return stations.reduce((sum, station) => {
    const stack = station.chips.find((chipState) => chipState.teamId === teamId);
    return sum + (stack?.chipsOnStation ?? 0);
  }, 0);
}

export function mapTeamsById(teams: TeamResponse[]) {
  return new Map(teams.map((team) => [team.id, team]));
}
