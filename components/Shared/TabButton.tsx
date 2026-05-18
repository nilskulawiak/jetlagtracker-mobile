import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";

export function TabButton({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <MaterialIcons color={active ? colors.panel : colors.textSoft} name={icon} size={18} />
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}
