import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";

import { createGame, createTeam } from "@/api/gameApi";
import { PageLayout } from "@/components/Shared/PageLayout";
import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";
import { AVAILABLE_MAPS } from "@/utils/mapAssets";
import { TEAM_COLORS } from "@/utils/setupHelpers";

type DraftTeam = {
  id: string;
  color: string;
  name: string;
  startingChips: string;
};

function newDraftTeam(index: number): DraftTeam {
  return {
    color: TEAM_COLORS[index % TEAM_COLORS.length],
    id: `${Date.now()}-${index}`,
    name: "",
    startingChips: "",
  };
}

export function ManualGameFormPage({
  onBack,
  onGameCreated,
}: {
  onBack: () => void;
  onGameCreated: (gameId: string) => void;
}) {
  const [gameName, setGameName] = useState("");
  const [selectedMapId, setSelectedMapId] = useState(AVAILABLE_MAPS[0]?.id ?? "");
  const [teams, setTeams] = useState<DraftTeam[]>([newDraftTeam(0), newDraftTeam(1)]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedMap = AVAILABLE_MAPS.find((m) => m.id === selectedMapId);

  const updateTeam = (teamId: string, patch: Partial<DraftTeam>) => {
    setTeams((current) => current.map((t) => (t.id === teamId ? { ...t, ...patch } : t)));
  };

  const addTeam = () => {
    setTeams((current) => [...current, newDraftTeam(current.length)]);
  };

  const removeTeam = (teamId: string) => {
    setTeams((current) => (current.length > 1 ? current.filter((t) => t.id !== teamId) : current));
  };

  const submit = async () => {
    const trimmedName = gameName.trim();
    const validTeams = teams
      .map((t) => ({
        color: t.color,
        name: t.name.trim(),
        startingChips: t.startingChips.trim() ? Number(t.startingChips) : null,
      }))
      .filter((t) => t.name.length > 0);

    if (!trimmedName) {
      Alert.alert("Game name missing", "Enter a name for the game.");
      return;
    }

    if (!selectedMap) {
      Alert.alert("Map missing", "Select a map.");
      return;
    }

    if (validTeams.length === 0) {
      Alert.alert("Teams missing", "Add at least one team.");
      return;
    }

    if (validTeams.some((t) => t.startingChips !== null && !Number.isFinite(t.startingChips))) {
      Alert.alert("Starting chips", "Starting chips must be a number.");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      const game = await createGame({
        mapHeight: selectedMap.mapHeight,
        mapImage: selectedMap.id,
        mapWidth: selectedMap.mapWidth,
        name: trimmedName,
      });
      await Promise.all(validTeams.map((t) => createTeam(game.id, t)));
      onGameCreated(game.id);
    } catch (nextError) {
      console.error(nextError);
      setError("Could not create the game.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <PageLayout onBack={onBack} title="New game">
      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      <View style={styles.screenStack}>
        <View style={styles.panel}>
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
          <Text style={styles.panelTitle}>Map</Text>
          <View style={styles.screenStack}>
            {AVAILABLE_MAPS.map((map) => (
              <Pressable
                key={map.id}
                onPress={() => setSelectedMapId(map.id)}
                style={[styles.menuListItem, selectedMapId === map.id && styles.setupOptionSelected]}
              >
                <MaterialIcons
                  color={selectedMapId === map.id ? colors.ink : colors.textSoft}
                  name="map"
                  size={20}
                />
                <Text style={[styles.tabText, { color: selectedMapId === map.id ? colors.ink : colors.textSoft }]}>
                  {map.name}
                </Text>
              </Pressable>
            ))}
          </View>
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
          onPress={submit}
          style={[styles.primaryButton, isCreating && styles.disabledButton]}
        >
          {isCreating ? (
            <ActivityIndicator color={colors.panel} />
          ) : (
            <MaterialIcons color={colors.panel} name="check" size={19} />
          )}
          <Text style={styles.primaryButtonText}>Create and continue</Text>
        </Pressable>
      </View>
    </PageLayout>
  );
}
