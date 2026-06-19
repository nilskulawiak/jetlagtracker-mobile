import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { ApiError, joinGame } from "@/api/gameApi";
import { PageLayout } from "@/components/Shared/PageLayout";
import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";
import type { MemberRole } from "@/types/game";

export function JoinGamePage({
  onBack,
  onOpenGame,
}: {
  onBack: () => void;
  onOpenGame: (gameId: string, teamId?: string, role?: MemberRole) => void;
}) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      setError("Enter an invite code.");
      return;
    }
    try {
      setError(null);
      setIsLoading(true);
      const response = await joinGame(trimmedCode);
      onOpenGame(response.gameId, response.teamId, response.role);
    } catch (nextError) {
      if (nextError instanceof ApiError && nextError.status === 404) {
        setError("Invite code not found.");
      } else {
        setError("Could not join game. Check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout onBack={onBack} title="Join game">
      <View style={styles.screenStack}>
        {error ? <Text style={styles.inlineError}>{error}</Text> : null}

        <View style={styles.panel}>
          <Text style={styles.formLabel}>Invite code</Text>
          <TextInput
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={8}
            onChangeText={(v) => setCode(v.toUpperCase())}
            placeholder="ABCD1234"
            placeholderTextColor="#8a94a6"
            style={[styles.menuInput, { letterSpacing: 4, fontWeight: "800" }]}
            value={code}
          />
        </View>

        <Pressable
          disabled={isLoading}
          onPress={submit}
          style={[styles.primaryButton, isLoading && styles.disabledButton]}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.panel} />
          ) : (
            <MaterialIcons color={colors.panel} name="group-add" size={19} />
          )}
          <Text style={styles.primaryButtonText}>Join game</Text>
        </Pressable>
      </View>
    </PageLayout>
  );
}
