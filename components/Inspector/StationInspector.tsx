import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/Shared/Buttons";
import { styles } from "@/components/Shared/styles";
import type { StationStateResponse, TeamResponse } from "@/types/game";
import { colors } from "@/utils/colors";

export function StationInspector({
  hideHeader = false,
  isMutating,
  onAddStationChips,
  selectedTeamId,
  station,
  teamsById,
}: {
  hideHeader?: boolean;
  isMutating: boolean;
  onAddStationChips: (stationId: string, body: { chips: number; teamId: string }) => Promise<void>;
  selectedTeamId: string;
  station: StationStateResponse;
  teamsById: Map<string, TeamResponse>;
}) {
  const [chips, setChips] = useState(1);
  const owner = station.ownerTeamId ? teamsById.get(station.ownerTeamId) : null;
  const teams = Array.from(teamsById.values());

  return (
    <View style={styles.panel}>
      {hideHeader ? null : (
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>{station.name}</Text>
          <View style={styles.stationOwnerBadge}>
            <View style={[styles.legendDot, { backgroundColor: owner?.color ?? colors.stationEmpty }]} />
            <Text style={styles.stationOwnerText}>{owner?.name ?? "Unclaimed"}</Text>
          </View>
        </View>
      )}

      <View style={styles.chipBreakdown}>
        {teams.map((team) => {
          const chipState = station.chips.find((state) => state.teamId === team.id);

          return (
            <View key={team.id} style={styles.chipLine}>
              <View style={[styles.legendDot, { backgroundColor: team.color }]} />
              <Text style={styles.chipText}>{team.name}</Text>
              <Text style={styles.chipValue}>{chipState?.chipsOnStation ?? 0}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.formLabel}>Deposit chips</Text>
      <View style={styles.stepperRow}>
        <Pressable disabled={isMutating || chips <= 1} onPress={() => setChips((value) => Math.max(1, value - 1))} style={styles.stepperButton}>
          <MaterialIcons color={colors.ink} name="remove" size={22} />
        </Pressable>
        <TextInput
          keyboardType="number-pad"
          onChangeText={(value) => setChips(Math.max(1, Number(value) || 1))}
          style={[styles.chipInput, styles.stepperNumberInput]}
          value={String(chips)}
        />
        <Pressable disabled={isMutating} onPress={() => setChips((value) => value + 1)} style={styles.stepperButton}>
          <MaterialIcons color={colors.ink} name="add" size={22} />
        </Pressable>
      </View>

      <PrimaryButton
        disabled={isMutating || !selectedTeamId || chips < 1}
        icon="savings"
        label={isMutating ? "Saving..." : "Deposit chips"}
        onPress={() => onAddStationChips(station.id, { chips, teamId: selectedTeamId })}
      />
    </View>
  );
}
