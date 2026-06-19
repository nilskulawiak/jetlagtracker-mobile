import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { ApiError, login } from "@/api/gameApi";
import { PageLayout } from "@/components/Shared/PageLayout";
import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";
import { saveSession } from "@/utils/sessionStorage";

export function LoginScreen({
  onAuthed,
  onGoToRegister,
}: {
  onAuthed: () => void;
  onGoToRegister: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Enter your email and password.");
      return;
    }
    try {
      setError(null);
      setIsLoading(true);
      const response = await login(trimmedEmail, password);
      await saveSession({
        sessionToken: response.sessionToken,
        userId: response.user.id,
        email: response.user.email,
        displayName: response.user.displayName,
      });
      onAuthed();
    } catch (nextError) {
      if (nextError instanceof ApiError && nextError.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError("Could not log in. Check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout title="Log in">
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
            <MaterialIcons color={colors.panel} name="login" size={19} />
          )}
          <Text style={styles.primaryButtonText}>Log in</Text>
        </Pressable>

        <Pressable onPress={onGoToRegister} style={styles.menuListItem}>
          <Text style={styles.emptyText}>No account?</Text>
          <Text style={[styles.emptyText, { color: colors.info, fontWeight: "800" }]}>Register</Text>
        </Pressable>
      </View>
    </PageLayout>
  );
}
