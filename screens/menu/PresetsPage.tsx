import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { getPresets } from "@/api/gameApi";
import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";
import type { PresetSummaryResponse } from "@/types/game";
import { PageLayout } from "./PageLayout";

export function PresetsPage({
  onBack,
  onSelectPreset,
}: {
  onBack: () => void;
  onSelectPreset: (preset: PresetSummaryResponse) => void;
}) {
  const [presets, setPresets] = useState<PresetSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPresets = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await getPresets();
      setPresets(response ?? []);
    } catch (nextError) {
      console.error(nextError);
      setError("Could not load presets. Check the backend URL.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  return (
    <PageLayout onBack={onBack} onRefresh={loadPresets} refreshing={isLoading} title="Presets">
      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.info} />
          <Text style={styles.centerText}>Loading...</Text>
        </View>
      ) : (
        <View style={styles.screenStack}>
          {presets.length === 0 ? <Text style={styles.emptyText}>No presets found.</Text> : null}
          {presets.map((preset) => (
            <Pressable key={preset.id} onPress={() => onSelectPreset(preset)} style={styles.menuListItem}>
              <View style={styles.actionBody}>
                <Text style={styles.teamName}>{preset.name}</Text>
                <Text style={styles.emptyText}>{preset.id}</Text>
              </View>
              <MaterialIcons color={colors.info} name="chevron-right" size={24} />
            </Pressable>
          ))}
        </View>
      )}
    </PageLayout>
  );
}
