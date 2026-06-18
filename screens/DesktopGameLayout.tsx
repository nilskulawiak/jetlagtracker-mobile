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
  createdChallengeCount,
  gameActions,
  gameState,
  isGameCreated,
  isMutating,
  mutationError,
  selectedTeamId,
  stations,
  teams,
}: {
  actions: GameActionResponse[];
  challenges: ChallengeResponse[];
  createdChallengeCount: number;
  gameActions: ReturnType<typeof useGameActions>;
  gameState: GameState;
  isGameCreated: boolean;
  isMutating: boolean;
  mutationError: string | null;
  selectedTeamId: string;
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
        isMutating={isMutating}
        onAddStationChips={gameActions.addStationChips}
        onCompleteChallenge={gameActions.completeChallenge}
        onDeleteChallenge={gameActions.deleteChallenge}
        onDeleteStation={gameActions.deleteStation}
        onFailChallenge={gameActions.failChallenge}
        onPatchChallenge={gameActions.patchChallenge}
        onPatchStation={gameActions.patchStation}
        onStartChallenge={gameActions.startChallenge}
        onCreateChallenge={gameActions.createChallenge}
        onCreateStation={gameActions.createStation}
        onHoverChange={() => undefined}
        selectedTeamId={selectedTeamId}
        setupPanel={
          isGameCreated ? (
            <GameSetupPanel
              challengeCount={createdChallengeCount}
              isMutating={isMutating}
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
  );
}
