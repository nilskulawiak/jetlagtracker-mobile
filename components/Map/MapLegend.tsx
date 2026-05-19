import { ScrollView, Text, View } from "react-native";

import { mapStyles } from "@/components/Map/mapStyles";
import { styles } from "@/components/Shared/styles";
import type { TeamResponse } from "@/types/game";
import { colors } from "@/utils/colors";

export function MapLegend({ teams }: { teams: TeamResponse[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={mapStyles.legendScroller}>
      <View style={mapStyles.legendRow}>
        {teams.map((team) => (
          <View key={team.id} style={mapStyles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: team.color }]} />
            <Text style={mapStyles.legendText}>{team.name}</Text>
          </View>
        ))}
        <View style={mapStyles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.stationEmpty, borderColor: "#b8c2d4", borderWidth: 1 }]} />
          <Text style={mapStyles.legendText}>Unclaimed</Text>
        </View>
      </View>
    </ScrollView>
  );
}
