import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import type { ReactNode } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";

import { Inspector } from "@/components/Inspector/Inspector";
import { DesktopMapSidebar } from "@/components/Map/DesktopMapSidebar";
import { mapStyles } from "@/components/Map/mapStyles";
import { MapLegend } from "@/components/Map/MapLegend";
import { MobileMapInspectorSheet } from "@/components/Map/MobileMapInspectorSheet";
import { MapViewport } from "@/components/Map/MapViewport";
import { useMapSelection } from "@/components/Map/useMapSelection";
import type {
  ChallengeResponse,
  GameActionResponse,
  GameState,
  StationStateResponse,
  TeamResponse,
} from "@/types/game";
import { colors } from "@/utils/colors";
import { mapTeamsById } from "@/utils/gameSelectors";

export function MapScreen({
  actions,
  challenges,
  gameState,
  isMutating,
  onAddStationChips,
  onCompleteChallenge,
  onFailChallenge,
  onHoverChange,
  onClearSelection,
  onSelectChallenge,
  onSelectStation,
  selectedChallengeId,
  selectedStationId,
  selectedTeamId,
  setupPanel,
  stations,
  teams,
}: {
  actions: GameActionResponse[];
  challenges: ChallengeResponse[];
  gameState: GameState;
  isMutating: boolean;
  onAddStationChips: (stationId: string, body: { chips: number; teamId: string }) => Promise<void>;
  onCompleteChallenge: (challengeId: string, body: { teamId: string }) => Promise<void>;
  onFailChallenge: (challengeId: string, body: { teamId: string }) => Promise<void>;
  onClearSelection: () => void;
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
  const isMobileLayout = width < 700;
  const [isLegendVisible, setIsLegendVisible] = useState(false);
  const teamsById = mapTeamsById(teams);
  const {
    handleSelectMapItems,
    isInspectorExpanded,
    mobileSheetSubtitle,
    mobileSheetTitle,
    nearbyItems,
    selectedChallenge,
    selectedStation,
    selectNearbyItem,
    setIsInspectorExpanded,
    showMobileSheet,
  } = useMapSelection({
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
  });

  const renderInspector = (hideHeader = false) => (
    <Inspector
      challenge={selectedChallenge}
      hideHeader={hideHeader}
      isMutating={isMutating}
      onAddStationChips={onAddStationChips}
      onCompleteChallenge={onCompleteChallenge}
      onFailChallenge={onFailChallenge}
      selectedTeamId={selectedTeamId}
      station={selectedStation}
      subtleEmpty={isWideLayout}
      teams={teams}
      teamsById={teamsById}
    />
  );
  return (
    <View style={[mapStyles.workspace, isWideLayout && mapStyles.workspaceWide, isMobileLayout && mapStyles.mobileWorkspace]}>
      <View style={[mapStyles.mainPane, isMobileLayout && mapStyles.mobileMainPane]}>
        <View style={mapStyles.viewportSlot}>
          <MapViewport
            challenges={challenges}
            gameState={gameState}
            onHoverChange={onHoverChange}
            onSelectMapItems={handleSelectMapItems}
            selectedChallengeId={selectedChallengeId}
            selectedStationId={selectedStationId}
            stations={stations}
            teamsById={teamsById}
            useTightFrame={isWideLayout}
            useMobileFrame={isMobileLayout}
          />

          {isMobileLayout ? (
            <>
              <Pressable
                accessibilityLabel="Toggle legend"
                accessibilityRole="button"
                accessibilityState={{ expanded: isLegendVisible }}
                onPress={() => setIsLegendVisible((value) => !value)}
                style={mapStyles.floatingButton}
              >
                <MaterialIcons color={colors.ink} name="layers" size={20} />
                <Text style={mapStyles.floatingButtonText}>Legend</Text>
              </Pressable>

              {isLegendVisible ? (
                <View style={mapStyles.legendOverlay}>
                  <MapLegend teams={teams} />
                </View>
              ) : null}
            </>
          ) : (
            <View style={[mapStyles.legendOverlay, mapStyles.legendOverlayDesktop]}>
              <MapLegend teams={teams} />
            </View>
          )}
        </View>
      </View>

      {isMobileLayout ? (
        <MobileMapInspectorSheet
          isExpanded={isInspectorExpanded}
          nearbyItems={nearbyItems}
          onSelectNearbyItem={selectNearbyItem}
          onToggleExpanded={() => setIsInspectorExpanded((value) => !value)}
          renderInspector={renderInspector}
          selectedChallengeId={selectedChallengeId}
          selectedStationId={selectedStationId}
          setupPanel={setupPanel}
          shouldShow={showMobileSheet}
          stations={stations}
          subtitle={mobileSheetSubtitle}
          teamsById={teamsById}
          title={mobileSheetTitle}
        />
      ) : null}

      {isMobileLayout ? null : (
        <DesktopMapSidebar
          actions={actions}
          isWideLayout={isWideLayout}
          nearbyItems={nearbyItems}
          onSelectNearbyItem={selectNearbyItem}
          renderInspector={renderInspector}
          selectedChallengeId={selectedChallengeId}
          selectedStationId={selectedStationId}
          setupPanel={setupPanel}
          stations={stations}
          teams={teams}
          teamsById={teamsById}
        />
      )}
    </View>
  );
}
