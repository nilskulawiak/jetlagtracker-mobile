import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { ApiError, getMyGames } from "@/api/gameApi";
import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";
import type { GameMembershipResponse, MemberRole } from "@/types/game";
import { PageLayout } from "@/components/Shared/PageLayout";

export function ContinueGamePage({
  onAuthError,
  onBack,
  onOpenGame,
}: {
  onAuthError: () => void;
  onBack: () => void;
  onOpenGame: (gameId: string, teamId?: string, role?: MemberRole) => void;
}) {
  const [memberships, setMemberships] = useState<GameMembershipResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await getMyGames();
      setMemberships(data);
    } catch (nextError) {
      if (nextError instanceof ApiError && nextError.status === 401) {
        onAuthError();
        return;
      }
      console.error(nextError);
      setError("Could not load games. Check the backend URL.");
    } finally {
      setIsLoading(false);
    }
  }, [onAuthError]);

  useEffect(() => {
    void loadGames();
  }, [loadGames]);

  return (
    <PageLayout onBack={onBack} onRefresh={loadGames} refreshing={isLoading} title="My games">
      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.info} />
          <Text style={styles.centerText}>Loading...</Text>
        </View>
      ) : (
        <View style={styles.screenStack}>
          {memberships.length === 0 ? (
            <Text style={styles.emptyText}>No games yet. Create one or join with an invite code.</Text>
          ) : null}
          {memberships.map((m) => (
            <Pressable
              key={m.gameId}
              onPress={() => onOpenGame(m.gameId, m.teamId, m.role)}
              style={styles.menuListItem}
            >
              <View style={styles.actionBody}>
                <Text style={styles.teamName}>{m.game.name}</Text>
                <Text style={styles.emptyText}>
                  {m.role === "HOST" ? "Host" : "Player"}
                  {m.teamName ? ` — ${m.teamName}` : ""}
                  {"  ·  "}
                  {m.game.status}
                </Text>
              </View>
              <MaterialIcons color={colors.info} name="chevron-right" size={24} />
            </Pressable>
          ))}
        </View>
      )}
    </PageLayout>
  );
}
