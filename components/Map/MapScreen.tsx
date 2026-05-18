import { ScrollView, useWindowDimensions, View } from "react-native";

import { Inspector } from "@/components/Inspector/Inspector";
import { MapLegend } from "@/components/Map/MapLegend";
import { MapViewport } from "@/components/Map/MapViewport";
import { styles } from "@/components/Shared/styles";
import type { ChallengeResponse, GameState, StationStateResponse, TeamResponse } from "@/types/game";
import { isChallengeVisible } from "@/utils/colors";
import { mapTeamsById } from "@/utils/gameSelectors";

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
  stations: StationStateResponse[];
  teams: TeamResponse[];
}) {
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 900;
  const teamsById = mapTeamsById(teams);
  const selectedStation = selectedStationId
    ? stations.find((station) => station.id === selectedStationId) ?? null
    : null;
  const selectedChallenge = selectedChallengeId
    ? challenges.find((challenge) => challenge.id === selectedChallengeId && isChallengeVisible(challenge.status)) ?? null
    : null;

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
            onSelectChallenge={onSelectChallenge}
            onSelectStation={onSelectStation}
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
          {inspector}
        </ScrollView>
      </View>
    </View>
  );
}
