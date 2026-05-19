import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getGameState } from "@/api/gameApi";
import { styles } from "@/components/Shared/styles";
import type { GameState, TeamResponse } from "@/types/game";
import { colors } from "@/utils/colors";

export function TeamChoiceScreen({
  gameId,
  onBackToMenu,
  onSelectTeam,
}: {
  gameId: string;
  onBackToMenu: () => void;
  onSelectTeam: (teamId: string) => void;
}) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadGame = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const nextGameState = await getGameState(gameId);
      setGameState({
        ...nextGameState,
        teams: nextGameState.teams ?? [],
      });
    } catch (nextError) {
      console.error(nextError);
      setError("Could not load teams for this game. Check the backend URL.");
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    void loadGame();
  }, [loadGame]);

  const teams = gameState?.teams ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable
            accessibilityLabel="Back to menu"
            accessibilityRole="button"
            onPress={onBackToMenu}
            style={[styles.iconButton, styles.headerBackButton]}
          >
            <MaterialIcons color={colors.ink} name="arrow-back" size={22} />
          </Pressable>
          <View style={styles.titleBlock}>
            <Text style={styles.kicker}>Jet Lag tracker</Text>
            <Text numberOfLines={1} style={styles.title}>
              Choose your team
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadGame} />}
      >
        {error ? <Text style={styles.inlineError}>{error}</Text> : null}

        {isLoading && !gameState ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={colors.info} />
            <Text style={styles.centerText}>Loading teams...</Text>
          </View>
        ) : (
          <View style={styles.screenStack}>
            <View style={styles.panel}>
              <Text style={styles.formLabel}>Game</Text>
              <Text style={styles.panelTitle}>{gameState?.game.name ?? "Game"}</Text>
              <Text style={styles.emptyText}>Pick the team you are playing as for this session.</Text>
            </View>

            {teams.length === 0 ? <Text style={styles.emptyText}>This game does not have any teams yet.</Text> : null}
            {teams.map((team) => (
              <TeamChoiceOption key={team.id} team={team} onPress={() => onSelectTeam(team.id)} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TeamChoiceOption({ onPress, team }: { onPress: () => void; team: TeamResponse }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.menuListItem}>
      <View style={[styles.teamOptionDot, { backgroundColor: team.color }]} />
      <View style={styles.actionBody}>
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.emptyText}>{team.availableChips} chips available</Text>
      </View>
      <MaterialIcons color={colors.info} name="chevron-right" size={24} />
    </Pressable>
  );
}
