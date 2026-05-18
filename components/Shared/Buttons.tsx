import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";

type ButtonProps = {
  disabled: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
};

export function PrimaryButton({ disabled, icon, label, onPress }: ButtonProps) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.primaryButton, disabled && styles.disabledButton]}>
      <MaterialIcons color={colors.panel} name={icon} size={19} />
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ disabled, icon, label, onPress }: ButtonProps) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.secondaryButton, disabled && styles.disabledButton]}>
      <MaterialIcons color={colors.danger} name={icon} size={19} />
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}
