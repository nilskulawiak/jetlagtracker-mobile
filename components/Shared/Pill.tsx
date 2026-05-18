import { Text, View } from "react-native";

import { styles } from "@/components/Shared/styles";

export function Pill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.pillValue}>
        {value}
      </Text>
    </View>
  );
}
