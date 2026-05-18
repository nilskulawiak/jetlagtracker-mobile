import { Text, View } from "react-native";

import { styles } from "@/components/Shared/styles";
import type { ChallengeResponse, StationStateResponse, TeamResponse } from "@/types/game";
import { colors, getChallengeStatusColor, isChallengeVisible } from "@/utils/colors";
import { scaleCoordinate } from "@/utils/coordinate";

export function ChallengeMarkers({
  challenges,
  mapHeight,
  mapWidth,
  renderedMapHeight,
  renderedMapWidth,
  selectedChallengeId,
}: {
  challenges: ChallengeResponse[];
  mapHeight: number;
  mapWidth: number;
  renderedMapHeight: number;
  renderedMapWidth: number;
  selectedChallengeId: string | null;
}) {
  return challenges.filter((challenge) => isChallengeVisible(challenge.status)).map((challenge) => (
    <View
      accessibilityLabel={`${challenge.name}, ${challenge.rewardChips} chips`}
      key={challenge.id}
      pointerEvents="none"
      style={[
        styles.markerTouchTarget,
        {
          left: scaleCoordinate(challenge.xCoordinate, mapWidth, renderedMapWidth),
          top: scaleCoordinate(challenge.yCoordinate, mapHeight, renderedMapHeight),
        },
        selectedChallengeId === challenge.id && styles.markerSelectedTarget,
      ]}
    >
      <View
        style={[
          styles.challengeMarker,
          { backgroundColor: getChallengeStatusColor(challenge.status) },
          selectedChallengeId === challenge.id && styles.markerSelected,
        ]}
      >
        <Text style={styles.challengeMarkerText}>{challenge.rewardChips}</Text>
      </View>
    </View>
  ));
}

export function StationMarkers({
  mapHeight,
  mapWidth,
  renderedMapHeight,
  renderedMapWidth,
  selectedStationId,
  stations,
  teamsById,
}: {
  mapHeight: number;
  mapWidth: number;
  renderedMapHeight: number;
  renderedMapWidth: number;
  selectedStationId: string | null;
  stations: StationStateResponse[];
  teamsById: Map<string, TeamResponse>;
}) {
  return stations.map((station) => {
    const owner = station.ownerTeamId ? teamsById.get(station.ownerTeamId) : undefined;

    return (
      <View
        accessibilityLabel={station.name}
        key={station.id}
        pointerEvents="none"
        style={[
          styles.markerTouchTarget,
          {
            left: scaleCoordinate(station.xCoordinate, mapWidth, renderedMapWidth),
            top: scaleCoordinate(station.yCoordinate, mapHeight, renderedMapHeight),
          },
          selectedStationId === station.id && styles.markerSelectedTarget,
        ]}
      >
        <View
          style={[
            styles.stationMarker,
            { backgroundColor: owner?.color ?? colors.stationEmpty },
            selectedStationId === station.id && styles.markerSelected,
          ]}
        />
      </View>
    );
  });
}
