import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";
import { PageLayout } from "@/components/Shared/PageLayout";

export function HomePage({
  onContinueGame,
  onCreateManually,
  onCreateFromPreset,
  onJoinGame,
  onLogOut,
  onSettings,
}: {
  onContinueGame: () => void;
  onCreateManually: () => void;
  onCreateFromPreset: () => void;
  onJoinGame: () => void;
  onLogOut: () => void;
  onSettings: () => void;
}) {
  return (
    <PageLayout title="Menu">
      <View style={styles.screenStack}>
        <MenuButton icon="list" label="My games" onPress={onContinueGame} />
        <MenuButton icon="group-add" label="Join game" onPress={onJoinGame} />
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Create game</Text>
          <View style={styles.menuButtonStack}>
            <MenuButton icon="edit" label="Create game manually" onPress={onCreateManually} />
            <MenuButton icon="auto-awesome" label="Create game from preset" onPress={onCreateFromPreset} />
          </View>
        </View>
        <MenuButton icon="settings" label="Settings" onPress={onSettings} />
        <MenuButton icon="logout" label="Log out" onPress={onLogOut} />
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
