import type { ImageSourcePropType } from "react-native";

const mapImages: Record<string, ImageSourcePropType> = {
  taiwan: require("@/assets/images/taiwan.png"),
  "taiwan.png": require("@/assets/images/taiwan.png"),
};

export function resolveMapImage(mapImage: string): ImageSourcePropType {
  return mapImages[mapImage.trim().toLowerCase()] ?? { uri: mapImage };
}
