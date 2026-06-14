import { MaterialIcons } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

import { ChallengeMarkers, StationMarkers } from "@/components/Map/MapMarkers";
import { mapStyles } from "@/components/Map/mapStyles";
import { useMapViewportTransform } from "@/components/Map/useMapViewportTransform";
import type { ChallengeResponse, GameState, StationStateResponse, TeamResponse } from "@/types/game";
import { colors } from "@/utils/colors";
import { resolveMapImage } from "@/utils/mapAssets";
import type { MapSelectableItem } from "@/utils/mapSelection";

export function MapViewport({
  challenges,
  gameState,
  onHoverChange,
  onSelectMapItems,
  selectedChallengeId,
  selectedStationId,
  useTightFrame = false,
  useMobileFrame = false,
  stations,
  teamsById,
}: {
  challenges: ChallengeResponse[];
  gameState: GameState;
  onHoverChange: (isHovered: boolean) => void;
  onSelectMapItems: (items: MapSelectableItem[]) => void;
  selectedChallengeId: string | null;
  selectedStationId: string | null;
  useTightFrame?: boolean;
  useMobileFrame?: boolean;
  stations: StationStateResponse[];
  teamsById: Map<string, TeamResponse>;
}) {
  const mapWidth = gameState.game.mapWidth || 1000;
  const mapHeight = gameState.game.mapHeight || 1000;
  const {
    fitScale,
    handleViewportLayout,
    mapGesture,
    mapTransformStyle,
    mapViewportRef,
    mapWebWheelProps,
    renderedMapHeight,
    renderedMapWidth,
    resetMapView,
  } = useMapViewportTransform({
    challenges,
    gameState,
    mapHeight,
    mapWidth,
    onHoverChange,
    onSelectMapItems,
    stations,
    useMobileFrame,
    useTightFrame,
  });

  return (
    <GestureDetector gesture={mapGesture}>
      <View
        onLayout={handleViewportLayout}
        ref={mapViewportRef}
        style={[
          mapStyles.viewport,
          useTightFrame && mapStyles.viewportTight,
          useMobileFrame && mapStyles.mobileViewport,
        ]}
        {...mapWebWheelProps}
      >
        {fitScale > 0 ? (
          <Animated.View
            style={[
              mapStyles.transformLayer,
              { height: renderedMapHeight, width: renderedMapWidth },
              mapTransformStyle,
            ]}
          >
            <View
              style={[
                mapStyles.frame,
                useMobileFrame && mapStyles.mobileFrame,
                { height: renderedMapHeight, width: renderedMapWidth },
              ]}
            >
              <Image
                resizeMode="stretch"
                source={resolveMapImage(gameState.game.mapImage || "taiwan")}
                style={[mapStyles.image, { height: renderedMapHeight, width: renderedMapWidth }]}
              />

              <ChallengeMarkers
                challenges={challenges}
                mapHeight={mapHeight}
                mapWidth={mapWidth}
                renderedMapHeight={renderedMapHeight}
                renderedMapWidth={renderedMapWidth}
                selectedChallengeId={selectedChallengeId}
                showCreatedChallenges={gameState.game.status === "CREATED"}
              />

              <StationMarkers
                mapHeight={mapHeight}
                mapWidth={mapWidth}
                renderedMapHeight={renderedMapHeight}
                renderedMapWidth={renderedMapWidth}
                selectedStationId={selectedStationId}
                stations={stations}
                teamsById={teamsById}
              />
            </View>
          </Animated.View>
        ) : null}

        {useTightFrame ? (
          <Pressable
            accessibilityLabel="Fit full map"
            accessibilityRole="button"
            onPress={resetMapView}
            style={mapStyles.fitButton}
          >
            <MaterialIcons color={colors.ink} name="zoom-out-map" size={20} />
          </Pressable>
        ) : null}
      </View>
    </GestureDetector>
  );
}
