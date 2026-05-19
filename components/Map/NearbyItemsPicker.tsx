import { Pressable, Text, View } from "react-native";

import { mapStyles } from "@/components/Map/mapStyles";
import { styles } from "@/components/Shared/styles";
import type { StationStateResponse, TeamResponse } from "@/types/game";
import { colors, getChallengeStatusColor } from "@/utils/colors";
import { getChallengeValueLabel } from "@/utils/challengeDisplay";
import type { MapSelectableItem } from "@/utils/mapSelection";

export function NearbyItemsPicker({
  items,
  onSelectItem,
  selectedChallengeId,
  selectedStationId,
  stations,
  teamsById,
}: {
  items: MapSelectableItem[];
  onSelectItem: (item: MapSelectableItem) => void;
  selectedChallengeId: string | null;
  selectedStationId: string | null;
  stations: StationStateResponse[];
  teamsById: Map<string, TeamResponse>;
}) {
  if (items.length <= 1) {
    return null;
  }

  return (
    <View style={mapStyles.pickerPanel}>
      <Text style={mapStyles.pickerTitle}>Nearby items</Text>
      {items.map((item) => {
        const station =
          item.kind === "station"
            ? stations.find((nextStation) => nextStation.id === item.id)
            : null;
        const owner = station?.ownerTeamId ? teamsById.get(station.ownerTeamId) : undefined;
        const isSelected =
          (item.kind === "station" && selectedStationId === item.id) ||
          (item.kind === "challenge" && selectedChallengeId === item.id);

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            key={`${item.kind}-${item.id}`}
            onPress={() => onSelectItem(item)}
            style={[
              mapStyles.pickerOption,
              isSelected && mapStyles.pickerOptionSelected,
            ]}
          >
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor:
                    item.kind === "station"
                      ? owner?.color ?? colors.stationEmpty
                      : getChallengeStatusColor(item.status ?? ""),
                },
              ]}
            />
            <Text numberOfLines={1} style={mapStyles.pickerOptionText}>
              {item.kind === "challenge" && item.reward
                ? `${item.name} - ${getChallengeValueLabel({ challengeType: item.challengeType, reward: item.reward })}`
                : item.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
