import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { getGames } from "@/api/gameApi";
import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";
import type { GameResponse } from "@/types/game";
import { PageLayout } from "./PageLayout";

export function ContinueGamePage({
  onBack,
  onOpenGame,
}: {
  onBack: () => void;
  onOpenGame: (gameId: string) => void;
}) {
  const [games, setGames] = useState<GameResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await getGames();
      setGames(response.gameResponses ?? []);
    } catch (nextError) {
      console.error(nextError);
      setError("Could not load games. Check the backend URL.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  return (
    <PageLayout onBack={onBack} onRefresh={loadGames} refreshing={isLoading} title="Continue game">
      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.info} />
          <Text style={styles.centerText}>Loading...</Text>
        </View>
      ) : (
        <View style={styles.screenStack}>
          {games.length === 0 ? <Text style={styles.emptyText}>No games found.</Text> : null}
          {games.map((game) => (
            <Pressable key={game.id} onPress={() => onOpenGame(game.id)} style={styles.menuListItem}>
              <View style={styles.actionBody}>
                <Text style={styles.teamName}>{game.name}</Text>
                <Text style={styles.emptyText}>{game.status}</Text>
              </View>
              <MaterialIcons color={colors.info} name="chevron-right" size={24} />
            </Pressable>
          ))}
        </View>
      )}
    </PageLayout>
  );
}
