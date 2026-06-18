import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/Shared/Buttons";
import { styles } from "@/components/Shared/styles";
import type { ChallengeType } from "@/types/game";
import { getChallengeTypeLabel } from "@/utils/challengeDisplay";
import { colors } from "@/utils/colors";
import { CHALLENGE_TYPES } from "@/utils/setupHelpers";

export function ItemFormBody({
  autoFocusName,
  challengeType = "CHIPS",
  chips = "",
  description = "",
  isMutating,
  name,
  onCancel,
  onChallengeTypeChange = () => undefined,
  onChipsChange = () => undefined,
  onDelete,
  onDescriptionChange = () => undefined,
  onNameChange,
  onSave,
  onXChange,
  onYChange,
  saveIcon = "save",
  saveLabel = "Save",
  type,
  xStr,
  yStr,
}: {
  autoFocusName?: boolean;
  challengeType?: ChallengeType;
  chips?: string;
  description?: string;
  isMutating: boolean;
  name: string;
  onCancel: () => void;
  onChallengeTypeChange?: (v: ChallengeType) => void;
  onChipsChange?: (v: string) => void;
  onDelete?: () => void;
  onDescriptionChange?: (v: string) => void;
  onNameChange: (v: string) => void;
  onSave: () => void;
  onXChange: (v: string) => void;
  onYChange: (v: string) => void;
  saveIcon?: keyof typeof MaterialIcons.glyphMap;
  saveLabel?: string;
  type: "STATION" | "CHALLENGE";
  xStr: string;
  yStr: string;
}) {
  return (
    <View style={styles.setupSection}>
      <TextInput
        autoFocus={autoFocusName}
        onChangeText={onNameChange}
        placeholder={type === "STATION" ? "Station name" : "Challenge name"}
        placeholderTextColor="#8a94a6"
        style={styles.menuInput}
        value={name}
      />

      {type === "CHALLENGE" ? (
        <>
          <TextInput
            multiline
            onChangeText={onDescriptionChange}
            placeholder="Description"
            placeholderTextColor="#8a94a6"
            style={[styles.menuInput, styles.setupDescriptionInput]}
            value={description}
          />
          <TextInput
            inputMode="numeric"
            keyboardType="number-pad"
            onChangeText={onChipsChange}
            placeholder="Chips / value"
            placeholderTextColor="#8a94a6"
            style={styles.menuInput}
            value={chips}
          />
          <View style={styles.colorSwatchRow}>
            {CHALLENGE_TYPES.map((t) => (
              <Pressable
                accessibilityLabel={`Challenge type ${t}`}
                accessibilityRole="button"
                key={t}
                onPress={() => onChallengeTypeChange(t)}
                style={[styles.teamOption, challengeType === t && styles.setupOptionSelected]}
              >
                <Text style={styles.teamOptionText}>{getChallengeTypeLabel(t)}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.setupCoordinateRow}>
        <TextInput
          inputMode="numeric"
          keyboardType="number-pad"
          onChangeText={onXChange}
          placeholder="X"
          placeholderTextColor="#8a94a6"
          style={[styles.menuInput, styles.setupCoordinateInput]}
          value={xStr}
        />
        <TextInput
          inputMode="numeric"
          keyboardType="number-pad"
          onChangeText={onYChange}
          placeholder="Y"
          placeholderTextColor="#8a94a6"
          style={[styles.menuInput, styles.setupCoordinateInput]}
          value={yStr}
        />
      </View>

      <PrimaryButton
        disabled={isMutating}
        icon={saveIcon}
        label={isMutating ? "Saving..." : saveLabel}
        onPress={onSave}
      />

      {onDelete ? (
        <Pressable onPress={onDelete} style={{ alignItems: "center", marginTop: 6 }}>
          <Text style={{ color: colors.danger, fontSize: 14 }}>Delete</Text>
        </Pressable>
      ) : null}

      <Pressable onPress={onCancel} style={{ alignItems: "center", marginTop: 6 }}>
        <Text style={{ color: colors.muted, fontSize: 14 }}>Cancel</Text>
      </Pressable>
    </View>
  );
}
