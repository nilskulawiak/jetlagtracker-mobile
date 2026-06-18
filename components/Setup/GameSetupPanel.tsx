import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { PrimaryButton } from "@/components/Shared/Buttons";
import { styles } from "@/components/Shared/styles";
import type {
  CreateTeamRequest,
  PatchTeamRequest,
  TeamResponse,
} from "@/types/game";
import { colors } from "@/utils/colors";
import { TEAM_COLORS, confirmDelete, parsePositiveInteger } from "@/utils/setupHelpers";

function SectionHeader({
  label,
  isOpen,
  onToggle,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onToggle}
      style={[styles.panelHeader, { paddingVertical: 4 }]}
    >
      <Text style={styles.formLabel}>{label}</Text>
      <MaterialIcons
        color={colors.muted}
        name={isOpen ? "expand-less" : "expand-more"}
        size={20}
      />
    </Pressable>
  );
}

export function GameSetupPanel({
  challengeCount,
  isMutating,
  onCreateTeam,
  onDeleteTeam,
  onPatchTeam,
  onStartGame,
  teams,
}: {
  challengeCount: number;
  isMutating: boolean;
  onCreateTeam: (body: CreateTeamRequest) => Promise<void>;
  onDeleteTeam: (teamId: string) => Promise<void>;
  onPatchTeam: (teamId: string, body: PatchTeamRequest) => Promise<void>;
  onStartGame: (body: { numberOfChallenges: number }) => Promise<void>;
  teams: TeamResponse[];
}) {
  const [numberOfChallenges, setNumberOfChallenges] = useState(String(Math.max(1, Math.min(3, challengeCount || 1))));

  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [teamColor, setTeamColor] = useState(TEAM_COLORS[0]);
  const [teamName, setTeamName] = useState("");
  const [teamStartingChips, setTeamStartingChips] = useState("");

  const startCreatedGame = async () => {
    const parsedNumberOfChallenges = parsePositiveInteger(numberOfChallenges, "Number of challenges");
    if (parsedNumberOfChallenges === null) return;
    await onStartGame({ numberOfChallenges: parsedNumberOfChallenges });
  };

  const stepNumberOfChallenges = (direction: -1 | 1) => {
    setNumberOfChallenges((currentValue) => {
      const currentNumber = Number(currentValue);
      const safeNumber = Number.isInteger(currentNumber) && currentNumber > 0 ? currentNumber : 1;
      return String(Math.max(1, safeNumber + direction));
    });
  };

  // Team helpers
  const enterEditTeam = (team: TeamResponse) => {
    setEditingTeamId(team.id);
    setTeamName(team.name);
    setTeamColor(team.color);
    setTeamStartingChips(team.availableChips != null ? String(team.availableChips) : "");
    setIsTeamFormOpen(true);
  };

  const cancelEditTeam = () => {
    setEditingTeamId(null);
    setTeamName("");
    setTeamColor(TEAM_COLORS[0]);
    setTeamStartingChips("");
  };

  const submitTeam = async () => {
    const trimmedName = teamName.trim();
    if (!trimmedName) { Alert.alert("Team name", "Enter a team name."); return; }
    const chips = teamStartingChips.trim() ? parsePositiveInteger(teamStartingChips, "Starting chips") : null;
    if (teamStartingChips.trim() && chips === null) return;

    if (editingTeamId) {
      await onPatchTeam(editingTeamId, {
        name: trimmedName,
        color: teamColor,
        ...(chips != null && { availableChips: chips }),
      });
      setEditingTeamId(null);
    } else {
      await onCreateTeam({ color: teamColor, name: trimmedName, startingChips: chips });
    }
    setTeamName("");
    setTeamColor(TEAM_COLORS[0]);
    setTeamStartingChips("");
  };

  const handleDeleteTeam = (team: TeamResponse) => {
    confirmDelete(team.name, () => onDeleteTeam(team.id));
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Game setup</Text>

      <View style={styles.setupSection}>
        <Text style={styles.formLabel}>Challenges to reveal</Text>
        <View style={styles.stepperRow}>
          <Pressable
            accessibilityLabel="Reveal fewer challenges"
            accessibilityRole="button"
            disabled={isMutating || Number(numberOfChallenges) <= 1}
            onPress={() => stepNumberOfChallenges(-1)}
            style={[styles.stepperButton, isMutating && styles.disabledButton]}
          >
            <MaterialIcons color={colors.ink} name="remove" size={22} />
          </Pressable>
          <TextInput
            inputMode="numeric"
            keyboardType="number-pad"
            onChangeText={setNumberOfChallenges}
            style={[styles.chipInput, styles.stepperNumberInput]}
            value={numberOfChallenges}
          />
          <Pressable
            accessibilityLabel="Reveal more challenges"
            accessibilityRole="button"
            disabled={isMutating}
            onPress={() => stepNumberOfChallenges(1)}
            style={[styles.stepperButton, isMutating && styles.disabledButton]}
          >
            <MaterialIcons color={colors.ink} name="add" size={22} />
          </Pressable>
        </View>
        <PrimaryButton
          disabled={isMutating}
          icon="play-arrow"
          label={isMutating ? "Saving..." : "Start game"}
          onPress={startCreatedGame}
        />
      </View>

      <View style={styles.setupSection}>
        {teams.map((team) => (
          <View key={team.id} style={[styles.menuListItem, editingTeamId === team.id && { borderColor: colors.info }]}>
            <View style={[styles.legendDot, { backgroundColor: team.color }]} />
            <Text style={[styles.chipText, { flex: 1 }]}>{team.name}</Text>
            <Text style={styles.chipValue}>{team.availableChips ?? "–"}</Text>
            <Pressable disabled={isMutating} onPress={() => enterEditTeam(team)} style={{ padding: 6 }}>
              <MaterialIcons color={colors.ink} name="edit" size={18} />
            </Pressable>
            <Pressable disabled={isMutating} onPress={() => handleDeleteTeam(team)} style={{ padding: 6 }}>
              <MaterialIcons color={colors.danger} name="delete" size={18} />
            </Pressable>
          </View>
        ))}
        <SectionHeader
          label={editingTeamId ? "Edit team" : "Add team"}
          isOpen={isTeamFormOpen}
          onToggle={() => setIsTeamFormOpen((v) => !v)}
        />
        {isTeamFormOpen ? (
          <View style={{ gap: 8, marginTop: 4 }}>
            <TextInput
              onChangeText={setTeamName}
              placeholder="Team name"
              placeholderTextColor="#8a94a6"
              style={styles.menuInput}
              value={teamName}
            />
            <View style={styles.colorSwatchRow}>
              {TEAM_COLORS.map((color) => (
                <Pressable
                  accessibilityLabel={`Use color ${color}`}
                  accessibilityRole="button"
                  key={color}
                  onPress={() => setTeamColor(color)}
                  style={[styles.colorSwatch, { backgroundColor: color }, teamColor === color && styles.colorSwatchSelected]}
                />
              ))}
            </View>
            <TextInput
              inputMode="numeric"
              keyboardType="number-pad"
              onChangeText={setTeamStartingChips}
              placeholder="Starting chips"
              placeholderTextColor="#8a94a6"
              style={styles.menuInput}
              value={teamStartingChips}
            />
            <PrimaryButton
              disabled={isMutating}
              icon={editingTeamId ? "save" : "group-add"}
              label={editingTeamId ? "Save team" : "Add team"}
              onPress={submitTeam}
            />
            {editingTeamId ? (
              <Pressable onPress={cancelEditTeam} style={{ alignItems: "center", marginTop: 2 }}>
                <Text style={{ color: colors.muted, fontSize: 14 }}>Cancel edit</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

    </View>
  );
}
