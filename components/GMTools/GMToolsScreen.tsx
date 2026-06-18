import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  deleteChallengeAttempt,
  patchChallenge,
  patchTeam,
  revertChallengeToCreated,
  setStationChips,
} from "@/api/gameApi";
import { TabButton } from "@/components/Shared/TabButton";
import { styles as sharedStyles } from "@/components/Shared/styles";
import type {
  ChallengeResponse,
  GameState,
  StationStateResponse,
  TeamResponse,
} from "@/types/game";
import { colors } from "@/utils/colors";

type Tab = "teams" | "stations" | "challenges";

type Props = {
  gameId: string;
  gameState: GameState;
  onClose: () => void;
  reload: () => void;
  visible: boolean;
};

export function GMToolsScreen({ gameId, gameState, onClose, reload, visible }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("teams");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const [teamChips, setTeamChips] = useState<Record<string, string>>({});
  const [stationChipValues, setStationChipValues] = useState<Record<string, string>>({});
  const [challengeRewards, setChallengeRewards] = useState<Record<string, string>>({});

  useEffect(() => {
    const newTeamChips: Record<string, string> = {};
    for (const team of gameState.teams) {
      newTeamChips[team.id] = String(team.availableChips);
    }
    setTeamChips(newTeamChips);

    const newStationChips: Record<string, string> = {};
    for (const station of gameState.stations) {
      for (const team of gameState.teams) {
        const chipState = station.chips.find((c) => c.teamId === team.id);
        newStationChips[`${station.id}:${team.id}`] = String(chipState?.chipsOnStation ?? 0);
      }
    }
    setStationChipValues(newStationChips);

    const newRewards: Record<string, string> = {};
    for (const challenge of gameState.challenges) {
      newRewards[challenge.id] = String(challenge.reward);
    }
    setChallengeRewards(newRewards);
  }, [gameState]);

  async function saveTeamChips(teamId: string) {
    const chips = parseInt(teamChips[teamId] ?? "0", 10);
    if (isNaN(chips) || chips < 0) {
      setError("Chips must be a non-negative number");
      return;
    }
    setSaving(teamId);
    setError(null);
    try {
      await patchTeam(gameId, teamId, { availableChips: chips });
      reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(null);
    }
  }

  async function saveStationChips(stationId: string, teamId: string) {
    const key = `${stationId}:${teamId}`;
    const chips = parseInt(stationChipValues[key] ?? "0", 10);
    if (isNaN(chips) || chips < 0) {
      setError("Chips must be a non-negative number");
      return;
    }
    setSaving(`station:${key}`);
    setError(null);
    try {
      await setStationChips(gameId, stationId, teamId, { chips });
      reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(null);
    }
  }

  async function handleDeleteAttempt(challengeId: string, teamId: string) {
    setSaving(`attempt:${challengeId}:${teamId}`);
    setError(null);
    try {
      await deleteChallengeAttempt(gameId, challengeId, teamId);
      reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete attempt");
    } finally {
      setSaving(null);
    }
  }

  async function saveReward(challengeId: string) {
    const reward = parseInt(challengeRewards[challengeId] ?? "", 10);
    if (isNaN(reward) || reward < 1) {
      setError("Reward must be at least 1");
      return;
    }
    setSaving(`reward:${challengeId}`);
    setError(null);
    try {
      await patchChallenge(gameId, challengeId, { reward });
      reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save reward");
    } finally {
      setSaving(null);
    }
  }

  async function handleRevertToCreated(challengeId: string) {
    setSaving(`revert:${challengeId}`);
    setError(null);
    try {
      await revertChallengeToCreated(gameId, challengeId);
      reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to revert challenge");
    } finally {
      setSaving(null);
    }
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      visible={visible}
    >
      <SafeAreaView style={localStyles.container}>
        <View style={localStyles.header}>
          <View style={localStyles.headerLeft}>
            <MaterialIcons color={colors.danger} name="admin-panel-settings" size={22} />
            <Text style={localStyles.title}>GM Tools</Text>
          </View>
          <Pressable
            accessibilityLabel="Close GM Tools"
            accessibilityRole="button"
            onPress={onClose}
            style={sharedStyles.iconButton}
          >
            <MaterialIcons color={colors.ink} name="close" size={22} />
          </Pressable>
        </View>

        <View style={sharedStyles.tabBar}>
          <TabButton
            active={activeTab === "teams"}
            icon="group"
            label="Teams"
            onPress={() => setActiveTab("teams")}
          />
          <TabButton
            active={activeTab === "stations"}
            icon="place"
            label="Stations"
            onPress={() => setActiveTab("stations")}
          />
          <TabButton
            active={activeTab === "challenges"}
            icon="emoji-events"
            label="Challenges"
            onPress={() => setActiveTab("challenges")}
          />
        </View>

        {error ? <Text style={localStyles.errorBanner}>{error}</Text> : null}

        <ScrollView contentContainerStyle={localStyles.scrollContent}>
          {activeTab === "teams" && (
            <TeamsTab
              saving={saving}
              teamChips={teamChips}
              teams={gameState.teams}
              onChangeChips={(teamId, value) =>
                setTeamChips((prev) => ({ ...prev, [teamId]: value }))
              }
              onSave={saveTeamChips}
            />
          )}
          {activeTab === "stations" && (
            <StationsTab
              saving={saving}
              stationChipValues={stationChipValues}
              stations={gameState.stations}
              teams={gameState.teams}
              onChangeChips={(key, value) =>
                setStationChipValues((prev) => ({ ...prev, [key]: value }))
              }
              onSave={saveStationChips}
            />
          )}
          {activeTab === "challenges" && (
            <ChallengesTab
              challengeRewards={challengeRewards}
              challenges={gameState.challenges}
              saving={saving}
              teams={gameState.teams}
              onChangeReward={(challengeId, value) =>
                setChallengeRewards((prev) => ({ ...prev, [challengeId]: value }))
              }
              onDeleteAttempt={handleDeleteAttempt}
              onRevertToCreated={handleRevertToCreated}
              onSaveReward={saveReward}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function TeamsTab({
  saving,
  teamChips,
  teams,
  onChangeChips,
  onSave,
}: {
  saving: string | null;
  teamChips: Record<string, string>;
  teams: TeamResponse[];
  onChangeChips: (teamId: string, value: string) => void;
  onSave: (teamId: string) => void;
}) {
  if (teams.length === 0) {
    return <Text style={sharedStyles.emptyText}>No teams in this game.</Text>;
  }

  return (
    <View style={localStyles.sectionStack}>
      {teams.map((team) => {
        const isSaving = saving === team.id;
        return (
          <View key={team.id} style={sharedStyles.teamCard}>
            <View style={[sharedStyles.teamColorBar, { backgroundColor: team.color }]} />
            <View style={localStyles.teamCardBody}>
              <Text style={sharedStyles.teamName}>{team.name}</Text>
              <View style={localStyles.chipRow}>
                <TextInput
                  accessibilityLabel={`Available chips for ${team.name}`}
                  editable={!isSaving}
                  keyboardType="number-pad"
                  onChangeText={(v) => onChangeChips(team.id, v)}
                  style={[sharedStyles.chipInput, localStyles.chipInputSmall]}
                  value={teamChips[team.id] ?? ""}
                />
                <Pressable
                  disabled={isSaving}
                  onPress={() => onSave(team.id)}
                  style={[sharedStyles.primaryButton, localStyles.saveButton, isSaving && sharedStyles.disabledButton]}
                >
                  {isSaving ? (
                    <ActivityIndicator color={colors.panel} size="small" />
                  ) : (
                    <Text style={sharedStyles.primaryButtonText}>Save</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function StationsTab({
  saving,
  stationChipValues,
  stations,
  teams,
  onChangeChips,
  onSave,
}: {
  saving: string | null;
  stationChipValues: Record<string, string>;
  stations: StationStateResponse[];
  teams: TeamResponse[];
  onChangeChips: (key: string, value: string) => void;
  onSave: (stationId: string, teamId: string) => void;
}) {
  if (stations.length === 0) {
    return <Text style={sharedStyles.emptyText}>No stations in this game.</Text>;
  }

  return (
    <View style={localStyles.sectionStack}>
      {stations.map((station) => (
        <View key={station.id} style={sharedStyles.panel}>
          <Text style={sharedStyles.panelTitle}>{station.name}</Text>
          {teams.map((team) => {
            const key = `${station.id}:${team.id}`;
            const isSaving = saving === `station:${key}`;
            return (
              <View key={team.id} style={localStyles.stationTeamRow}>
                <View style={[localStyles.teamDot, { backgroundColor: team.color }]} />
                <Text style={localStyles.stationTeamName}>{team.name}</Text>
                <TextInput
                  accessibilityLabel={`Chips for ${team.name} at ${station.name}`}
                  editable={!isSaving}
                  keyboardType="number-pad"
                  onChangeText={(v) => onChangeChips(key, v)}
                  style={[sharedStyles.chipInput, localStyles.chipInputSmall]}
                  value={stationChipValues[key] ?? "0"}
                />
                <Pressable
                  disabled={isSaving}
                  onPress={() => onSave(station.id, team.id)}
                  style={[sharedStyles.primaryButton, localStyles.saveButton, isSaving && sharedStyles.disabledButton]}
                >
                  {isSaving ? (
                    <ActivityIndicator color={colors.panel} size="small" />
                  ) : (
                    <Text style={sharedStyles.primaryButtonText}>Save</Text>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function ChallengesTab({
  challengeRewards,
  challenges,
  saving,
  teams,
  onChangeReward,
  onDeleteAttempt,
  onRevertToCreated,
  onSaveReward,
}: {
  challengeRewards: Record<string, string>;
  challenges: ChallengeResponse[];
  saving: string | null;
  teams: TeamResponse[];
  onChangeReward: (challengeId: string, value: string) => void;
  onDeleteAttempt: (challengeId: string, teamId: string) => void;
  onRevertToCreated: (challengeId: string) => void;
  onSaveReward: (challengeId: string) => void;
}) {
  const activeChallenges = challenges.filter((c) => c.status !== "CREATED");

  if (activeChallenges.length === 0) {
    return <Text style={sharedStyles.emptyText}>No active challenges yet.</Text>;
  }

  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));

  return (
    <View style={localStyles.sectionStack}>
      {activeChallenges.map((challenge) => {
        const isSavingReward = saving === `reward:${challenge.id}`;
        const isReverting = saving === `revert:${challenge.id}`;
        const canRevert =
          challenge.status === "AVAILABLE" && challenge.challengeAttempts.length === 0;

        return (
          <View key={challenge.id} style={sharedStyles.panel}>
            <View style={sharedStyles.panelHeader}>
              <Text style={[sharedStyles.panelTitle, localStyles.challengeTitle]}>
                {challenge.name}
              </Text>
              <Text
                style={[
                  sharedStyles.challengeStatus,
                  { color: challenge.status === "DONE" ? colors.challengeDone : colors.info },
                ]}
              >
                {challenge.status}
              </Text>
            </View>

            {/* Reward edit */}
            <Text style={sharedStyles.formLabel}>Reward</Text>
            <View style={localStyles.chipRow}>
              <TextInput
                accessibilityLabel={`Reward for ${challenge.name}`}
                editable={!isSavingReward}
                keyboardType="number-pad"
                onChangeText={(v) => onChangeReward(challenge.id, v)}
                style={[sharedStyles.chipInput, localStyles.chipInputSmall]}
                value={challengeRewards[challenge.id] ?? ""}
              />
              <Pressable
                disabled={isSavingReward}
                onPress={() => onSaveReward(challenge.id)}
                style={[sharedStyles.primaryButton, localStyles.saveButton, isSavingReward && sharedStyles.disabledButton]}
              >
                {isSavingReward ? (
                  <ActivityIndicator color={colors.panel} size="small" />
                ) : (
                  <Text style={sharedStyles.primaryButtonText}>Save</Text>
                )}
              </Pressable>
            </View>

            {/* Revert to Created */}
            <Pressable
              disabled={!canRevert || isReverting}
              onPress={() => onRevertToCreated(challenge.id)}
              style={[sharedStyles.secondaryButton, localStyles.revertButton, (!canRevert || isReverting) && sharedStyles.disabledButton]}
            >
              {isReverting ? (
                <ActivityIndicator color={colors.danger} size="small" />
              ) : (
                <>
                  <MaterialIcons color={colors.danger} name="undo" size={18} />
                  <Text style={sharedStyles.secondaryButtonText}>Revert to Created</Text>
                </>
              )}
            </Pressable>

            {/* Attempts */}
            {challenge.challengeAttempts.length > 0 && (
              <View style={localStyles.attemptList}>
                <Text style={sharedStyles.formLabel}>Attempts</Text>
                {challenge.challengeAttempts.map((attempt) => {
                  const team = teamMap[attempt.teamId];
                  const attemptSavingKey = `attempt:${challenge.id}:${attempt.teamId}`;
                  const isSavingAttempt = saving === attemptSavingKey;
                  return (
                    <View key={attempt.teamId} style={localStyles.attemptRow}>
                      <View style={[localStyles.teamDot, { backgroundColor: team?.color ?? colors.muted }]} />
                      <Text style={localStyles.attemptTeamName}>{team?.name ?? "Unknown"}</Text>
                      <Text style={localStyles.attemptStatus}>{attempt.status}</Text>
                      <Pressable
                        disabled={isSavingAttempt}
                        onPress={() => onDeleteAttempt(challenge.id, attempt.teamId)}
                        style={[sharedStyles.secondaryButton, localStyles.deleteAttemptButton, isSavingAttempt && sharedStyles.disabledButton]}
                      >
                        {isSavingAttempt ? (
                          <ActivityIndicator color={colors.danger} size="small" />
                        ) : (
                          <MaterialIcons color={colors.danger} name="delete" size={16} />
                        )}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const localStyles = StyleSheet.create({
  attemptList: {
    gap: 6,
    marginBottom: 10,
  },
  attemptRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  attemptStatus: {
    color: colors.muted,
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
  },
  attemptTeamName: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
  },
  challengeTitle: {
    flex: 1,
    fontSize: 16,
    marginBottom: 0,
  },
  chipInputSmall: {
    flex: 1,
    fontSize: 15,
    minHeight: 42,
  },
  chipRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  container: {
    backgroundColor: colors.page,
    flex: 1,
  },
  deleteAttemptButton: {
    flex: 0,
    minHeight: 36,
    paddingHorizontal: 10,
  },
  errorBanner: {
    backgroundColor: colors.dangerSurface,
    borderColor: colors.dangerSurfaceBorder,
    borderRadius: 0,
    borderWidth: 1,
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  header: {
    alignItems: "center",
    backgroundColor: colors.page,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  headerLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  revertButton: {
    flex: 0,
    marginTop: 8,
  },
  saveButton: {
    flex: 0,
    minHeight: 42,
    paddingHorizontal: 14,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionStack: {
    gap: 12,
  },
  stationTeamName: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
  },
  stationTeamRow: {
    alignItems: "center",
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
  },
  teamCardBody: {
    flex: 1,
    gap: 8,
    padding: 12,
  },
  teamDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900",
  },
});
