import { useEffect, useState } from "react";

import type { TeamResponse } from "@/types/game";

export function useSelectedTeam(teams: TeamResponse[], initialTeamId = "") {
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId);

  useEffect(() => {
    setSelectedTeamId(initialTeamId);
  }, [initialTeamId]);

  useEffect(() => {
    if (teams.length === 0) {
      setSelectedTeamId("");
      return;
    }

    setSelectedTeamId((currentTeamId) => {
      if (currentTeamId && teams.some((team) => team.id === currentTeamId)) {
        return currentTeamId;
      }

      return initialTeamId && teams.some((team) => team.id === initialTeamId) ? initialTeamId : "";
    });
  }, [initialTeamId, teams]);

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;

  return {
    selectedTeam,
    selectedTeamId,
    setSelectedTeamId,
  };
}
