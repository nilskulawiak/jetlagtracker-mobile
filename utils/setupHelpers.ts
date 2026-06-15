import { Alert, Platform } from "react-native";

import type { ChallengeType } from "@/types/game";

export const TEAM_COLORS = ["#d92d20", "#1570ef", "#039855", "#dc6803", "#7f56d9", "#0891b2"];

export const CHALLENGE_TYPES: ChallengeType[] = ["CHIPS", "MULTIPLIER", "STEAL", "CALL_YOUR_SHOT"];

export function parsePositiveInteger(value: string, label: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    Alert.alert(label, `${label} must be a positive whole number.`);
    return null;
  }

  return parsed;
}

export function confirmDelete(name: string, onConfirm: () => void): void {
  if (Platform.OS === "web") {
    if (window.confirm(`Delete "${name}"?`)) {
      onConfirm();
    }
    return;
  }
  Alert.alert("Delete", `Delete "${name}"?`, [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: onConfirm },
  ]);
}
