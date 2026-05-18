import { useState } from "react";
import { Image, LayoutChangeEvent, Platform, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { ChallengeMarkers, StationMarkers } from "@/components/Map/MapMarkers";
import { styles } from "@/components/Shared/styles";
import type { ChallengeResponse, GameState, StationStateResponse, TeamResponse } from "@/types/game";
import { MAX_MAP_ZOOM, MIN_MAP_ZOOM } from "@/utils/coordinate";
import { resolveMapImage } from "@/utils/mapAssets";
import { resolveMapTap } from "@/utils/mapSelection";
import type { MapSelectableItem } from "@/utils/mapSelection";

type WheelEventLike = {
  clientX?: number;
  clientY?: number;
  deltaY: number;
  offsetX?: number;
  offsetY?: number;
  nativeEvent?: {
    clientX?: number;
    clientY?: number;
    deltaY?: number;
    offsetX?: number;
    offsetY?: number;
  };
  preventDefault?: () => void;
  stopPropagation?: () => void;
};

export function MapViewport({
  challenges,
  gameState,
  onHoverChange,
  onSelectMapItems,
  selectedChallengeId,
  selectedStationId,
  stations,
  teamsById,
}: {
  challenges: ChallengeResponse[];
  gameState: GameState;
  onHoverChange: (isHovered: boolean) => void;
  onSelectMapItems: (items: MapSelectableItem[]) => void;
  selectedChallengeId: string | null;
  selectedStationId: string | null;
  stations: StationStateResponse[];
  teamsById: Map<string, TeamResponse>;
}) {
  const [viewportSize, setViewportSize] = useState({ height: 0, width: 0 });
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const mapWidth = gameState.game.mapWidth || 1000;
  const mapHeight = gameState.game.mapHeight || 1000;
  const fitScale =
    viewportSize.width > 0 && viewportSize.height > 0
      ? Math.min(viewportSize.width / mapWidth, viewportSize.height / mapHeight)
      : 0;
  const renderedMapWidth = Math.max(mapWidth * fitScale, 1);
  const renderedMapHeight = Math.max(mapHeight * fitScale, 1);

  const clampOffset = (offset: number, contentSize: number, viewportContentSize: number, zoom: number) => {
    "worklet";

    if (zoom <= MIN_MAP_ZOOM) {
      return 0;
    }

    const maxOffset = Math.max(0, (contentSize * zoom - viewportContentSize) / 2);

    return Math.min(Math.max(offset, -maxOffset), maxOffset);
  };

  const zoomAroundPoint = (nextScale: number, focalX: number, focalY: number) => {
    "worklet";

    const scaleRatio = nextScale / scale.value;
    const centeredFocalX = focalX - viewportSize.width / 2;
    const centeredFocalY = focalY - viewportSize.height / 2;

    scale.value = nextScale;
    translateX.value = clampOffset(
      translateX.value * scaleRatio + centeredFocalX * (1 - scaleRatio),
      renderedMapWidth,
      viewportSize.width,
      nextScale,
    );
    translateY.value = clampOffset(
      translateY.value * scaleRatio + centeredFocalY * (1 - scaleRatio),
      renderedMapHeight,
      viewportSize.height,
      nextScale,
    );
  };

  const mapTransformStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleViewportLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;

    setViewportSize({
      height: Math.max(height, 0),
      width: Math.max(width, 0),
    });
  };

  const resolveTapToMapItems = (tapX: number, tapY: number) => {
    const tapMapX = (tapX - viewportSize.width / 2 - translateX.value) / scale.value + renderedMapWidth / 2;
    const tapMapY = (tapY - viewportSize.height / 2 - translateY.value) / scale.value + renderedMapHeight / 2;
    const items = resolveMapTap({
      challenges,
      mapHeight,
      mapWidth,
      renderedMapHeight,
      renderedMapWidth,
      scale: scale.value,
      showCreatedChallenges: gameState.game.status === "CREATED",
      stations,
      tapMapX,
      tapMapY,
    });

    onSelectMapItems(items);
  };

  const panGesture = Gesture.Pan()
    .minDistance(1)
    .onUpdate((event) => {
      translateX.value = clampOffset(
        savedTranslateX.value + event.translationX,
        renderedMapWidth,
        viewportSize.width,
        scale.value,
      );
      translateY.value = clampOffset(
        savedTranslateY.value + event.translationY,
        renderedMapHeight,
        viewportSize.height,
        scale.value,
      );
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const nextScale = Math.min(Math.max(savedScale.value * event.scale, MIN_MAP_ZOOM), MAX_MAP_ZOOM);

      zoomAroundPoint(nextScale, event.focalX, event.focalY);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const tapGesture = Gesture.Tap()
    .maxDistance(8)
    .runOnJS(true)
    .onEnd((event) => {
      resolveTapToMapItems(event.x, event.y);
    });

  const mapGesture = Gesture.Exclusive(tapGesture, Gesture.Simultaneous(panGesture, pinchGesture));

  const handleMapWheel = (event: WheelEventLike) => {
    event.preventDefault?.();
    event.stopPropagation?.();

    const wheelEvent = event.nativeEvent ?? event;
    const deltaY = wheelEvent.deltaY ?? event.deltaY;
    const zoomDelta = deltaY > 0 ? -0.12 : 0.12;
    const nextScale = Math.min(Math.max(scale.value + zoomDelta, MIN_MAP_ZOOM), MAX_MAP_ZOOM);
    const focalX = wheelEvent.offsetX ?? wheelEvent.clientX ?? event.clientX ?? viewportSize.width / 2;
    const focalY = wheelEvent.offsetY ?? wheelEvent.clientY ?? event.clientY ?? viewportSize.height / 2;

    zoomAroundPoint(nextScale, focalX, focalY);
    savedScale.value = nextScale;
    savedTranslateX.value = translateX.value;
    savedTranslateY.value = translateY.value;
  };

  const mapWebWheelProps =
    Platform.OS === "web"
      ? {
          onMouseEnter: () => onHoverChange(true),
          onMouseLeave: () => onHoverChange(false),
          onWheel: handleMapWheel,
          onWheelCapture: handleMapWheel,
        }
      : {};

  return (
    <GestureDetector gesture={mapGesture}>
      <View
        onLayout={handleViewportLayout}
        style={styles.mapViewport}
        {...mapWebWheelProps}
      >
        {fitScale > 0 ? (
          <Animated.View
            style={[
              styles.mapTransformLayer,
              { height: renderedMapHeight, width: renderedMapWidth },
              mapTransformStyle,
            ]}
          >
            <View style={[styles.mapFrame, { height: renderedMapHeight, width: renderedMapWidth }]}>
              <Image
                resizeMode="stretch"
                source={resolveMapImage(gameState.game.mapImage || "taiwan")}
                style={[styles.mapImage, { height: renderedMapHeight, width: renderedMapWidth }]}
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
      </View>
    </GestureDetector>
  );
}
