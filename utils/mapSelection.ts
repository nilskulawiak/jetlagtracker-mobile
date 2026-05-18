import type { ChallengeResponse, StationStateResponse } from "@/types/game";
import { isChallengeVisible } from "@/utils/colors";
import { scaleCoordinate } from "@/utils/coordinate";

export type MapSelectableKind = "challenge" | "station";

export type MapSelectableItem = {
  id: string;
  kind: MapSelectableKind;
  name: string;
  renderedX: number;
  renderedY: number;
  rewardChips?: number;
  status?: string;
};

type BuildMapSelectableItemsParams = {
  challenges: ChallengeResponse[];
  mapHeight: number;
  mapWidth: number;
  renderedMapHeight: number;
  renderedMapWidth: number;
  stations: StationStateResponse[];
};

type ResolveMapTapParams = {
  challenges: ChallengeResponse[];
  mapHeight: number;
  mapWidth: number;
  renderedMapHeight: number;
  renderedMapWidth: number;
  scale: number;
  stations: StationStateResponse[];
  tapMapX: number;
  tapMapY: number;
};

const BASE_TOUCH_RADIUS = 30;
const MIN_TOUCH_RADIUS = 14;
const AMBIGUITY_MARGIN = 8;

export function buildMapSelectableItems({
  challenges,
  mapHeight,
  mapWidth,
  renderedMapHeight,
  renderedMapWidth,
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
    .filter((challenge) => isChallengeVisible(challenge.status))
    .map((challenge) => ({
      id: challenge.id,
      kind: "challenge" as const,
      name: challenge.name,
      renderedX: scaleCoordinate(challenge.xCoordinate, mapWidth, renderedMapWidth),
      renderedY: scaleCoordinate(challenge.yCoordinate, mapHeight, renderedMapHeight),
      rewardChips: challenge.rewardChips,
      status: challenge.status,
    }));

  return [...stationItems, ...challengeItems];
}

export function resolveMapTap({
  challenges,
  mapHeight,
  mapWidth,
  renderedMapHeight,
  renderedMapWidth,
  scale,
  stations,
  tapMapX,
  tapMapY,
}: ResolveMapTapParams): MapSelectableItem[] {
  const touchRadius = Math.max(MIN_TOUCH_RADIUS, BASE_TOUCH_RADIUS / Math.max(scale, 1));
  const hits = buildMapSelectableItems({
    challenges,
    mapHeight,
    mapWidth,
    renderedMapHeight,
    renderedMapWidth,
    stations,
  })
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
