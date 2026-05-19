import { useState } from "react";

export function useGameSelection() {
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  const selectStation = (stationId: string) => {
    setSelectedStationId(stationId);
    setSelectedChallengeId(null);
  };

  const selectChallenge = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
    setSelectedStationId(null);
  };

  const clearMapSelection = () => {
    setSelectedChallengeId(null);
    setSelectedStationId(null);
  };

  return {
    clearMapSelection,
    selectChallenge,
    selectedChallengeId,
    selectedStationId,
    selectStation,
  };
}
