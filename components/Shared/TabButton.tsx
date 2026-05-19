import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";

export function TabButton({
  active,
  compact = false,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  compact?: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const activeColor = compact ? colors.info : colors.panel;
  const foregroundColor = active ? activeColor : colors.textSoft;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.tabButton,
        compact && styles.mobileTabButton,
        active && styles.tabButtonActive,
        compact && active && styles.mobileTabButtonActive,
      ]}
    >
      <MaterialIcons color={foregroundColor} name={icon} size={compact ? 21 : 18} />
      <Text
        style={[
          styles.tabText,
          compact && styles.mobileTabText,
          active && styles.tabTextActive,
          compact && active && styles.mobileTabTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
