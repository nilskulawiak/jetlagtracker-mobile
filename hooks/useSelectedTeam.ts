import { useEffect, useState } from "react";

import type { TeamResponse } from "@/types/game";

export function useSelectedTeam(teams: TeamResponse[]) {
  const [selectedTeamId, setSelectedTeamId] = useState("");

  useEffect(() => {
    if (teams.length === 0) {
      setSelectedTeamId("");
      return;
    }

    setSelectedTeamId((currentTeamId) =>
      currentTeamId && teams.some((team) => team.id === currentTeamId)
        ? currentTeamId
        : teams[0].id,
    );
  }, [teams]);

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;

  return {
    selectedTeam,
    selectedTeamId,
    setSelectedTeamId,
  };
}
