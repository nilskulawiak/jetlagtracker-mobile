import { Text, View } from "react-native";

import { Stat } from "@/components/Shared/Stat";
import { styles } from "@/components/Shared/styles";
import type { StationStateResponse, TeamResponse } from "@/types/game";
import { getTeamChipTotal } from "@/utils/gameSelectors";

export function TeamsScreen({
  ownedStationCounts,
  stations,
  teams,
}: {
  ownedStationCounts: Map<string, number>;
  stations: StationStateResponse[];
  teams: TeamResponse[];
}) {
  return (
    <View style={styles.screenStack}>
      {teams.map((team) => {
        const controlledStations = stations.filter((station) => station.ownerTeamId === team.id);

        return (
          <View key={team.id} style={styles.teamCard}>
            <View style={[styles.teamColorBar, { backgroundColor: team.color }]} />
            <View style={styles.teamCardBody}>
              <View style={styles.panelHeader}>
                <Text style={styles.teamName}>{team.name}</Text>
                <Text style={styles.coinText}>{team.availableChips} coins</Text>
              </View>
              <View style={styles.statGrid}>
                <Stat label="Owned stations" value={String(ownedStationCounts.get(team.id) ?? 0)} />
                <Stat label="Placed chips" value={String(getTeamChipTotal(stations, team.id))} />
              </View>
              {controlledStations.length > 0 ? (
                <Text style={styles.stationList}>{controlledStations.map((station) => station.name).join(", ")}</Text>
              ) : (
                <Text style={styles.emptyText}>No stations controlled.</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
