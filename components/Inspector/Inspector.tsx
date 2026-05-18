import { Text, View } from "react-native";

import { ChallengeInspector } from "@/components/Inspector/ChallengeInspector";
import { StationInspector } from "@/components/Inspector/StationInspector";
import { styles } from "@/components/Shared/styles";
import type { ChallengeResponse, StationStateResponse, TeamResponse } from "@/types/game";

export function Inspector({
  challenge,
  isMutating,
  onAddStationChips,
  onCompleteChallenge,
  onFailChallenge,
  selectedTeamId,
  station,
  teams,
  teamsById,
}: {
  challenge: ChallengeResponse | null;
  isMutating: boolean;
  onAddStationChips: (stationId: string, body: { chips: number; teamId: string }) => Promise<void>;
  onCompleteChallenge: (challengeId: string, body: { teamId: string }) => Promise<void>;
  onFailChallenge: (challengeId: string, body: { teamId: string }) => Promise<void>;
  selectedTeamId: string;
  station: StationStateResponse | null;
  teams: TeamResponse[];
  teamsById: Map<string, TeamResponse>;
}) {
  if (station) {
    return (
      <StationInspector
        isMutating={isMutating}
        onAddStationChips={onAddStationChips}
        selectedTeamId={selectedTeamId}
        station={station}
        teamsById={teamsById}
      />
    );
  }

  if (challenge) {
    return (
      <ChallengeInspector
        challenge={challenge}
        isMutating={isMutating}
        onCompleteChallenge={onCompleteChallenge}
        onFailChallenge={onFailChallenge}
        selectedTeamId={selectedTeamId}
      />
    );
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Map selection</Text>
      <Text style={styles.emptyText}>Tap a station or challenge to inspect it and record an action.</Text>
    </View>
  );
}
