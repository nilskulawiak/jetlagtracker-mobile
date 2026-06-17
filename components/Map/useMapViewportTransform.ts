import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, Platform, type View } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import type { ChallengeResponse, GameState, StationStateResponse } from "@/types/game";
import { isChallengeVisible } from "@/utils/colors";
import { MAX_MAP_ZOOM, MIN_MAP_ZOOM } from "@/utils/coordinate";
import { resolveMapTap } from "@/utils/mapSelection";
import type { MapSelectableItem } from "@/utils/mapSelection";

const WIDE_INITIAL_CONTENT_ZOOM = 1.45;
const WIDE_MAX_INITIAL_CONTENT_ZOOM = 2.4;

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

type WheelEventTarget = {
  addEventListener: (type: "wheel", listener: (event: WheelEventLike) => void, options?: { passive?: boolean }) => void;
  removeEventListener: (type: "wheel", listener: (event: WheelEventLike) => void) => void;
};

export function useMapViewportTransform({
  challenges,
  gameState,
  mapHeight,
  mapWidth,
  onHoverChange,
  onSelectMapItems,
  stations,
  useMobileFrame,
}: {
  challenges: ChallengeResponse[];
  gameState: GameState;
  mapHeight: number;
  mapWidth: number;
  onHoverChange: (isHovered: boolean) => void;
  onSelectMapItems: (items: MapSelectableItem[]) => void;
  stations: StationStateResponse[];
  useMobileFrame: boolean;
}) {
  const mapViewportRef = useRef<View | null>(null);
  const [viewportSize, setViewportSize] = useState({ height: 0, width: 0 });
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const hasSetInitialZoom = useSharedValue(false);

  const fitScale =
    viewportSize.width > 0 && viewportSize.height > 0
      ? Math.min(viewportSize.width / mapWidth, viewportSize.height / mapHeight)
      : 0;
  const renderedMapWidth = Math.max(mapWidth * fitScale, 1);
  const renderedMapHeight = Math.max(mapHeight * fitScale, 1);

  const clampOffset = useCallback((offset: number, contentSize: number, viewportContentSize: number, zoom: number) => {
    "worklet";

    if (zoom <= MIN_MAP_ZOOM) {
      return 0;
    }

    const maxOffset = Math.max(0, (contentSize * zoom - viewportContentSize) / 2);

    return Math.min(Math.max(offset, -maxOffset), maxOffset);
  }, []);

  useEffect(() => {
    if (fitScale <= 0 || hasSetInitialZoom.value) {
      return;
    }

    const visibleChallenges = challenges.filter(
      (challenge) => gameState.game.status === "CREATED" || isChallengeVisible(challenge.status),
    );
    const focusItems = [...stations, ...visibleChallenges];
    const focusCenter =
      focusItems.length > 0
        ? focusItems.reduce(
            (center, item) => ({
              x: center.x + item.xCoordinate / focusItems.length,
              y: center.y + item.yCoordinate / focusItems.length,
            }),
            { x: 0, y: 0 },
          )
        : { x: mapWidth / 2, y: mapHeight / 2 };

    const initialZoom = useMobileFrame
      ? Math.min(Math.max(viewportSize.height / renderedMapHeight, MIN_MAP_ZOOM), 1.7)
      : Math.min(
          Math.max(viewportSize.width / renderedMapWidth, WIDE_INITIAL_CONTENT_ZOOM, MIN_MAP_ZOOM),
          WIDE_MAX_INITIAL_CONTENT_ZOOM,
          MAX_MAP_ZOOM,
        );
    const initialTranslateX = useMobileFrame
      ? 0
      : clampOffset(
          (renderedMapWidth / 2 - focusCenter.x * fitScale) * initialZoom,
          renderedMapWidth,
          viewportSize.width,
          initialZoom,
        );
    const initialTranslateY = useMobileFrame
      ? 0
      : clampOffset(
          (renderedMapHeight / 2 - focusCenter.y * fitScale) * initialZoom,
          renderedMapHeight,
          viewportSize.height,
          initialZoom,
        );

    scale.value = initialZoom;
    savedScale.value = initialZoom;
    translateX.value = initialTranslateX;
    translateY.value = initialTranslateY;
    savedTranslateX.value = initialTranslateX;
    savedTranslateY.value = initialTranslateY;
    hasSetInitialZoom.value = true;
  }, [
    challenges,
    clampOffset,
    fitScale,
    gameState.game.status,
    hasSetInitialZoom,
    mapHeight,
    mapWidth,
    renderedMapHeight,
    renderedMapWidth,
    savedScale,
    savedTranslateX,
    savedTranslateY,
    scale,
    stations,
    translateX,
    translateY,
    useMobileFrame,
    viewportSize.height,
    viewportSize.width,
  ]);

  const zoomAroundPoint = useCallback((nextScale: number, focalX: number, focalY: number) => {
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
  }, [clampOffset, renderedMapHeight, renderedMapWidth, scale, translateX, translateY, viewportSize.height, viewportSize.width]);

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

  const resetMapView = () => {
    scale.value = MIN_MAP_ZOOM;
    savedScale.value = MIN_MAP_ZOOM;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
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

  const handleMapWheel = useCallback((event: WheelEventLike) => {
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
  }, [
    savedScale,
    savedTranslateX,
    savedTranslateY,
    scale,
    translateX,
    translateY,
    viewportSize.height,
    viewportSize.width,
    zoomAroundPoint,
  ]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    const target = mapViewportRef.current as unknown as WheelEventTarget | null;

    target?.addEventListener("wheel", handleMapWheel, { passive: false });

    return () => {
      target?.removeEventListener("wheel", handleMapWheel);
    };
  }, [handleMapWheel]);

  const mapWebWheelProps =
    Platform.OS === "web"
      ? {
          onMouseEnter: () => onHoverChange(true),
          onMouseLeave: () => onHoverChange(false),
        }
      : {};

  return {
    fitScale,
    handleViewportLayout,
    mapGesture,
    mapTransformStyle,
    mapViewportRef,
    mapWebWheelProps,
    renderedMapHeight,
    renderedMapWidth,
    resetMapView,
  };
}
