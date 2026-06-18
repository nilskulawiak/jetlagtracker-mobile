import type { ChallengeResponse, StationStateResponse } from "../types/game";
import type { ChallengeType } from "../types/game";
import { isChallengeVisible } from "./colors";
import { scaleCoordinate } from "./coordinate";

export type MapSelectableKind = "challenge" | "station";

export type MapSelectableItem = {
  id: string;
  kind: MapSelectableKind;
  name: string;
  renderedX: number;
  renderedY: number;
  reward?: number;
  status?: string;
  challengeType?: ChallengeType;
};

type BuildMapSelectableItemsParams = {
  challenges: ChallengeResponse[];
  mapHeight: number;
  mapWidth: number;
  renderedMapHeight: number;
  renderedMapWidth: number;
  showCreatedChallenges?: boolean;
  stations: StationStateResponse[];
};

type ResolveMapTapParams = {
  challenges: ChallengeResponse[];
  isPointerDevice?: boolean;
  mapHeight: number;
  mapWidth: number;
  renderedMapHeight: number;
  renderedMapWidth: number;
  scale: number;
  showCreatedChallenges?: boolean;
  stations: StationStateResponse[];
  tapMapX: number;
  tapMapY: number;
};

const BASE_TOUCH_RADIUS = 30;
const MIN_TOUCH_RADIUS = 14;
const AMBIGUITY_MARGIN = 8;
const POINTER_HIT_RADIUS: Record<MapSelectableKind, number> = {
  challenge: 15,
  station: 8,
};

export function buildMapSelectableItems({
  challenges,
  mapHeight,
  mapWidth,
  renderedMapHeight,
  renderedMapWidth,
  showCreatedChallenges = false,
  stations,
}: BuildMapSelectableItemsParams): MapSelectableItem[] {
  const stationItems = stations.map((station) => ({
    id: station.id,
    kind: "station" as const,
    name: station.name,
    renderedX: scaleCoordinate(station.xCoordinate, mapWidth, renderedMapWidth),
    renderedY: scaleCoordinate(station.yCoordinate, mapHeight, renderedMapHeight),
  }));
  const challengeItems = challenges
    .filter((challenge) => showCreatedChallenges || isChallengeVisible(challenge.status))
    .map((challenge) => ({
      id: challenge.id,
      kind: "challenge" as const,
      name: challenge.name,
      renderedX: scaleCoordinate(challenge.xCoordinate, mapWidth, renderedMapWidth),
      renderedY: scaleCoordinate(challenge.yCoordinate, mapHeight, renderedMapHeight),
      reward: challenge.reward,
      status: challenge.status,
      challengeType: challenge.challengeType,
    }));

  return [...stationItems, ...challengeItems];
}

export function resolveMapTap({
  challenges,
  isPointerDevice = false,
  mapHeight,
  mapWidth,
  renderedMapHeight,
  renderedMapWidth,
  scale,
  showCreatedChallenges = false,
  stations,
  tapMapX,
  tapMapY,
}: ResolveMapTapParams): MapSelectableItem[] {
  const selectableItems = buildMapSelectableItems({
    challenges,
    mapHeight,
    mapWidth,
    renderedMapHeight,
    renderedMapWidth,
    showCreatedChallenges,
    stations,
  });

  if (isPointerDevice) {
    const hit = selectableItems
      .map((item) => ({ distance: Math.hypot(item.renderedX - tapMapX, item.renderedY - tapMapY), item }))
      .filter((h) => h.distance <= POINTER_HIT_RADIUS[h.item.kind])
      .sort((a, b) => a.distance - b.distance)[0];
    return hit ? [hit.item] : [];
  }

  const touchRadius = Math.max(MIN_TOUCH_RADIUS, BASE_TOUCH_RADIUS / Math.max(scale, 1));
  const hits = selectableItems
    .map((item) => ({
      distance: Math.hypot(item.renderedX - tapMapX, item.renderedY - tapMapY),
      item,
    }))
    .filter((hit) => hit.distance <= touchRadius)
    .sort((first, second) => first.distance - second.distance);

  if (hits.length <= 1) {
    return hits.map((hit) => hit.item);
  }

  const [closest, secondClosest] = hits;

  if (closest.distance + AMBIGUITY_MARGIN < secondClosest.distance) {
    return [closest.item];
  }

  return hits.map((hit) => hit.item);
}
