import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { getApiBaseUrl, setApiBaseUrl } from "@/api/gameApi";
import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";
import { PageLayout } from "@/components/Shared/PageLayout";

function normalizeBackendUrl(value: string) {
  const trimmedValue = value.trim();

  try {
    const url = new URL(trimmedValue);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function SettingsPage({ onBack }: { onBack: () => void }) {
  const [backendUrlDraft, setBackendUrlDraft] = useState(getApiBaseUrl());
  const [error, setError] = useState<string | null>(null);

  const saveSettings = () => {
    const normalizedUrl = normalizeBackendUrl(backendUrlDraft);

    if (!normalizedUrl) {
      setError("Enter a valid backend URL starting with http:// or https://.");
      return;
    }

    setApiBaseUrl(normalizedUrl);
    setBackendUrlDraft(normalizedUrl);
    setError(null);
    onBack();
  };

  return (
    <PageLayout onBack={onBack} title="Settings">
      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      <View style={styles.screenStack}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Backend</Text>
          <Text style={styles.formLabel}>URL</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            inputMode="url"
            keyboardType="url"
            onChangeText={setBackendUrlDraft}
            placeholder="http://192.168.0.10:8080"
            placeholderTextColor="#8a94a6"
            style={styles.menuInput}
            value={backendUrlDraft}
          />
        </View>

        <Pressable onPress={saveSettings} style={styles.primaryButton}>
          <MaterialIcons color={colors.panel} name="save" size={19} />
          <Text style={styles.primaryButtonText}>Save settings</Text>
        </Pressable>
      </View>
    </PageLayout>
  );
}
