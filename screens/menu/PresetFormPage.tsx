import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";

import { createGameFromPreset } from "@/api/gameApi";
import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";
import type { PresetSummaryResponse } from "@/types/game";
import { PageLayout } from "@/components/Shared/PageLayout";

type DraftTeam = {
  id: string;
  color: string;
  name: string;
  startingChips: string;
};

const TEAM_COLORS = ["#d92d20", "#1570ef", "#039855", "#dc6803", "#7f56d9", "#0891b2"];

function newDraftTeam(index: number): DraftTeam {
  return {
    color: TEAM_COLORS[index % TEAM_COLORS.length],
    id: `${Date.now()}-${index}`,
    name: "",
    startingChips: "",
  };
}

export function PresetFormPage({
  onBack,
  onGameCreated,
  preset,
}: {
  onBack: () => void;
  onGameCreated: (gameId: string) => void;
  preset: PresetSummaryResponse;
}) {
  const [gameName, setGameName] = useState(preset.name);
  const [teams, setTeams] = useState<DraftTeam[]>([newDraftTeam(0), newDraftTeam(1)]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTeam = (teamId: string, patch: Partial<DraftTeam>) => {
    setTeams((currentTeams) =>
      currentTeams.map((team) => (team.id === teamId ? { ...team, ...patch } : team)),
    );
  };

  const addTeam = () => {
    setTeams((currentTeams) => [...currentTeams, newDraftTeam(currentTeams.length)]);
  };

  const removeTeam = (teamId: string) => {
    setTeams((currentTeams) =>
      currentTeams.length > 1 ? currentTeams.filter((team) => team.id !== teamId) : currentTeams,
    );
  };

  const submitPresetGame = async () => {
    const trimmedName = gameName.trim();
    const validTeams = teams
      .map((team) => ({
        color: team.color,
        name: team.name.trim(),
        startingChips: team.startingChips.trim() ? Number(team.startingChips) : null,
      }))
      .filter((team) => team.name.length > 0);

    if (!trimmedName) {
      Alert.alert("Game name missing", "Enter a name for the game.");
      return;
    }

    if (validTeams.length === 0) {
      Alert.alert("Teams missing", "Add at least one team.");
      return;
    }

    if (validTeams.some((team) => team.startingChips !== null && !Number.isFinite(team.startingChips))) {
      Alert.alert("Starting chips", "Starting chips must be a number.");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      const game = await createGameFromPreset({
        name: trimmedName,
        presetId: preset.id,
        teams: validTeams,
      });
      onGameCreated(game.id);
    } catch (nextError) {
      console.error(nextError);
      setError("Could not create the game from this preset.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <PageLayout onBack={onBack} title="New game">
      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      <View style={styles.screenStack}>
        <View style={styles.panel}>
          <Text style={styles.formLabel}>Preset</Text>
          <Text style={styles.panelTitle}>{preset.name}</Text>
          <Text style={styles.formLabel}>Game name</Text>
          <TextInput
            onChangeText={setGameName}
            placeholder="Game name"
            placeholderTextColor="#8a94a6"
            style={styles.menuInput}
            value={gameName}
          />
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Teams</Text>
            <Pressable accessibilityLabel="Add team" accessibilityRole="button" onPress={addTeam} style={styles.iconButton}>
              <MaterialIcons color={colors.ink} name="add" size={22} />
            </Pressable>
          </View>

          <View style={styles.screenStack}>
            {teams.map((team, index) => (
              <View key={team.id} style={styles.teamDraftCard}>
                <View style={styles.panelHeader}>
                  <Text style={styles.actionType}>Team {index + 1}</Text>
                  <Pressable
                    accessibilityLabel="Remove team"
                    accessibilityRole="button"
                    disabled={teams.length === 1}
                    onPress={() => removeTeam(team.id)}
                    style={[styles.iconButton, teams.length === 1 && styles.disabledButton]}
                  >
                    <MaterialIcons color={colors.danger} name="delete-outline" size={20} />
                  </Pressable>
                </View>

                <Text style={styles.formLabel}>Name</Text>
                <TextInput
                  onChangeText={(name) => updateTeam(team.id, { name })}
                  placeholder="Team name"
                  placeholderTextColor="#8a94a6"
                  style={styles.menuInput}
                  value={team.name}
                />

                <Text style={styles.formLabel}>Color</Text>
                <View style={styles.colorSwatchRow}>
                  {TEAM_COLORS.map((color) => (
                    <Pressable
                      accessibilityLabel={`Use color ${color}`}
                      accessibilityRole="button"
                      key={color}
                      onPress={() => updateTeam(team.id, { color })}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        team.color === color && styles.colorSwatchSelected,
                      ]}
                    />
                  ))}
                </View>

                <Text style={styles.formLabel}>Starting chips</Text>
                <TextInput
                  inputMode="numeric"
                  keyboardType="number-pad"
                  onChangeText={(startingChips) => updateTeam(team.id, { startingChips })}
                  placeholder="Leave empty for none"
                  placeholderTextColor="#8a94a6"
                  style={styles.menuInput}
                  value={team.startingChips}
                />
              </View>
            ))}
          </View>
        </View>

        <Pressable
          disabled={isCreating}
          onPress={submitPresetGame}
          style={[styles.primaryButton, isCreating && styles.disabledButton]}
        >
          {isCreating ? <ActivityIndicator color={colors.panel} /> : <MaterialIcons color={colors.panel} name="check" size={19} />}
          <Text style={styles.primaryButtonText}>Create and continue</Text>
        </Pressable>
      </View>
    </PageLayout>
  );
}
