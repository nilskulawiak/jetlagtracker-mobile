import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { ApiError, register } from "@/api/gameApi";
import { PageLayout } from "@/components/Shared/PageLayout";
import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";
import { saveSession } from "@/utils/sessionStorage";

export function RegisterScreen({
  onAuthed,
  onGoToLogin,
}: {
  onAuthed: () => void;
  onGoToLogin: () => void;
}) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const trimmedEmail = email.trim();
    const trimmedName = displayName.trim();
    if (!trimmedEmail || !trimmedName || !password) {
      setError("Fill in all fields.");
      return;
    }
    try {
      setError(null);
      setIsLoading(true);
      const response = await register(trimmedEmail, trimmedName, password);
      await saveSession({
        sessionToken: response.sessionToken,
        userId: response.user.id,
        email: response.user.email,
        displayName: response.user.displayName,
      });
      onAuthed();
    } catch (nextError) {
      if (nextError instanceof ApiError && nextError.status === 400) {
        setError("That email is already in use.");
      } else {
        setError("Could not create account. Check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout title="Register">
      <View style={styles.screenStack}>
        {error ? <Text style={styles.inlineError}>{error}</Text> : null}

        <View style={styles.panel}>
          <Text style={styles.formLabel}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor="#8a94a6"
            style={styles.menuInput}
            value={email}
          />

          <Text style={[styles.formLabel, { marginTop: 12 }]}>Display name</Text>
          <TextInput
            onChangeText={setDisplayName}
            placeholder="How others see you in the game"
            placeholderTextColor="#8a94a6"
            style={styles.menuInput}
            value={displayName}
          />

          <Text style={[styles.formLabel, { marginTop: 12 }]}>Password</Text>
          <TextInput
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#8a94a6"
            secureTextEntry
            style={styles.menuInput}
            value={password}
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
            <MaterialIcons color={colors.panel} name="person-add" size={19} />
          )}
          <Text style={styles.primaryButtonText}>Register</Text>
        </Pressable>

        <Pressable onPress={onGoToLogin} style={styles.menuListItem}>
          <Text style={styles.emptyText}>Already have an account?</Text>
          <Text style={[styles.emptyText, { color: colors.info, fontWeight: "800" }]}>Log in</Text>
        </Pressable>
      </View>
    </PageLayout>
  );
}
