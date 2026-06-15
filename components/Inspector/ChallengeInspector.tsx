import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { PrimaryButton, SecondaryButton } from "@/components/Shared/Buttons";
import { Stat } from "@/components/Shared/Stat";
import { styles } from "@/components/Shared/styles";
import type { ChallengeResponse, StartChallengeRequest } from "@/types/game";
import { getChallengeStatusColor, isChallengeDone } from "@/utils/colors";
import { getChallengeValueLabel } from "@/utils/challengeDisplay";
import { colors } from "@/utils/colors";

export function ChallengeInspector({
  challenge,
  hideHeader = false,
  isMutating,
  onCompleteChallenge,
  onFailChallenge,
  onStartChallenge,
  selectedTeamId,
}: {
  challenge: ChallengeResponse;
  hideHeader?: boolean;
  isMutating: boolean;
  onCompleteChallenge: (challengeId: string, body: { teamId: string }) => Promise<void>;
  onFailChallenge: (challengeId: string, body: { teamId: string }) => Promise<void>;
  onStartChallenge: (challengeId: string, body: StartChallengeRequest) => Promise<void>;
  selectedTeamId: string;
}) {
  const [callShot, setCallShot] = useState(1);

  const selectedTeamAttempt = challenge.challengeAttempts.find((a) => a.teamId === selectedTeamId);
  const isStarted = selectedTeamAttempt !== undefined;
  const isInProgress = selectedTeamAttempt?.status === "IN_PROGRESS";
  const isGloballyDone = isChallengeDone(challenge.status);

  const showDescription = isStarted || isGloballyDone;
  const showStartButton = !isStarted && challenge.status === "AVAILABLE";
  const showCompleteFailButtons = isInProgress && !isGloballyDone;
  const actionsDisabled = isMutating || !selectedTeamId;

  const handleStart = () => {
    const body: StartChallengeRequest = { teamId: selectedTeamId };
    if (challenge.challengeType === "CALL_YOUR_SHOT") {
      body.callShot = callShot;
    }
    onStartChallenge(challenge.id, body);
  };

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

      {showDescription ? (
        <Text style={styles.description}>{challenge.description}</Text>
      ) : (
        <Text style={[styles.description, { color: colors.muted, fontStyle: "italic" }]}>
          Start this challenge to reveal the description.
        </Text>
      )}

      <View style={styles.statGrid}>
        <Stat label="Reward" value={getChallengeValueLabel(challenge)} />
        <Stat label="Location" value={`${challenge.xCoordinate}, ${challenge.yCoordinate}`} />
      </View>

      {showStartButton ? (
        <>
          {challenge.challengeType === "CALL_YOUR_SHOT" ? (
            <>
              <Text style={styles.formLabel}>Call your shot</Text>
              <View style={styles.stepperRow}>
                <Pressable
                  disabled={actionsDisabled || callShot <= 1}
                  onPress={() => setCallShot((v) => Math.max(1, v - 1))}
                  style={styles.stepperButton}
                >
                  <MaterialIcons color={colors.ink} name="remove" size={22} />
                </Pressable>
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={(value) => setCallShot(Math.max(1, Number(value) || 1))}
                  style={[styles.chipInput, styles.stepperNumberInput]}
                  value={String(callShot)}
                />
                <Pressable
                  disabled={actionsDisabled}
                  onPress={() => setCallShot((v) => v + 1)}
                  style={styles.stepperButton}
                >
                  <MaterialIcons color={colors.ink} name="add" size={22} />
                </Pressable>
              </View>
            </>
          ) : null}
          <View style={styles.actionRow}>
            <PrimaryButton
              disabled={actionsDisabled}
              icon="play-arrow"
              label={isMutating ? "Saving..." : "Start"}
              onPress={handleStart}
            />
          </View>
        </>
      ) : null}

      {showCompleteFailButtons ? (
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
