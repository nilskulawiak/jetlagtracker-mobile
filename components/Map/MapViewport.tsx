import { Image, Platform, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { ChallengeMarkers, StationMarkers } from "@/components/Map/MapMarkers";
import { styles } from "@/components/Shared/styles";
import type { ChallengeResponse, GameState, StationStateResponse, TeamResponse } from "@/types/game";
import { MAX_MAP_ZOOM, MIN_MAP_ZOOM } from "@/utils/coordinate";
import { resolveMapImage } from "@/utils/mapAssets";

type WheelEventLike = {
  deltaY: number;
  preventDefault?: () => void;
  stopPropagation?: () => void;
};

export function MapViewport({
  challenges,
  gameState,
  onHoverChange,
  onSelectChallenge,
  onSelectStation,
  selectedChallengeId,
  selectedStationId,
  stations,
  teamsById,
}: {
  challenges: ChallengeResponse[];
  gameState: GameState;
  onHoverChange: (isHovered: boolean) => void;
  onSelectChallenge: (challengeId: string) => void;
  onSelectStation: (stationId: string) => void;
  selectedChallengeId: string | null;
  selectedStationId: string | null;
  stations: StationStateResponse[];
  teamsById: Map<string, TeamResponse>;
}) {
  const { width } = useWindowDimensions();
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const mapWidth = gameState.game.mapWidth || 1000;
  const mapHeight = gameState.game.mapHeight || 1000;
  const renderedMapWidth = Math.max(width - 32, 1);
  const renderedMapHeight = (renderedMapWidth / mapWidth) * mapHeight;

  const clampOffset = (offset: number, contentSize: number, zoom: number) => {
    "worklet";

    if (zoom <= MIN_MAP_ZOOM) {
      return 0;
    }

    const maxOffset = (contentSize * (zoom - 1)) / 2;

    return Math.min(Math.max(offset, -maxOffset), maxOffset);
  };

  const mapTransformStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const panGesture = Gesture.Pan()
    .minDistance(1)
    .onUpdate((event) => {
      translateX.value = clampOffset(savedTranslateX.value + event.translationX, renderedMapWidth, scale.value);
      translateY.value = clampOffset(savedTranslateY.value + event.translationY, renderedMapHeight, scale.value);
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const nextScale = Math.min(Math.max(savedScale.value * event.scale, MIN_MAP_ZOOM), MAX_MAP_ZOOM);

      scale.value = nextScale;
      translateX.value = clampOffset(translateX.value, renderedMapWidth, nextScale);
      translateY.value = clampOffset(translateY.value, renderedMapHeight, nextScale);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const mapGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const handleMapWheel = (event: WheelEventLike) => {
    event.preventDefault?.();
    event.stopPropagation?.();

    const zoomDelta = event.deltaY > 0 ? -0.12 : 0.12;
    const nextScale = Math.min(Math.max(scale.value + zoomDelta, MIN_MAP_ZOOM), MAX_MAP_ZOOM);

    scale.value = nextScale;
    translateX.value = clampOffset(translateX.value, renderedMapWidth, nextScale);
    translateY.value = clampOffset(translateY.value, renderedMapHeight, nextScale);
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
        style={[styles.mapViewport, { height: renderedMapHeight, width: renderedMapWidth }]}
        {...mapWebWheelProps}
      >
        <Animated.View style={[styles.mapTransformLayer, mapTransformStyle]}>
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
              onSelectChallenge={onSelectChallenge}
              renderedMapHeight={renderedMapHeight}
              renderedMapWidth={renderedMapWidth}
              selectedChallengeId={selectedChallengeId}
            />

            <StationMarkers
              mapHeight={mapHeight}
              mapWidth={mapWidth}
              onSelectStation={onSelectStation}
              renderedMapHeight={renderedMapHeight}
              renderedMapWidth={renderedMapWidth}
              selectedStationId={selectedStationId}
              stations={stations}
              teamsById={teamsById}
            />
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
