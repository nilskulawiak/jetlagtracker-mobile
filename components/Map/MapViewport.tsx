import { MaterialIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

import { ChallengeMarkers, StationMarkers } from "@/components/Map/MapMarkers";
import { mapStyles } from "@/components/Map/mapStyles";
import { useMapViewportTransform } from "@/components/Map/useMapViewportTransform";
import type { ChallengeResponse, GameState, StationStateResponse, TeamResponse } from "@/types/game";
import { colors } from "@/utils/colors";
import { scaleCoordinate } from "@/utils/coordinate";
import { resolveMapImage } from "@/utils/mapAssets";
import type { MapSelectableItem } from "@/utils/mapSelection";

function PendingMarker({
  gameX,
  gameY,
  mapHeight,
  mapPanGesture,
  mapWidth,
  onDragEnd,
  renderedMapHeight,
  renderedMapWidth,
  reward,
  scale,
  type,
}: {
  gameX: number;
  gameY: number;
  mapHeight: number;
  mapPanGesture: ReturnType<typeof Gesture.Pan>;
  mapWidth: number;
  onDragEnd: (gameX: number, gameY: number) => void;
  renderedMapHeight: number;
  renderedMapWidth: number;
  reward?: number;
  scale: SharedValue<number>;
  type: "STATION" | "CHALLENGE";
}) {
  const dragOffsetX = useSharedValue(0);
  const dragOffsetY = useSharedValue(0);

  useEffect(() => {
    dragOffsetX.value = 0;
    dragOffsetY.value = 0;
  }, [gameX, gameY, dragOffsetX, dragOffsetY]);

  const baseX = scaleCoordinate(gameX, mapWidth, renderedMapWidth);
  const baseY = scaleCoordinate(gameY, mapHeight, renderedMapHeight);

  const dragStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dragOffsetX.value },
      { translateY: dragOffsetY.value },
    ],
  }));

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .blocksExternalGesture(mapPanGesture)
    .onUpdate((event) => {
      dragOffsetX.value = event.translationX / scale.value;
      dragOffsetY.value = event.translationY / scale.value;
    })
    .onEnd((event) => {
      const finalRenderedX = baseX + event.translationX / scale.value;
      const finalRenderedY = baseY + event.translationY / scale.value;
      const newGameX = Math.round((finalRenderedX / renderedMapWidth) * mapWidth);
      const newGameY = Math.round((finalRenderedY / renderedMapHeight) * mapHeight);
      const clampedX = Math.max(1, Math.min(mapWidth, newGameX));
      const clampedY = Math.max(1, Math.min(mapHeight, newGameY));
      onDragEnd(clampedX, clampedY);
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          mapStyles.markerTouchTarget,
          { left: baseX, top: baseY, zIndex: 10 },
          dragStyle,
        ]}
      >
        {type === "STATION" ? (
          <View
            style={[
              mapStyles.stationMarker,
              { backgroundColor: colors.stationEmpty, borderColor: colors.info, boxShadow: "0 2px 6px rgba(0,0,0,0.25)" },
            ]}
          />
        ) : (
          <View
            style={[
              mapStyles.challengeMarker,
              { backgroundColor: colors.info, boxShadow: "0 2px 6px rgba(0,0,0,0.25)" },
            ]}
          >
            {reward !== undefined ? (
              <Text style={mapStyles.challengeMarkerText}>{reward}</Text>
            ) : null}
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

export function MapViewport({
  challenges,
  editingItem,
  gameState,
  onEditMarkerDragEnd,
  onEmptyMapTap,
  onHoverChange,
  onPendingMarkerDragEnd,
  onSelectMapItems,
  pendingCreation,
  selectedChallengeId,
  selectedStationId,
  useMobileFrame = false,
  stations,
  teamsById,
}: {
  challenges: ChallengeResponse[];
  editingItem?: {
    type: "STATION" | "CHALLENGE";
    gameX: number;
    gameY: number;
    reward?: number;
    excludeId: string;
  } | null;
  gameState: GameState;
  onEditMarkerDragEnd?: (gameX: number, gameY: number) => void;
  onEmptyMapTap?: (gameX: number, gameY: number, viewportX: number, viewportY: number) => void;
  onHoverChange: (isHovered: boolean) => void;
  onPendingMarkerDragEnd?: (gameX: number, gameY: number) => void;
  onSelectMapItems: (items: MapSelectableItem[]) => void;
  pendingCreation?: { type: "STATION" | "CHALLENGE"; gameX: number; gameY: number; reward?: number } | null;
  selectedChallengeId: string | null;
  selectedStationId: string | null;
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
    mapPanGesture,
    mapTransformStyle,
    mapViewportRef,
    mapWebWheelProps,
    renderedMapHeight,
    renderedMapWidth,
    resetMapView,
    scale,
  } = useMapViewportTransform({
    challenges,
    gameState,
    mapHeight,
    mapWidth,
    onEmptyMapTap,
    onHoverChange,
    onSelectMapItems,
    stations,
    useMobileFrame,
  });

  const excludeStationId = editingItem?.type === "STATION" ? editingItem.excludeId : undefined;
  const excludeChallengeId = editingItem?.type === "CHALLENGE" ? editingItem.excludeId : undefined;

  return (
    <GestureDetector gesture={mapGesture}>
      <View
        onLayout={handleViewportLayout}
        ref={mapViewportRef}
        style={[
          mapStyles.viewport,
          useMobileFrame ? mapStyles.mobileViewport : mapStyles.viewportTight,
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
                excludeChallengeId={excludeChallengeId}
                mapHeight={mapHeight}
                mapWidth={mapWidth}
                renderedMapHeight={renderedMapHeight}
                renderedMapWidth={renderedMapWidth}
                selectedChallengeId={selectedChallengeId}
                showCreatedChallenges={gameState.game.status === "CREATED"}
              />

              <StationMarkers
                excludeStationId={excludeStationId}
                mapHeight={mapHeight}
                mapWidth={mapWidth}
                renderedMapHeight={renderedMapHeight}
                renderedMapWidth={renderedMapWidth}
                selectedStationId={selectedStationId}
                stations={stations}
                teamsById={teamsById}
              />

              {pendingCreation && onPendingMarkerDragEnd ? (
                <PendingMarker
                  gameX={pendingCreation.gameX}
                  gameY={pendingCreation.gameY}
                  mapHeight={mapHeight}
                  mapPanGesture={mapPanGesture}
                  mapWidth={mapWidth}
                  onDragEnd={onPendingMarkerDragEnd}
                  renderedMapHeight={renderedMapHeight}
                  renderedMapWidth={renderedMapWidth}
                  reward={pendingCreation.reward}
                  scale={scale}
                  type={pendingCreation.type}
                />
              ) : null}

              {editingItem && onEditMarkerDragEnd ? (
                <PendingMarker
                  gameX={editingItem.gameX}
                  gameY={editingItem.gameY}
                  mapHeight={mapHeight}
                  mapPanGesture={mapPanGesture}
                  mapWidth={mapWidth}
                  onDragEnd={onEditMarkerDragEnd}
                  renderedMapHeight={renderedMapHeight}
                  renderedMapWidth={renderedMapWidth}
                  reward={editingItem.reward}
                  scale={scale}
                  type={editingItem.type}
                />
              ) : null}
            </View>
          </Animated.View>
        ) : null}

        {!useMobileFrame ? (
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
