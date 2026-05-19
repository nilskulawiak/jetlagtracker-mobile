import { Text, View } from "react-native";

import { mapStyles } from "@/components/Map/mapStyles";
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
  showCreatedChallenges = false,
}: {
  challenges: ChallengeResponse[];
  mapHeight: number;
  mapWidth: number;
  renderedMapHeight: number;
  renderedMapWidth: number;
  selectedChallengeId: string | null;
  showCreatedChallenges?: boolean;
}) {
  return challenges.filter((challenge) => showCreatedChallenges || isChallengeVisible(challenge.status)).map((challenge) => (
    <View
      accessibilityLabel={`${challenge.name}, ${challenge.rewardChips} chips`}
      key={challenge.id}
      pointerEvents="none"
      style={[
        mapStyles.markerTouchTarget,
        {
          left: scaleCoordinate(challenge.xCoordinate, mapWidth, renderedMapWidth),
          top: scaleCoordinate(challenge.yCoordinate, mapHeight, renderedMapHeight),
        },
        selectedChallengeId === challenge.id && mapStyles.markerSelectedTarget,
      ]}
    >
      <View
        style={[
          mapStyles.challengeMarker,
          { backgroundColor: getChallengeStatusColor(challenge.status) },
          selectedChallengeId === challenge.id && mapStyles.markerSelected,
        ]}
      >
        <Text style={mapStyles.challengeMarkerText}>{challenge.rewardChips}</Text>
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
          mapStyles.markerTouchTarget,
          {
            left: scaleCoordinate(station.xCoordinate, mapWidth, renderedMapWidth),
            top: scaleCoordinate(station.yCoordinate, mapHeight, renderedMapHeight),
          },
          selectedStationId === station.id && mapStyles.markerSelectedTarget,
        ]}
      >
        <View
          style={[
            mapStyles.stationMarker,
            { backgroundColor: owner?.color ?? colors.stationEmpty },
            selectedStationId === station.id && mapStyles.markerSelected,
          ]}
        />
      </View>
    );
  });
}
