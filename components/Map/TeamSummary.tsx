import { Text, View } from "react-native";

import { mapStyles } from "@/components/Map/mapStyles";
import { styles } from "@/components/Shared/styles";
import type { StationStateResponse, TeamResponse } from "@/types/game";

export function TeamSummary({
  stations,
  teams,
}: {
  stations: StationStateResponse[];
  teams: TeamResponse[];
}) {
  const stationCounts = new Map<string, number>();

  stations.forEach((station) => {
    if (station.ownerTeamId) {
      stationCounts.set(station.ownerTeamId, (stationCounts.get(station.ownerTeamId) ?? 0) + 1);
    }
  });

  const unclaimedStations = stations.filter((station) => !station.ownerTeamId).length;

  return (
    <View style={mapStyles.teamSummaryPanel}>
      <View style={styles.panelHeader}>
        <Text style={mapStyles.teamSummaryTitle}>Teams</Text>
        <Text style={mapStyles.teamSummaryMeta}>{unclaimedStations} unclaimed</Text>
      </View>

      <View style={mapStyles.teamSummaryList}>
        {teams.map((team) => (
          <View key={team.id} style={mapStyles.teamSummaryRow}>
            <View style={[styles.legendDot, { backgroundColor: team.color }]} />
            <Text numberOfLines={1} style={mapStyles.teamSummaryName}>
              {team.name}
            </Text>
            <View style={mapStyles.teamSummaryStatCell}>
              <Text style={mapStyles.teamSummaryStatValue}>{stationCounts.get(team.id) ?? 0}</Text>
              <Text style={mapStyles.teamSummaryStatLabel}>Stations</Text>
            </View>
            <View style={mapStyles.teamSummaryStatCell}>
              <Text style={mapStyles.teamSummaryStatValue}>{team.availableChips}</Text>
              <Text style={mapStyles.teamSummaryStatLabel}>Chips</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
