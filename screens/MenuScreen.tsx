import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createGameFromPreset, getApiBaseUrl, getGames, getPresets, setApiBaseUrl } from "@/api/gameApi";
import { styles } from "@/components/Shared/styles";
import type { GameResponse, PresetSummaryResponse } from "@/types/game";
import { colors } from "@/utils/colors";

type MenuMode = "home" | "continue" | "presets" | "presetForm" | "settings";

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

function normalizeBackendUrl(value: string) {
  const trimmedValue = value.trim();

  try {
    const url = new URL(trimmedValue);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function MenuScreen({ onOpenGame }: { onOpenGame: (gameId: string) => void }) {
  const [mode, setMode] = useState<MenuMode>("home");
  const [backendUrlDraft, setBackendUrlDraft] = useState(getApiBaseUrl());
  const [games, setGames] = useState<GameResponse[]>([]);
  const [presets, setPresets] = useState<PresetSummaryResponse[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<PresetSummaryResponse | null>(null);
  const [gameName, setGameName] = useState("");
  const [teams, setTeams] = useState<DraftTeam[]>([newDraftTeam(0), newDraftTeam(1)]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const loadGames = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await getGames();
      setGames(response.gameResponses ?? []);
      setMode("continue");
    } catch (nextError) {
      console.error(nextError);
      setError("Could not load games. Check the backend URL.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPresets = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await getPresets();
      setPresets(response ?? []);
      setMode("presets");
    } catch (nextError) {
      console.error(nextError);
      setError("Could not load presets. Check the backend URL.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startPresetForm = (preset: PresetSummaryResponse) => {
    setSelectedPreset(preset);
    setGameName(preset.name);
    setTeams([newDraftTeam(0), newDraftTeam(1)]);
    setError(null);
    setMode("presetForm");
  };

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
    if (!selectedPreset) return;

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
        presetId: selectedPreset.id,
        teams: validTeams,
      });
      onOpenGame(game.id);
    } catch (nextError) {
      console.error(nextError);
      setError("Could not create the game from this preset.");
    } finally {
      setIsCreating(false);
    }
  };

  const goHome = () => {
    setError(null);
    setMode("home");
  };

  const openSettings = () => {
    setBackendUrlDraft(getApiBaseUrl());
    setError(null);
    setMode("settings");
  };

  const saveSettings = () => {
    const normalizedUrl = normalizeBackendUrl(backendUrlDraft);

    if (!normalizedUrl) {
      setError("Enter a valid backend URL starting with http:// or https://.");
      return;
    }

    setApiBaseUrl(normalizedUrl);
    setBackendUrlDraft(normalizedUrl);
    setError(null);
    setMode("home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {mode !== "home" ? (
              <Pressable
                accessibilityLabel="Back"
                accessibilityRole="button"
                onPress={mode === "presetForm" ? loadPresets : goHome}
                style={[styles.iconButton, styles.headerBackButton]}
              >
                <MaterialIcons color={colors.ink} name="arrow-back" size={22} />
              </Pressable>
            ) : null}
            <View style={styles.titleBlock}>
              <Text style={styles.kicker}>Jet Lag tracker</Text>
              <Text numberOfLines={1} style={styles.title}>
                {mode === "continue"
                  ? "Continue game"
                  : mode === "presetForm"
                    ? "New game"
                    : mode === "settings"
                      ? "Settings"
                      : "Menu"}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            mode === "continue" ? (
              <RefreshControl refreshing={isLoading} onRefresh={loadGames} />
            ) : mode === "presets" ? (
              <RefreshControl refreshing={isLoading} onRefresh={loadPresets} />
            ) : undefined
          }
        >
          {error ? <Text style={styles.inlineError}>{error}</Text> : null}

          {mode === "home" ? (
            <View style={styles.screenStack}>
              <MenuButton icon="play-arrow" label="Continue game" onPress={loadGames} />
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Create game</Text>
                <View style={styles.menuButtonStack}>
                  <MenuButton disabled={isLoading} icon="edit" label="Create game manually" onPress={() => undefined} />
                  <MenuButton disabled={isLoading} icon="auto-awesome" label="Create game from preset" onPress={loadPresets} />
                </View>
              </View>
              <MenuButton disabled={isLoading} icon="settings" label="Settings" onPress={openSettings} />
            </View>
          ) : null}

          {isLoading && mode !== "home" ? (
            <View style={styles.centerState}>
              <ActivityIndicator color={colors.info} />
              <Text style={styles.centerText}>Loading...</Text>
            </View>
          ) : null}

          {!isLoading && mode === "continue" ? (
            <View style={styles.screenStack}>
              {games.length === 0 ? <Text style={styles.emptyText}>No games found.</Text> : null}
              {games.map((game) => (
                <Pressable key={game.id} onPress={() => onOpenGame(game.id)} style={styles.menuListItem}>
                  <View style={styles.actionBody}>
                    <Text style={styles.teamName}>{game.name}</Text>
                    <Text style={styles.emptyText}>{game.status}</Text>
                  </View>
                  <MaterialIcons color={colors.info} name="chevron-right" size={24} />
                </Pressable>
              ))}
            </View>
          ) : null}

          {!isLoading && mode === "presets" ? (
            <View style={styles.screenStack}>
              {presets.length === 0 ? <Text style={styles.emptyText}>No presets found.</Text> : null}
              {presets.map((preset) => (
                <Pressable key={preset.id} onPress={() => startPresetForm(preset)} style={styles.menuListItem}>
                  <View style={styles.actionBody}>
                    <Text style={styles.teamName}>{preset.name}</Text>
                    <Text style={styles.emptyText}>{preset.id}</Text>
                  </View>
                  <MaterialIcons color={colors.info} name="chevron-right" size={24} />
                </Pressable>
              ))}
            </View>
          ) : null}

          {mode === "presetForm" && selectedPreset ? (
            <View style={styles.screenStack}>
              <View style={styles.panel}>
                <Text style={styles.formLabel}>Preset</Text>
                <Text style={styles.panelTitle}>{selectedPreset.name}</Text>
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
          ) : null}

          {mode === "settings" ? (
            <View style={styles.screenStack}>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Backend</Text>
                <Text style={styles.formLabel}>URL</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  inputMode="url"
                  keyboardType="url"
                  onChangeText={setBackendUrlDraft}
                  placeholder="http://192.168.0.10:8080"
                  placeholderTextColor="#8a94a6"
                  style={styles.menuInput}
                  value={backendUrlDraft}
                />
              </View>

              <Pressable onPress={saveSettings} style={styles.primaryButton}>
                <MaterialIcons color={colors.panel} name="save" size={19} />
                <Text style={styles.primaryButtonText}>Save settings</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MenuButton({
  disabled = false,
  icon,
  label,
  onPress,
}: {
  disabled?: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.menuButton, disabled && styles.disabledButton]}>
      <MaterialIcons color={colors.panel} name={icon} size={21} />
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}
