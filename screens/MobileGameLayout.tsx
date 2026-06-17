import { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { ActionLog } from "@/components/ActionLog/ActionLog";
import { mapStyles } from "@/components/Map/mapStyles";
import { MapScreen } from "@/components/Map/MapScreen";
import { GameSetupPanel } from "@/components/Setup/GameSetupPanel";
import { styles } from "@/components/Shared/styles";
import { TabButton } from "@/components/Shared/TabButton";
import { TeamsScreen } from "@/components/Teams/TeamsScreen";
import { useGameActions } from "@/hooks/useGameActions";
import { getOwnedStationCounts } from "@/utils/gameSelectors";
import type {
  ChallengeResponse,
  GameActionResponse,
  GameState,
  StationStateResponse,
  TeamResponse,
} from "@/types/game";

type Tab = "map" | "teams" | "log";

export function MobileGameLayout({
  actions,
  challenges,
  createdChallengeCount,
  error,
  gameActions,
  gameState,
  isGameCreated,
  isLoading,
  isMutating,
  loadGameState,
  ownedStationCounts,
  selectedTeamId,
  stations,
  teams,
}: {
  actions: GameActionResponse[];
  challenges: ChallengeResponse[];
  createdChallengeCount: number;
  error: string | null;
  gameActions: ReturnType<typeof useGameActions>;
  gameState: GameState;
  isGameCreated: boolean;
  isLoading: boolean;
  isMutating: boolean;
  loadGameState: () => void;
  ownedStationCounts: ReturnType<typeof getOwnedStationCounts>;
  selectedTeamId: string;
  stations: StationStateResponse[];
  teams: TeamResponse[];
}) {
  const [selectedTab, setSelectedTab] = useState<Tab>("map");

  if (selectedTab === "map") {
    return (
      <>
        <View style={[mapStyles.content, mapStyles.mobileContent]}>
          {error ? <Text style={styles.inlineError}>{error}</Text> : null}
          <MapScreen
            actions={actions}
            challenges={challenges}
            gameState={gameState}
            isGameCreated={isGameCreated}
            isMutating={isMutating}
            onAddStationChips={gameActions.addStationChips}
            onCompleteChallenge={gameActions.completeChallenge}
            onDeleteChallenge={gameActions.deleteChallenge}
            onDeleteStation={gameActions.deleteStation}
            onFailChallenge={gameActions.failChallenge}
            onPatchChallenge={gameActions.patchChallenge}
            onPatchStation={gameActions.patchStation}
            onStartChallenge={gameActions.startChallenge}
            onHoverChange={() => undefined}
            selectedTeamId={selectedTeamId}
            setupPanel={
              isGameCreated ? (
                <GameSetupPanel
                  challengeCount={createdChallengeCount}
                  isMutating={isMutating}
                  onCreateChallenge={gameActions.createChallenge}
                  onCreateStation={gameActions.createStation}
                  onCreateTeam={gameActions.createTeam}
                  onDeleteTeam={gameActions.deleteTeam}
                  onPatchTeam={gameActions.patchTeam}
                  onStartGame={gameActions.startGame}
                  teams={teams}
                />
              ) : undefined
            }
            stations={stations}
            teams={teams}
          />
        </View>
        <TabBar isGameCreated={isGameCreated} selectedTab={selectedTab} onSelectTab={setSelectedTab} />
      </>
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadGameState} />}
      >
        {error ? <Text style={styles.inlineError}>{error}</Text> : null}
        {selectedTab === "teams" ? (
          <TeamsScreen ownedStationCounts={ownedStationCounts} stations={stations} teams={teams} />
        ) : null}
        {selectedTab === "log" && !isGameCreated ? <ActionLog actions={actions} /> : null}
      </ScrollView>
      <TabBar isGameCreated={isGameCreated} selectedTab={selectedTab} onSelectTab={setSelectedTab} />
    </>
  );
}

function TabBar({
  isGameCreated,
  selectedTab,
  onSelectTab,
}: {
  isGameCreated: boolean;
  selectedTab: Tab;
  onSelectTab: (tab: Tab) => void;
}) {
  return (
    <View style={[styles.tabBar, styles.mobileTabBar]}>
      <TabButton compact active={selectedTab === "map"} icon="map" label="Map" onPress={() => onSelectTab("map")} />
      <TabButton compact active={selectedTab === "teams"} icon="groups" label="Teams" onPress={() => onSelectTab("teams")} />
      {isGameCreated ? null : (
        <TabButton compact active={selectedTab === "log"} icon="history" label="Log" onPress={() => onSelectTab("log")} />
      )}
    </View>
  );
}
