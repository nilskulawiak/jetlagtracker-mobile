import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { getGameState, setMyTeam } from "@/api/gameApi";
import { PageLayout } from "@/components/Shared/PageLayout";
import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";
import type { TeamResponse } from "@/types/game";

export function TeamChoiceScreen({
  gameId,
  onBack,
  onTeamChosen,
}: {
  gameId: string;
  onBack: () => void;
  onTeamChosen: (teamId: string) => void;
}) {
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const state = await getGameState(gameId);
      setTeams(state.teams);
    } catch {
      setError("Could not load teams. Check the backend URL.");
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    void loadTeams();
  }, [loadTeams]);

  const chooseTeam = async (teamId: string) => {
    try {
      setError(null);
      setIsChoosing(true);
      await setMyTeam(gameId, teamId);
      onTeamChosen(teamId);
    } catch {
      setError("Could not save team choice. Try again.");
      setIsChoosing(false);
    }
  };

  return (
    <PageLayout onBack={onBack} onRefresh={loadTeams} refreshing={isLoading} title="Choose your team">
      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      {isLoading && teams.length === 0 ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.info} />
          <Text style={styles.centerText}>Loading teams...</Text>
        </View>
      ) : (
        <View style={styles.screenStack}>
          {teams.map((team) => (
            <Pressable
              disabled={isChoosing}
              key={team.id}
              onPress={() => { void chooseTeam(team.id); }}
              style={[styles.teamCard, isChoosing && styles.disabledButton]}
            >
              <View style={[styles.teamColorBar, { backgroundColor: team.color }]} />
              <View style={styles.teamCardBody}>
                <Text style={styles.actionType}>{team.name}</Text>
                <Text style={styles.emptyText}>{team.availableChips} chips</Text>
              </View>
              <View style={{ justifyContent: "center", paddingRight: 14 }}>
                {isChoosing ? (
                  <ActivityIndicator color={colors.info} size="small" />
                ) : (
                  <MaterialIcons color={colors.info} name="chevron-right" size={24} />
                )}
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </PageLayout>
  );
}
