import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { styles } from "@/components/Shared/styles";
import type { GameActionResponse } from "@/types/game";
import { colors } from "@/utils/colors";
import { formatDate } from "@/utils/format";

export function ActionLog({ actions, hideTitle = false }: { actions: GameActionResponse[]; hideTitle?: boolean }) {
  if (actions.length === 0) {
    if (hideTitle) {
      return <Text style={styles.emptyText}>No actions yet.</Text>;
    }

    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Action log</Text>
        <Text style={styles.emptyText}>No actions yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screenStack}>
      {actions.map((action) => (
        <View key={action.id} style={styles.actionItem}>
          <View style={styles.actionIcon}>
            <MaterialIcons color={colors.info} name="bolt" size={18} />
          </View>
          <View style={styles.actionBody}>
            <View style={styles.panelHeader}>
              <Text style={styles.actionType}>{action.type}</Text>
              <Text style={styles.actionTime}>{formatDate(action.createdAt)}</Text>
            </View>
            <Text style={styles.actionMessage}>{action.message}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
