import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";

import { MapCreationForm } from "@/components/Inspector/MapCreationForm";
import { Inspector } from "@/components/Inspector/Inspector";
import { DesktopMapSidebar } from "@/components/Map/DesktopMapSidebar";
import { mapStyles } from "@/components/Map/mapStyles";
import { MapLegend } from "@/components/Map/MapLegend";
import { MobileMapInspectorSheet } from "@/components/Map/MobileMapInspectorSheet";
import { MapViewport } from "@/components/Map/MapViewport";
import { useMapSelection } from "@/components/Map/useMapSelection";
import { useGameSelection } from "@/hooks/useGameSelection";
import type {
  ChallengeResponse,
  CreateChallengeRequest,
  CreateStationRequest,
  FinishChallengeRequest,
  GameActionResponse,
  GameState,
  PatchChallengeRequest,
  PatchStationRequest,
  StartChallengeRequest,
  StationStateResponse,
  TeamResponse,
} from "@/types/game";
import { colors } from "@/utils/colors";
import { mapTeamsById } from "@/utils/gameSelectors";
import type { MapSelectableItem } from "@/utils/mapSelection";

export function MapScreen({
  actions,
  challenges,
  gameState,
  isGameCreated,
  isMutating,
  onAddStationChips,
  onCompleteChallenge,
  onCreateChallenge,
  onCreateStation,
  onDeleteChallenge,
  onDeleteStation,
  onFailChallenge,
  onPatchChallenge,
  onPatchStation,
  onStartChallenge,
  onHoverChange,
  selectedTeamId,
  setupPanel,
  stations,
  teams,
}: {
  actions: GameActionResponse[];
  challenges: ChallengeResponse[];
  isGameCreated: boolean;
  gameState: GameState;
  isMutating: boolean;
  onAddStationChips: (stationId: string, body: { chips: number; teamId: string }) => Promise<void>;
  onCompleteChallenge: (challengeId: string, body: FinishChallengeRequest) => Promise<void>;
  onCreateChallenge: (body: CreateChallengeRequest) => Promise<void>;
  onCreateStation: (body: CreateStationRequest) => Promise<void>;
  onDeleteChallenge: (id: string) => Promise<void>;
  onDeleteStation: (id: string) => Promise<void>;
  onFailChallenge: (challengeId: string, body: FinishChallengeRequest) => Promise<void>;
  onPatchChallenge: (id: string, body: PatchChallengeRequest) => Promise<void>;
  onPatchStation: (id: string, body: PatchStationRequest) => Promise<void>;
  onStartChallenge: (challengeId: string, body: StartChallengeRequest) => Promise<void>;
  onHoverChange: (isHovered: boolean) => void;
  selectedTeamId: string;
  setupPanel?: ReactNode;
  stations: StationStateResponse[];
  teams: TeamResponse[];
}) {
  const { width } = useWindowDimensions();
  const isMobileLayout = width < 700;
  const [isLegendVisible, setIsLegendVisible] = useState(false);
  const [viewportSlotSize, setViewportSlotSize] = useState({ width: 0, height: 0 });

  // Pending creation state
  const [pendingTap, setPendingTap] = useState<{
    viewportX: number;
    viewportY: number;
    gameX: number;
    gameY: number;
  } | null>(null);
  const [pendingCreationType, setPendingCreationType] = useState<"STATION" | "CHALLENGE" | null>(null);
  const [pendingGameX, setPendingGameX] = useState(0);
  const [pendingGameY, setPendingGameY] = useState(0);
  const [pendingReward, setPendingReward] = useState<number | null>(null);

  // Edit marker state
  const [isEditingItem, setIsEditingItem] = useState(false);
  // editingCoords: position of the draggable edit marker (set from item coords, updated by drag/form)
  const [editingCoords, setEditingCoords] = useState<{ x: number; y: number } | null>(null);
  // draggedCoords: set only after a drag while editing — syncs x/y fields in CreationInspector
  const [draggedCoords, setDraggedCoords] = useState<{ x: number; y: number } | null>(null);

  const pendingCreation = pendingCreationType
    ? { type: pendingCreationType, gameX: pendingGameX, gameY: pendingGameY, reward: pendingReward ?? undefined }
    : null;

  const teamsById = mapTeamsById(teams);
  const {
    clearMapSelection,
    selectChallenge,
    selectedChallengeId,
    selectedStationId,
    selectStation,
  } = useGameSelection();
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
    onClearSelection: clearMapSelection,
    onSelectChallenge: selectChallenge,
    onSelectStation: selectStation,
    selectedChallengeId,
    selectedStationId,
    setupPanel,
    stations,
    teamsById,
  });

  // Sync editingCoords from the selected item whenever the selection changes
  const effectSelectedStationId = selectedStation?.id ?? null;
  const effectSelectedChallengeId = selectedChallenge?.id ?? null;
  useEffect(() => {
    if (selectedStation) {
      setEditingCoords({ x: selectedStation.xCoordinate, y: selectedStation.yCoordinate });
    } else if (selectedChallenge) {
      setEditingCoords({ x: selectedChallenge.xCoordinate, y: selectedChallenge.yCoordinate });
    } else {
      setEditingCoords(null);
    }
    setDraggedCoords(null);
    setIsEditingItem(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectSelectedStationId, effectSelectedChallengeId]);

  const handleEditingChange = (editing: boolean) => {
    setIsEditingItem(editing);
    if (!editing) setDraggedCoords(null);
  };

  // editingItem: drives the draggable edit marker and excludes the static marker.
  // Only active once the user has clicked Edit — not on mere selection.
  const editingItem =
    isGameCreated && isEditingItem && editingCoords && (selectedStation || selectedChallenge)
      ? {
          type: (selectedStation ? "STATION" : "CHALLENGE") as "STATION" | "CHALLENGE",
          gameX: editingCoords.x,
          gameY: editingCoords.y,
          reward: selectedChallenge?.reward,
          excludeId: selectedStation?.id ?? selectedChallenge?.id ?? "",
        }
      : null;

  const handleEmptyMapTap = (gameX: number, gameY: number, viewportX: number, viewportY: number) => {
    setPendingTap({ viewportX, viewportY, gameX, gameY });
    setPendingCreationType(null);
    handleSelectMapItems([]);
  };

  const handlePickType = (type: "STATION" | "CHALLENGE") => {
    if (!pendingTap) return;
    setPendingCreationType(type);
    setPendingGameX(pendingTap.gameX);
    setPendingGameY(pendingTap.gameY);
    setPendingTap(null);
  };

  const handleCancelCreation = () => {
    setPendingCreationType(null);
    setPendingTap(null);
    setPendingReward(null);
  };

  const handlePendingMarkerDragEnd = (gameX: number, gameY: number) => {
    setPendingGameX(gameX);
    setPendingGameY(gameY);
  };

  const handleCoordinateChange = (x: number, y: number) => {
    setPendingGameX(x);
    setPendingGameY(y);
  };

  const handleEditMarkerDragEnd = (gameX: number, gameY: number) => {
    setEditingCoords({ x: gameX, y: gameY });
    setDraggedCoords({ x: gameX, y: gameY });
  };

  const handleEditCoordinateChange = (x: number, y: number) => {
    setEditingCoords({ x, y });
  };

  const handleSelectMapItemsWrapped = (items: MapSelectableItem[]) => {
    if (items.length > 0) {
      setPendingTap(null);
      setPendingCreationType(null);
    }
    handleSelectMapItems(items);
  };

  const sheetTitle = pendingCreationType
    ? pendingCreationType === "STATION" ? "New station" : "New challenge"
    : pendingTap ? "Place on map" : mobileSheetTitle;
  const sheetSubtitle = pendingCreationType || pendingTap ? "" : mobileSheetSubtitle;

  const renderInspector = (hideHeader = false) => {
    if (pendingCreationType) {
      return (
        <MapCreationForm
          gameX={pendingGameX}
          gameY={pendingGameY}
          isMutating={isMutating}
          onCancel={handleCancelCreation}
          onCoordinateChange={handleCoordinateChange}
          onCreateChallenge={onCreateChallenge}
          onCreateStation={onCreateStation}
          onRewardChange={setPendingReward}
          type={pendingCreationType}
        />
      );
    }
    return (
      <Inspector
        challenge={selectedChallenge}
        hideHeader={hideHeader}
        isGameCreated={isGameCreated}
        isMutating={isMutating}
        onAddStationChips={onAddStationChips}
        onCompleteChallenge={onCompleteChallenge}
        onCoordinateChange={handleEditCoordinateChange}
        onDeleteChallenge={onDeleteChallenge}
        onDeleteStation={onDeleteStation}
        onEditingChange={handleEditingChange}
        onFailChallenge={onFailChallenge}
        onPatchChallenge={onPatchChallenge}
        onPatchStation={onPatchStation}
        onStartChallenge={onStartChallenge}
        pendingCoords={draggedCoords}
        selectedTeamId={selectedTeamId}
        station={selectedStation}
        teamsById={teamsById}
      />
    );
  };

  const creationPickerNode = pendingTap ? (
    <View style={{ gap: 6, paddingBottom: 8, paddingTop: 4 }}>
      <Text style={mapStyles.pickerTitle}>Add to map</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => handlePickType("STATION")}
        style={mapStyles.pickerOption}
      >
        <MaterialIcons color={colors.ink} name="add-location-alt" size={20} />
        <Text style={mapStyles.pickerOptionText}>Add station</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => handlePickType("CHALLENGE")}
        style={mapStyles.pickerOption}
      >
        <MaterialIcons color={colors.ink} name="add-task" size={20} />
        <Text style={mapStyles.pickerOptionText}>Add challenge</Text>
      </Pressable>
    </View>
  ) : null;

  return (
    <View style={[mapStyles.workspace, !isMobileLayout && mapStyles.workspaceWide, isMobileLayout && mapStyles.mobileWorkspace]}>
      <View style={[mapStyles.mainPane, isMobileLayout && mapStyles.mobileMainPane]}>
        <View
          onLayout={(e) => setViewportSlotSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
          style={mapStyles.viewportSlot}
        >
          <MapViewport
            challenges={challenges}
            editingItem={editingItem}
            gameState={gameState}
            onEditMarkerDragEnd={handleEditMarkerDragEnd}
            onEmptyMapTap={isGameCreated ? handleEmptyMapTap : undefined}
            onHoverChange={onHoverChange}
            onPendingMarkerDragEnd={handlePendingMarkerDragEnd}
            onSelectMapItems={handleSelectMapItemsWrapped}
            pendingCreation={pendingCreation}
            selectedChallengeId={selectedChallengeId}
            selectedStationId={selectedStationId}
            stations={stations}
            teamsById={teamsById}
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

          {pendingTap && !isMobileLayout ? (
            <View
              style={{
                backgroundColor: colors.panel,
                borderColor: colors.line,
                borderRadius: 8,
                borderWidth: 1,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                gap: 6,
                left: Math.min(pendingTap.viewportX + 8, Math.max(8, viewportSlotSize.width - 204)),
                padding: 10,
                position: "absolute",
                top: Math.min(pendingTap.viewportY + 8, Math.max(8, viewportSlotSize.height - 116)),
                width: 196,
                zIndex: 20,
              }}
            >
              <Text style={mapStyles.pickerTitle}>Add to map</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => handlePickType("STATION")}
                style={mapStyles.pickerOption}
              >
                <MaterialIcons color={colors.ink} name="add-location-alt" size={20} />
                <Text style={mapStyles.pickerOptionText}>Add station</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => handlePickType("CHALLENGE")}
                style={mapStyles.pickerOption}
              >
                <MaterialIcons color={colors.ink} name="add-task" size={20} />
                <Text style={mapStyles.pickerOptionText}>Add challenge</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>

      {isMobileLayout ? (
        <MobileMapInspectorSheet
          creationPicker={creationPickerNode}
          isExpanded={isInspectorExpanded || Boolean(pendingCreationType)}
          nearbyItems={nearbyItems}
          onSelectNearbyItem={selectNearbyItem}
          onToggleExpanded={() => setIsInspectorExpanded((value) => !value)}
          renderInspector={renderInspector}
          selectedChallengeId={selectedChallengeId}
          selectedStationId={selectedStationId}
          setupPanel={setupPanel}
          shouldShow={showMobileSheet || Boolean(pendingTap) || Boolean(pendingCreationType)}
          stations={stations}
          subtitle={sheetSubtitle}
          teamsById={teamsById}
          title={sheetTitle}
        />
      ) : null}

      {isMobileLayout ? null : (
        <DesktopMapSidebar
          actions={actions}
          isGameCreated={isGameCreated}
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
