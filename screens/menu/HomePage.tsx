import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";
import { PageLayout } from "@/components/Shared/PageLayout";

export function HomePage({
  onContinueGame,
  onCreateFromPreset,
  onSettings,
}: {
  onContinueGame: () => void;
  onCreateFromPreset: () => void;
  onSettings: () => void;
}) {
  return (
    <PageLayout title="Menu">
      <View style={styles.screenStack}>
        <MenuButton icon="play-arrow" label="Continue game" onPress={onContinueGame} />
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Create game</Text>
          <View style={styles.menuButtonStack}>
            <MenuButton icon="edit" label="Create game manually" onPress={() => undefined} />
            <MenuButton icon="auto-awesome" label="Create game from preset" onPress={onCreateFromPreset} />
          </View>
        </View>
        <MenuButton icon="settings" label="Settings" onPress={onSettings} />
      </View>
    </PageLayout>
  );
}

function MenuButton({
  disabled = false,
  icon,
  label,
  onPress,
}: {
  disabled?: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.menuButton, disabled && styles.disabledButton]}>
      <MaterialIcons color={colors.panel} name={icon} size={21} />
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}
