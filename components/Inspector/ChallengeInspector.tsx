import { Text, View } from "react-native";

import { PrimaryButton, SecondaryButton } from "@/components/Shared/Buttons";
import { Stat } from "@/components/Shared/Stat";
import { styles } from "@/components/Shared/styles";
import type { ChallengeResponse } from "@/types/game";
import { getChallengeStatusColor, isChallengeDone } from "@/utils/colors";
import { getChallengeValueLabel } from "@/utils/challengeDisplay";

export function ChallengeInspector({
  challenge,
  hideHeader = false,
  isMutating,
  onCompleteChallenge,
  onFailChallenge,
  selectedTeamId,
}: {
  challenge: ChallengeResponse;
  hideHeader?: boolean;
  isMutating: boolean;
  onCompleteChallenge: (challengeId: string, body: { teamId: string }) => Promise<void>;
  onFailChallenge: (challengeId: string, body: { teamId: string }) => Promise<void>;
  selectedTeamId: string;
}) {
  const showActions = !isChallengeDone(challenge.status);
  const actionsDisabled = isMutating || !selectedTeamId;

  return (
    <View style={styles.panel}>
      {hideHeader ? null : (
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>{challenge.name}</Text>
          <Text style={[styles.challengeStatus, { color: getChallengeStatusColor(challenge.status) }]}>
            {challenge.status}
          </Text>
        </View>
      )}
      <Text style={styles.description}>{challenge.description}</Text>

      <View style={styles.statGrid}>
        <Stat label="Reward" value={getChallengeValueLabel(challenge)} />
        <Stat label="Location" value={`${challenge.xCoordinate}, ${challenge.yCoordinate}`} />
      </View>

      {showActions ? (
        <View style={styles.actionRow}>
          <PrimaryButton
            disabled={actionsDisabled}
            icon="check-circle"
            label={isMutating ? "Saving..." : "Complete"}
            onPress={() => onCompleteChallenge(challenge.id, { teamId: selectedTeamId })}
          />
          <SecondaryButton
            disabled={actionsDisabled}
            icon="cancel"
            label="Fail"
            onPress={() => onFailChallenge(challenge.id, { teamId: selectedTeamId })}
          />
        </View>
      ) : null}
    </View>
  );
}
