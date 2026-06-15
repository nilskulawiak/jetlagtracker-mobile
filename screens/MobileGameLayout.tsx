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
  clearMapSelection,
  createdChallengeCount,
  error,
  gameActions,
  gameState,
  isGameCreated,
  isLoading,
  isMutating,
  loadGameState,
  ownedStationCounts,
  selectChallenge,
  selectedChallengeId,
  selectedStationId,
  selectedTeamId,
  selectStation,
  stations,
  teams,
}: {
  actions: GameActionResponse[];
  challenges: ChallengeResponse[];
  clearMapSelection: () => void;
  createdChallengeCount: number;
  error: string | null;
  gameActions: ReturnType<typeof useGameActions>;
  gameState: GameState;
  isGameCreated: boolean;
  isLoading: boolean;
  isMutating: boolean;
  loadGameState: () => void;
  ownedStationCounts: ReturnType<typeof getOwnedStationCounts>;
  selectChallenge: (id: string) => void;
  selectedChallengeId: string | null;
  selectedStationId: string | null;
  selectedTeamId: string;
  selectStation: (id: string) => void;
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
            isMutating={isMutating || isGameCreated}
            onAddStationChips={gameActions.addStationChips}
            onCompleteChallenge={gameActions.completeChallenge}
            onFailChallenge={gameActions.failChallenge}
            onStartChallenge={gameActions.startChallenge}
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
                  challenges={challenges}
                  isMutating={isMutating}
                  onCreateChallenge={gameActions.createChallenge}
                  onCreateStation={gameActions.createStation}
                  onCreateTeam={gameActions.createTeam}
                  onDeleteChallenge={gameActions.deleteChallenge}
                  onDeleteStation={gameActions.deleteStation}
                  onDeleteTeam={gameActions.deleteTeam}
                  onPatchChallenge={gameActions.patchChallenge}
                  onPatchStation={gameActions.patchStation}
                  onPatchTeam={gameActions.patchTeam}
                  onStartGame={gameActions.startGame}
                  stations={stations}
                  teams={teams}
                />
              ) : undefined
            }
            stations={stations}
            teams={teams}
          />
        </View>
        <TabBar selectedTab={selectedTab} onSelectTab={setSelectedTab} />
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
        {selectedTab === "log" ? <ActionLog actions={actions} /> : null}
      </ScrollView>
      <TabBar selectedTab={selectedTab} onSelectTab={setSelectedTab} />
    </>
  );
}

function TabBar({
  selectedTab,
  onSelectTab,
}: {
  selectedTab: Tab;
  onSelectTab: (tab: Tab) => void;
}) {
  return (
    <View style={[styles.tabBar, styles.mobileTabBar]}>
      <TabButton compact active={selectedTab === "map"} icon="map" label="Map" onPress={() => onSelectTab("map")} />
      <TabButton compact active={selectedTab === "teams"} icon="groups" label="Teams" onPress={() => onSelectTab("teams")} />
      <TabButton compact active={selectedTab === "log"} icon="history" label="Log" onPress={() => onSelectTab("log")} />
    </View>
  );
}
