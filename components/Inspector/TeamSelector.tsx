import { Pressable, ScrollView, Text, View } from "react-native";

import { styles } from "@/components/Shared/styles";
import type { TeamResponse } from "@/types/game";

export function TeamSelector({
  compact = false,
  disabled,
  selectedTeamId,
  teams,
  onSelect,
}: {
  compact?: boolean;
  disabled: boolean;
  selectedTeamId: string;
  teams: TeamResponse[];
  onSelect: (teamId: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.selectorRow, compact && styles.selectorRowCompact]}>
        {teams.map((team) => {
          const selected = selectedTeamId === team.id;

          return (
            <Pressable
              disabled={disabled}
              key={team.id}
              onPress={() => onSelect(team.id)}
              style={[styles.teamOption, selected && { borderColor: team.color, backgroundColor: "#ffffff" }]}
            >
              <View style={[styles.teamOptionDot, { backgroundColor: team.color }]} />
              <Text style={styles.teamOptionText}>{team.name}</Text>
              <Text style={styles.teamOptionCoins}>{team.availableChips}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
