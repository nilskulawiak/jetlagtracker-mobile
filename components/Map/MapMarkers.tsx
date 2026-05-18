import { Pressable, Text } from "react-native";

import { styles } from "@/components/Shared/styles";
import type { ChallengeResponse, StationStateResponse, TeamResponse } from "@/types/game";
import { colors, getChallengeStatusColor, isChallengeVisible } from "@/utils/colors";
import { scaleCoordinate } from "@/utils/coordinate";

export function ChallengeMarkers({
  challenges,
  mapHeight,
  mapWidth,
  onSelectChallenge,
  renderedMapHeight,
  renderedMapWidth,
  selectedChallengeId,
}: {
  challenges: ChallengeResponse[];
  mapHeight: number;
  mapWidth: number;
  onSelectChallenge: (challengeId: string) => void;
  renderedMapHeight: number;
  renderedMapWidth: number;
  selectedChallengeId: string | null;
}) {
  return challenges.filter((challenge) => isChallengeVisible(challenge.status)).map((challenge) => (
    <Pressable
      accessibilityLabel={`${challenge.name}, ${challenge.rewardChips} chips`}
      accessibilityRole="button"
      key={challenge.id}
      onPress={() => onSelectChallenge(challenge.id)}
      style={[
        styles.challengeMarker,
        {
          backgroundColor: getChallengeStatusColor(challenge.status),
          left: scaleCoordinate(challenge.xCoordinate, mapWidth, renderedMapWidth),
          top: scaleCoordinate(challenge.yCoordinate, mapHeight, renderedMapHeight),
        },
        selectedChallengeId === challenge.id && styles.markerSelected,
      ]}
    >
      <Text style={styles.challengeMarkerText}>{challenge.rewardChips}</Text>
    </Pressable>
  ));
}

export function StationMarkers({
  mapHeight,
  mapWidth,
  onSelectStation,
  renderedMapHeight,
  renderedMapWidth,
  selectedStationId,
  stations,
  teamsById,
}: {
  mapHeight: number;
  mapWidth: number;
  onSelectStation: (stationId: string) => void;
  renderedMapHeight: number;
  renderedMapWidth: number;
  selectedStationId: string | null;
  stations: StationStateResponse[];
  teamsById: Map<string, TeamResponse>;
}) {
  return stations.map((station) => {
    const owner = station.ownerTeamId ? teamsById.get(station.ownerTeamId) : undefined;

    return (
      <Pressable
        accessibilityLabel={station.name}
        accessibilityRole="button"
        key={station.id}
        onPress={() => onSelectStation(station.id)}
        style={[
          styles.stationMarker,
          {
            backgroundColor: owner?.color ?? colors.stationEmpty,
            left: scaleCoordinate(station.xCoordinate, mapWidth, renderedMapWidth),
            top: scaleCoordinate(station.yCoordinate, mapHeight, renderedMapHeight),
          },
          selectedStationId === station.id && styles.markerSelected,
        ]}
      />
    );
  });
}
