import { useState } from "react";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";

import { Inspector } from "@/components/Inspector/Inspector";
import { MapLegend } from "@/components/Map/MapLegend";
import { MapViewport } from "@/components/Map/MapViewport";
import { styles } from "@/components/Shared/styles";
import type { ChallengeResponse, GameState, StationStateResponse, TeamResponse } from "@/types/game";
import { colors, getChallengeStatusColor, isChallengeVisible } from "@/utils/colors";
import { mapTeamsById } from "@/utils/gameSelectors";
import type { MapSelectableItem } from "@/utils/mapSelection";

export function MapScreen({
  challenges,
  gameState,
  isMutating,
  onAddStationChips,
  onCompleteChallenge,
  onFailChallenge,
  onHoverChange,
  onSelectChallenge,
  onSelectStation,
  selectedChallengeId,
  selectedStationId,
  selectedTeamId,
  setupPanel,
  stations,
  teams,
}: {
  challenges: ChallengeResponse[];
  gameState: GameState;
  isMutating: boolean;
  onAddStationChips: (stationId: string, body: { chips: number; teamId: string }) => Promise<void>;
  onCompleteChallenge: (challengeId: string, body: { teamId: string }) => Promise<void>;
  onFailChallenge: (challengeId: string, body: { teamId: string }) => Promise<void>;
  onHoverChange: (isHovered: boolean) => void;
  onSelectChallenge: (challengeId: string) => void;
  onSelectStation: (stationId: string) => void;
  selectedChallengeId: string | null;
  selectedStationId: string | null;
  selectedTeamId: string;
  setupPanel?: ReactNode;
  stations: StationStateResponse[];
  teams: TeamResponse[];
}) {
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 900;
  const [nearbyItems, setNearbyItems] = useState<MapSelectableItem[]>([]);
  const teamsById = mapTeamsById(teams);
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
  const handleSelectChallenge = (challengeId: string, shouldClearNearbyItems = true) => {
    if (shouldClearNearbyItems) setNearbyItems([]);
    onSelectChallenge(challengeId);
  };

  const handleSelectStation = (stationId: string, shouldClearNearbyItems = true) => {
    if (shouldClearNearbyItems) setNearbyItems([]);
    onSelectStation(stationId);
  };

  const selectMapItem = (item: MapSelectableItem, shouldClearNearbyItems = true) => {
    if (item.kind === "station") {
      handleSelectStation(item.id, shouldClearNearbyItems);
      return;
    }

    handleSelectChallenge(item.id, shouldClearNearbyItems);
  };

  const handleSelectMapItems = (items: MapSelectableItem[]) => {
    if (items.length === 0) {
      setNearbyItems([]);
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

  const inspector = (
    <Inspector
      challenge={selectedChallenge}
      isMutating={isMutating}
      onAddStationChips={onAddStationChips}
      onCompleteChallenge={onCompleteChallenge}
      onFailChallenge={onFailChallenge}
      selectedTeamId={selectedTeamId}
      station={selectedStation}
      teams={teams}
      teamsById={teamsById}
    />
  );

  return (
    <View style={[styles.mapWorkspace, isWideLayout && styles.mapWorkspaceWide]}>
      <View style={styles.mapMainPane}>
        <View style={styles.mapLegendSlot}>
          <MapLegend teams={teams} />
        </View>

        <View style={styles.mapViewportSlot}>
          <MapViewport
            challenges={challenges}
            gameState={gameState}
            onHoverChange={onHoverChange}
            onSelectMapItems={handleSelectMapItems}
            selectedChallengeId={selectedChallengeId}
            selectedStationId={selectedStationId}
            stations={stations}
            teamsById={teamsById}
          />
        </View>
      </View>

      <View
        style={[
          styles.mapInspectorShell,
          isWideLayout ? styles.mapInspectorShellWide : styles.mapInspectorShellCompact,
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.mapInspectorContent}
          showsVerticalScrollIndicator={isWideLayout}
          style={styles.mapInspectorScroller}
        >
          {setupPanel}
          {nearbyItems.length > 1 ? (
            <View style={styles.stationPickerPanel}>
              <Text style={styles.stationPickerTitle}>Nearby items</Text>
              {nearbyItems.map((item) => {
                const station =
                  item.kind === "station"
                    ? stations.find((nextStation) => nextStation.id === item.id)
                    : null;
                const owner = station?.ownerTeamId ? teamsById.get(station.ownerTeamId) : undefined;
                const isSelected =
                  (item.kind === "station" && selectedStationId === item.id) ||
                  (item.kind === "challenge" && selectedChallengeId === item.id);

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    key={`${item.kind}-${item.id}`}
                    onPress={() => selectMapItem(item, false)}
                    style={[
                      styles.stationPickerOption,
                      isSelected && styles.stationPickerOptionSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.legendDot,
                        {
                          backgroundColor:
                            item.kind === "station"
                              ? owner?.color ?? colors.stationEmpty
                              : getChallengeStatusColor(item.status ?? ""),
                        },
                      ]}
                    />
                    <Text numberOfLines={1} style={styles.stationPickerOptionText}>
                      {item.kind === "challenge" && item.rewardChips
                        ? `${item.name} - ${item.rewardChips} chips`
                        : item.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          {inspector}
        </ScrollView>
      </View>
    </View>
  );
}
