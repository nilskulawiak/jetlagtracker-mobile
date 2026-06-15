import { Text, View } from "react-native";

import { mapStyles } from "@/components/Map/mapStyles";
import { MapScreen } from "@/components/Map/MapScreen";
import { GameSetupPanel } from "@/components/Setup/GameSetupPanel";
import { styles } from "@/components/Shared/styles";
import { useGameActions } from "@/hooks/useGameActions";
import type {
  ChallengeResponse,
  GameActionResponse,
  GameState,
  StationStateResponse,
  TeamResponse,
} from "@/types/game";

export function DesktopGameLayout({
  actions,
  challenges,
  clearMapSelection,
  createdChallengeCount,
  gameActions,
  gameState,
  isGameCreated,
  isMutating,
  mutationError,
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
  gameActions: ReturnType<typeof useGameActions>;
  gameState: GameState;
  isGameCreated: boolean;
  isMutating: boolean;
  mutationError: string | null;
  selectChallenge: (id: string) => void;
  selectedChallengeId: string | null;
  selectedStationId: string | null;
  selectedTeamId: string;
  selectStation: (id: string) => void;
  stations: StationStateResponse[];
  teams: TeamResponse[];
}) {
  return (
    <View style={[mapStyles.content, mapStyles.desktopContent]}>
      {mutationError ? <Text style={styles.inlineError}>{mutationError}</Text> : null}
      <MapScreen
        actions={actions}
        challenges={challenges}
        gameState={gameState}
        isGameCreated={isGameCreated}
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
  );
}
