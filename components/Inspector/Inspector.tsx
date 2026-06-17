import { Text, View } from "react-native";

import { ChallengeInspector } from "@/components/Inspector/ChallengeInspector";
import { CreationInspector } from "@/components/Inspector/CreationInspector";
import { StationInspector } from "@/components/Inspector/StationInspector";
import { styles } from "@/components/Shared/styles";
import type {
  ChallengeResponse,
  FinishChallengeRequest,
  PatchChallengeRequest,
  PatchStationRequest,
  StartChallengeRequest,
  StationStateResponse,
  TeamResponse,
} from "@/types/game";

export function Inspector({
  challenge,
  hideHeader = false,
  isGameCreated,
  isMutating,
  onAddStationChips,
  onCompleteChallenge,
  onDeleteChallenge,
  onDeleteStation,
  onFailChallenge,
  onPatchChallenge,
  onPatchStation,
  onStartChallenge,
  selectedTeamId,
  station,
  teamsById
}: {
  challenge: ChallengeResponse | null;
  hideHeader?: boolean;
  isGameCreated: boolean;
  isMutating: boolean;
  onAddStationChips: (stationId: string, body: { chips: number; teamId: string }) => Promise<void>;
  onCompleteChallenge: (challengeId: string, body: FinishChallengeRequest) => Promise<void>;
  onDeleteChallenge: (id: string) => Promise<void>;
  onDeleteStation: (id: string) => Promise<void>;
  onFailChallenge: (challengeId: string, body: FinishChallengeRequest) => Promise<void>;
  onPatchChallenge: (id: string, body: PatchChallengeRequest) => Promise<void>;
  onPatchStation: (id: string, body: PatchStationRequest) => Promise<void>;
  onStartChallenge: (challengeId: string, body: StartChallengeRequest) => Promise<void>;
  selectedTeamId: string;
  station: StationStateResponse | null;
  teamsById: Map<string, TeamResponse>;
}) {
  if (isGameCreated && (station || challenge)) {
    return (
      <CreationInspector
        challenge={challenge}
        isMutating={isMutating}
        onDeleteChallenge={onDeleteChallenge}
        onDeleteStation={onDeleteStation}
        onPatchChallenge={onPatchChallenge}
        onPatchStation={onPatchStation}
        station={station}
      />
    );
  }

  if (station) {
    return (
      <StationInspector
        isMutating={isMutating}
        hideHeader={hideHeader}
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
        hideHeader={hideHeader}
        isMutating={isMutating}
        onCompleteChallenge={onCompleteChallenge}
        onFailChallenge={onFailChallenge}
        onStartChallenge={onStartChallenge}
        selectedTeamId={selectedTeamId}
      />
    );
  }

  return (
    <View style={[styles.panel]}>
      <Text style={[styles.panelTitle]}>Map selection</Text>
      <Text style={styles.emptyText}>Tap a station or challenge to inspect it and record an action.</Text>
    </View>
  );
}
