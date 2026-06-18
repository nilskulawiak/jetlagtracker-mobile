import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/Shared/Buttons";
import { styles } from "@/components/Shared/styles";
import type { ChallengeType, CreateChallengeRequest, CreateStationRequest } from "@/types/game";
import { getChallengeTypeLabel } from "@/utils/challengeDisplay";
import { colors } from "@/utils/colors";
import { CHALLENGE_TYPES, parsePositiveInteger } from "@/utils/setupHelpers";

export function MapCreationForm({
  gameX,
  gameY,
  isMutating,
  onCancel,
  onCoordinateChange,
  onCreateChallenge,
  onCreateStation,
  type,
}: {
  gameX: number;
  gameY: number;
  isMutating: boolean;
  onCancel: () => void;
  onCoordinateChange: (x: number, y: number) => void;
  onCreateChallenge: (body: CreateChallengeRequest) => Promise<void>;
  onCreateStation: (body: CreateStationRequest) => Promise<void>;
  type: "STATION" | "CHALLENGE";
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [chips, setChips] = useState("");
  const [challengeType, setChallengeType] = useState<ChallengeType>(CHALLENGE_TYPES[0]);
  const [xStr, setXStr] = useState(String(gameX));
  const [yStr, setYStr] = useState(String(gameY));

  // Sync x/y text when parent updates (e.g. marker drag)
  useEffect(() => { setXStr(String(gameX)); }, [gameX]);
  useEffect(() => { setYStr(String(gameY)); }, [gameY]);

  const handleXChange = (text: string) => {
    setXStr(text);
    const parsed = parseInt(text, 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      onCoordinateChange(parsed, gameY);
    }
  };

  const handleYChange = (text: string) => {
    setYStr(text);
    const parsed = parseInt(text, 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      onCoordinateChange(gameX, parsed);
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const xCoordinate = parsePositiveInteger(xStr, "X coordinate");
    const yCoordinate = parsePositiveInteger(yStr, "Y coordinate");
    if (!trimmedName) { return; }
    if (xCoordinate === null || yCoordinate === null) return;

    if (type === "STATION") {
      await onCreateStation({ name: trimmedName, xCoordinate, yCoordinate });
    } else {
      const trimmedDescription = description.trim();
      const reward = parsePositiveInteger(chips, "Chips / value");
      if (!trimmedDescription || reward === null) return;
      await onCreateChallenge({
        challengeType,
        description: trimmedDescription,
        name: trimmedName,
        reward,
        status: "CREATED",
        xCoordinate,
        yCoordinate,
      });
    }
    onCancel();
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{type === "STATION" ? "New station" : "New challenge"}</Text>

      <View style={styles.setupSection}>
        <TextInput
          autoFocus
          onChangeText={setName}
          placeholder={type === "STATION" ? "Station name" : "Challenge name"}
          placeholderTextColor="#8a94a6"
          style={styles.menuInput}
          value={name}
        />

        {type === "CHALLENGE" ? (
          <>
            <TextInput
              multiline
              onChangeText={setDescription}
              placeholder="Description"
              placeholderTextColor="#8a94a6"
              style={[styles.menuInput, styles.setupDescriptionInput]}
              value={description}
            />
            <TextInput
              inputMode="numeric"
              keyboardType="number-pad"
              onChangeText={setChips}
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
                  onPress={() => setChallengeType(t)}
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
            onChangeText={handleXChange}
            placeholder="X"
            placeholderTextColor="#8a94a6"
            style={[styles.menuInput, styles.setupCoordinateInput]}
            value={xStr}
          />
          <TextInput
            inputMode="numeric"
            keyboardType="number-pad"
            onChangeText={handleYChange}
            placeholder="Y"
            placeholderTextColor="#8a94a6"
            style={[styles.menuInput, styles.setupCoordinateInput]}
            value={yStr}
          />
        </View>

        <PrimaryButton
          disabled={isMutating}
          icon={type === "STATION" ? "add-location-alt" : "add-task"}
          label={isMutating ? "Saving..." : type === "STATION" ? "Add station" : "Add challenge"}
          onPress={handleSave}
        />
        <Pressable onPress={onCancel} style={{ alignItems: "center", marginTop: 10 }}>
          <Text style={{ color: colors.muted, fontSize: 14 }}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}
