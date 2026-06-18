import type { ImageSourcePropType } from "react-native";

export type MapDefinition = {
  id: string;
  name: string;
  mapWidth: number;
  mapHeight: number;
};

export const AVAILABLE_MAPS: MapDefinition[] = [
  { id: "taiwan", name: "Taiwan", mapWidth: 953, mapHeight: 1079 },
  { id: "frankfurt", name: "Frankfurt am Main", mapWidth: 3017, mapHeight: 2994 },
];

const mapImages: Record<string, ImageSourcePropType> = {
  taiwan: require("@/assets/images/taiwan.png"),
  "taiwan.png": require("@/assets/images/taiwan.png"),
  frankfurt: require("@/assets/images/frankfurt.png"),
  "frankfurt.png": require("@/assets/images/frankfurt.png"),
};

export function resolveMapImage(mapImage: string): ImageSourcePropType {
  return mapImages[mapImage.trim().toLowerCase()] ?? { uri: mapImage };
}
