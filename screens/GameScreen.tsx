import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  addStationChips,
  API_BASE_URL,
  completeChallenge,
  createChallenge,
  createStation,
  createTeam,
  failChallenge,
  startGame,
} from "@/api/gameApi";
import { ActionLog } from "@/components/ActionLog/ActionLog";
import { TeamSelector } from "@/components/Inspector/TeamSelector";
import { mapStyles } from "@/components/Map/mapStyles";
import { MapScreen } from "@/components/Map/MapScreen";
import { Pill } from "@/components/Shared/Pill";
import { styles } from "@/components/Shared/styles";
import { TabButton } from "@/components/Shared/TabButton";
import { GameSetupPanel } from "@/components/Setup/GameSetupPanel";
import { TeamsScreen } from "@/components/Teams/TeamsScreen";
import { useGameState } from "@/hooks/useGameState";
import { colors } from "@/utils/colors";
import { getOwnedStationCounts } from "@/utils/gameSelectors";

type Tab = "map" | "teams" | "log";

export function GameScreen({
  initialGameId,
  onBackToMenu,
}: {
  initialGameId?: string;
  onBackToMenu?: () => void;
}) {
  const { width } = useWindowDimensions();
  const isMobileLayout = width < 700;
  const [selectedTab, setSelectedTab] = useState<Tab>("map");
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [showGameDetails, setShowGameDetails] = useState(false);
  const {
    error,
    gameId,
    gameState,
    isLoading,
    isMutating,
    loadGameState,
    reload,
    runMutation,
    setGameId,
  } = useGameState(initialGameId);

  const teams = gameState?.teams ?? [];
  const stations = gameState?.stations ?? [];
  const challenges = gameState?.challenges ?? [];
  const actions = gameState?.actions ?? [];
  const ownedStationCounts = getOwnedStationCounts(stations);
  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;
  const isGameCreated = gameState?.game.status === "CREATED";
  const createdChallengeCount = challenges.filter((challenge) => challenge.status === "CREATED").length;
  const showMapView = !isMobileLayout || selectedTab === "map";

  useEffect(() => {
    if (teams.length === 0) {
      setSelectedTeamId("");
      return;
    }

    if (!selectedTeamId || !teams.some((team) => team.id === selectedTeamId)) {
      setSelectedTeamId(teams[0].id);
    }
  }, [selectedTeamId, teams]);

  const selectStation = (stationId: string) => {
    setSelectedStationId(stationId);
    setSelectedChallengeId(null);
  };

  const selectChallenge = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
    setSelectedStationId(null);
  };

  const clearMapSelection = () => {
    setSelectedChallengeId(null);
    setSelectedStationId(null);
  };

  const tabs = (
    <View style={[styles.tabBar, isMobileLayout && styles.mobileTabBar]}>
      <TabButton
        active={selectedTab === "map"}
        compact={isMobileLayout}
        icon="map"
        label="Map"
        onPress={() => setSelectedTab("map")}
      />
      <TabButton
        active={selectedTab === "teams"}
        compact={isMobileLayout}
        icon="groups"
        label="Teams"
        onPress={() => setSelectedTab("teams")}
      />
      <TabButton
        active={selectedTab === "log"}
        compact={isMobileLayout}
        icon="history"
        label="Log"
        onPress={() => setSelectedTab("log")}
      />
    </View>
  );

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
                onPress={() => setShowGameDetails((value) => !value)}
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
              <View style={styles.metaRow}>
                <Pill label="Status" value={gameState?.game.status ?? "Loading"} />
                <Pill label="Playing as" value={selectedTeam?.name ?? "No team"} />
                <Pill label="API" value={API_BASE_URL.replace(/^https?:\/\//, "")} />
              </View>

              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={reload}
                placeholder="Game id"
                placeholderTextColor="#8a94a6"
                style={styles.gameIdInput}
                value={gameId}
                onChangeText={setGameId}
              />

              {teams.length > 0 ? (
                <>
                  <Text style={styles.formLabel}>Playing as</Text>
                  <TeamSelector
                    disabled={isMutating}
                    selectedTeamId={selectedTeamId}
                    teams={teams}
                    onSelect={setSelectedTeamId}
                  />
                </>
              ) : null}
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
        ) : showMapView && gameState ? (
          <View
            style={[
              mapStyles.content,
              !isMobileLayout && mapStyles.desktopContent,
              isMobileLayout && mapStyles.mobileContent,
            ]}
          >
            {error ? <Text style={styles.inlineError}>{error}</Text> : null}
            <MapScreen
              actions={actions}
              challenges={challenges}
              gameState={gameState}
              isMutating={isMutating || isGameCreated}
              onAddStationChips={(stationId, body) =>
                runMutation(() => addStationChips(gameId.trim(), stationId, body))
              }
              onCompleteChallenge={(challengeId, body) =>
                runMutation(() => completeChallenge(gameId.trim(), challengeId, body))
              }
              onFailChallenge={(challengeId, body) =>
                runMutation(() => failChallenge(gameId.trim(), challengeId, body))
              }
              onClearSelection={clearMapSelection}
              onHoverChange={() => undefined}
              onSelectChallenge={selectChallenge}
              onSelectStation={selectStation}
              selectedChallengeId={selectedChallengeId}
              selectedStationId={selectedStationId}
              selectedTeamId={selectedTeamId}
              setupPanel={
                isGameCreated ? (
                  <GameSetupPanel
                    challengeCount={createdChallengeCount}
                    isMutating={isMutating}
                    onCreateChallenge={(body) =>
                      runMutation(() => createChallenge(gameId.trim(), body))
                    }
                    onCreateStation={(body) =>
                      runMutation(() => createStation(gameId.trim(), body))
                    }
                    onCreateTeam={(body) =>
                      runMutation(() => createTeam(gameId.trim(), body))
                    }
                    onStartGame={(body) =>
                      runMutation(async () => {
                        await startGame(gameId.trim(), body);
                      })
                    }
                  />
                ) : undefined
              }
              stations={stations}
              teams={teams}
            />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadGameState} />}
          >
            {error ? <Text style={styles.inlineError}>{error}</Text> : null}

            {selectedTab === "teams" ? (
              <TeamsScreen ownedStationCounts={ownedStationCounts} stations={stations} teams={teams} />
            ) : null}

            {selectedTab === "log" ? <ActionLog actions={actions} /> : null}
          </ScrollView>
        )}
        {isMobileLayout ? tabs : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
