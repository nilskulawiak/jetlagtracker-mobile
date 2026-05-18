import { ScrollView, Text, View } from "react-native";

import { styles } from "@/components/Shared/styles";
import type { TeamResponse } from "@/types/game";
import { colors } from "@/utils/colors";

export function MapLegend({ teams }: { teams: TeamResponse[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legendScroller}>
      <View style={styles.legendRow}>
        {teams.map((team) => (
          <View key={team.id} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: team.color }]} />
            <Text style={styles.legendText}>{team.name}</Text>
          </View>
        ))}
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.stationEmpty, borderColor: "#b8c2d4", borderWidth: 1 }]} />
          <Text style={styles.legendText}>Unclaimed</Text>
        </View>
      </View>
    </ScrollView>
  );
}
