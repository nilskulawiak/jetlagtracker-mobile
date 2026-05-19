import { useState } from "react";
import type { ReactNode } from "react";

import type { ChallengeResponse, GameState, StationStateResponse, TeamResponse } from "@/types/game";
import { isChallengeVisible } from "@/utils/colors";
import type { MapSelectableItem } from "@/utils/mapSelection";

export function useMapSelection({
  challenges,
  gameState,
  onClearSelection,
  onSelectChallenge,
  onSelectStation,
  selectedChallengeId,
  selectedStationId,
  setupPanel,
  stations,
  teamsById,
}: {
  challenges: ChallengeResponse[];
  gameState: GameState;
  onClearSelection: () => void;
  onSelectChallenge: (challengeId: string) => void;
  onSelectStation: (stationId: string) => void;
  selectedChallengeId: string | null;
  selectedStationId: string | null;
  setupPanel?: ReactNode;
  stations: StationStateResponse[];
  teamsById: Map<string, TeamResponse>;
}) {
  const [nearbyItems, setNearbyItems] = useState<MapSelectableItem[]>([]);
  const [isInspectorExpanded, setIsInspectorExpanded] = useState(false);
  const selectedStation = selectedStationId
    ? stations.find((station) => station.id === selectedStationId) ?? null
    : null;
  const selectedChallenge = selectedChallengeId
    ? challenges.find(
        (challenge) =>
          challenge.id === selectedChallengeId &&
          (gameState.game.status === "CREATED" || isChallengeVisible(challenge.status)),
      ) ?? null
    : null;

  const selectChallenge = (challengeId: string, shouldClearNearbyItems = true) => {
    if (shouldClearNearbyItems) setNearbyItems([]);
    onSelectChallenge(challengeId);
  };

  const selectStation = (stationId: string, shouldClearNearbyItems = true) => {
    if (shouldClearNearbyItems) setNearbyItems([]);
    onSelectStation(stationId);
  };

  const selectMapItem = (item: MapSelectableItem, shouldClearNearbyItems = true) => {
    if (item.kind === "station") {
      selectStation(item.id, shouldClearNearbyItems);
      return;
    }

    selectChallenge(item.id, shouldClearNearbyItems);
  };

  const handleSelectMapItems = (items: MapSelectableItem[]) => {
    if (items.length === 0) {
      setNearbyItems([]);
      setIsInspectorExpanded(false);
      onClearSelection();
      return;
    }

    if (items.length === 1) {
      setNearbyItems([]);
      selectMapItem(items[0]);
      return;
    }

    setNearbyItems(items);
    selectMapItem(items[0], false);
  };

  const mobileSheetTitle = setupPanel
    ? "Game setup"
    : selectedStation?.name ?? selectedChallenge?.name ?? (nearbyItems.length > 1 ? "Nearby items" : "Map selection");
  const mobileSheetSubtitle = setupPanel
    ? gameState.game.status
    : selectedStation
      ? teamsById.get(selectedStation.ownerTeamId ?? "")?.name ?? "Unclaimed"
      : selectedChallenge
        ? `${selectedChallenge.rewardChips} chips`
        : nearbyItems.length > 1
          ? `${nearbyItems.length} nearby`
          : "Tap a marker";
  const showMobileSheet = Boolean(setupPanel || selectedStation || selectedChallenge || nearbyItems.length > 1);

  return {
    handleSelectMapItems,
    isInspectorExpanded,
    mobileSheetSubtitle,
    mobileSheetTitle,
    nearbyItems,
    selectedChallenge,
    selectedStation,
    selectNearbyItem: (item: MapSelectableItem) => selectMapItem(item, false),
    setIsInspectorExpanded,
    showMobileSheet,
  };
}
