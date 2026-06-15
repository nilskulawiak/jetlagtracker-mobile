import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TeamSelector } from "@/components/Inspector/TeamSelector";
import { Pill } from "@/components/Shared/Pill";
import { styles } from "@/components/Shared/styles";
import { useGameActions } from "@/hooks/useGameActions";
import { useGameSelection } from "@/hooks/useGameSelection";
import { useGameState } from "@/hooks/useGameState";
import { useSelectedTeam } from "@/hooks/useSelectedTeam";
import { DesktopGameLayout } from "@/screens/DesktopGameLayout";
import { MobileGameLayout } from "@/screens/MobileGameLayout";
import { colors } from "@/utils/colors";
import { getOwnedStationCounts } from "@/utils/gameSelectors";

export function GameScreen({
  initialGameId,
  initialTeamId,
  onBackToMenu,
}: {
  initialGameId?: string;
  initialTeamId?: string;
  onBackToMenu?: () => void;
}) {
  const { width } = useWindowDimensions();
  const isMobileLayout = width < 700;
  const [showGameDetails, setShowGameDetails] = useState(false);
  const {
    error,
    gameId,
    gameState,
    isLoading,
    isMutating,
    loadGameState,
    mutationError,
    reload,
    runMutation,
  } = useGameState(initialGameId);

  const teams = gameState?.teams ?? [];
  const stations = gameState?.stations ?? [];
  const challenges = gameState?.challenges ?? [];
  const actions = gameState?.actions ?? [];
  const ownedStationCounts = getOwnedStationCounts(stations);
  const { selectedTeamId, setSelectedTeamId } = useSelectedTeam(teams, initialTeamId);
  const {
    clearMapSelection,
    selectChallenge,
    selectedChallengeId,
    selectedStationId,
    selectStation,
  } = useGameSelection();
  const gameActions = useGameActions({ gameId, runMutation });
  const isGameCreated = gameState?.game.status === "CREATED";
  const createdChallengeCount = challenges.filter((c) => c.status === "CREATED").length;

  const sharedLayoutProps = {
    actions,
    challenges,
    clearMapSelection,
    createdChallengeCount,
    gameActions,
    isGameCreated,
    isMutating,
    selectChallenge,
    selectedChallengeId,
    selectedStationId,
    selectedTeamId,
    selectStation,
    stations,
    teams,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
      >
        <View style={[styles.header, isMobileLayout && styles.mobileHeader]}>
          <View style={styles.headerTop}>
            {onBackToMenu ? (
              <Pressable
                accessibilityLabel="Back to menu"
                accessibilityRole="button"
                onPress={onBackToMenu}
                style={[styles.iconButton, isMobileLayout && styles.mobileIconButton, styles.headerBackButton]}
              >
                <MaterialIcons color={colors.ink} name="arrow-back" size={isMobileLayout ? 20 : 22} />
              </Pressable>
            ) : null}
            <View style={styles.titleBlock}>
              {isMobileLayout ? null : <Text style={styles.kicker}>Jet Lag tracker</Text>}
              <Text numberOfLines={1} style={[styles.title, isMobileLayout && styles.mobileTitle]}>
                {gameState?.game.name ?? "Taiwan"}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                accessibilityLabel="Game details"
                accessibilityRole="button"
                accessibilityState={{ expanded: showGameDetails }}
                onPress={() => setShowGameDetails((v) => !v)}
                style={[styles.iconButton, isMobileLayout && styles.mobileIconButton, showGameDetails && styles.iconButtonActive]}
              >
                <MaterialIcons color={showGameDetails ? colors.panel : colors.ink} name="tune" size={isMobileLayout ? 20 : 22} />
              </Pressable>
              <Pressable
                accessibilityLabel="Refresh game"
                accessibilityRole="button"
                onPress={reload}
                style={[styles.iconButton, isMobileLayout && styles.mobileIconButton]}
              >
                <MaterialIcons color={colors.ink} name="refresh" size={isMobileLayout ? 20 : 22} />
              </Pressable>
            </View>
          </View>

          {showGameDetails ? (
            <View style={styles.detailsPanel}>
              <View style={styles.detailsInlineRow}>
                <View style={styles.detailsStatusItem}>
                  <Pill label="Status" value={gameState?.game.status ?? "Loading"} />
                </View>
                {teams.length > 0 ? (
                  <View style={styles.detailsTeamSelector}>
                    <Text style={styles.compactInlineLabel}>Playing as</Text>
                    <TeamSelector
                      compact
                      disabled={isMutating}
                      selectedTeamId={selectedTeamId}
                      teams={teams}
                      onSelect={setSelectedTeamId}
                    />
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>

        {isLoading && !gameState ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={colors.info} />
            <Text style={styles.centerText}>Loading game state...</Text>
          </View>
        ) : error && !gameState ? (
          <View style={styles.centerState}>
            <MaterialIcons color={colors.danger} name="error-outline" size={32} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : gameState ? (
          isMobileLayout ? (
            <MobileGameLayout
              {...sharedLayoutProps}
              error={error}
              gameState={gameState}
              isLoading={isLoading}
              loadGameState={loadGameState}
              ownedStationCounts={ownedStationCounts}
            />
          ) : (
            <DesktopGameLayout
              {...sharedLayoutProps}
              gameState={gameState}
              mutationError={mutationError}
            />
          )
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
