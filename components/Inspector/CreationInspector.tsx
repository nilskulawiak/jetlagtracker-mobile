import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/Shared/Buttons";
import { styles } from "@/components/Shared/styles";
import type {
  ChallengeResponse,
  ChallengeType,
  PatchChallengeRequest,
  PatchStationRequest,
  StationStateResponse,
} from "@/types/game";
import { getChallengeTypeLabel } from "@/utils/challengeDisplay";
import { colors } from "@/utils/colors";
import { CHALLENGE_TYPES, confirmDelete, parsePositiveInteger } from "@/utils/setupHelpers";

export function CreationInspector({
  challenge,
  isMutating,
  onDeleteChallenge,
  onDeleteStation,
  onPatchChallenge,
  onPatchStation,
  station,
}: {
  challenge?: ChallengeResponse | null;
  isMutating: boolean;
  onDeleteChallenge: (id: string) => Promise<void>;
  onDeleteStation: (id: string) => Promise<void>;
  onPatchChallenge: (id: string, body: PatchChallengeRequest) => Promise<void>;
  onPatchStation: (id: string, body: PatchStationRequest) => Promise<void>;
  station?: StationStateResponse | null;
}) {
  const [isEditing, setIsEditing] = useState(false);

  // Station edit state
  const [stationName, setStationName] = useState("");
  const [stationX, setStationX] = useState("");
  const [stationY, setStationY] = useState("");

  // Challenge edit state
  const [challengeName, setChallengeName] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeChips, setChallengeChips] = useState("");
  const [challengeType, setChallengeType] = useState<ChallengeType>("CHIPS");
  const [challengeX, setChallengeX] = useState("");
  const [challengeY, setChallengeY] = useState("");

  const selectedId = station?.id ?? challenge?.id;

  useEffect(() => {
    setIsEditing(false);
  }, [selectedId]);

  if (station) {
    const enterEdit = () => {
      setStationName(station.name);
      setStationX(String(station.xCoordinate));
      setStationY(String(station.yCoordinate));
      setIsEditing(true);
    };

    const cancelEdit = () => {
      setIsEditing(false);
    };

    const saveEdit = async () => {
      const trimmedName = stationName.trim();
      const xCoordinate = parsePositiveInteger(stationX, "Station x coordinate");
      const yCoordinate = parsePositiveInteger(stationY, "Station y coordinate");
      if (!trimmedName || xCoordinate === null || yCoordinate === null) return;
      await onPatchStation(station.id, { name: trimmedName, xCoordinate, yCoordinate });
      setIsEditing(false);
    };

    const handleDelete = () => {
      confirmDelete(station.name, () => onDeleteStation(station.id));
    };

    if (isEditing) {
      return (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Edit station</Text>
          <View style={styles.setupSection}>
            <Text style={styles.formLabel}>Name</Text>
            <TextInput
              onChangeText={setStationName}
              placeholder="Station name"
              placeholderTextColor="#8a94a6"
              style={styles.menuInput}
              value={stationName}
            />
            <View style={styles.setupCoordinateRow}>
              <TextInput
                inputMode="numeric"
                keyboardType="number-pad"
                onChangeText={setStationX}
                placeholder="X"
                placeholderTextColor="#8a94a6"
                style={[styles.menuInput, styles.setupCoordinateInput]}
                value={stationX}
              />
              <TextInput
                inputMode="numeric"
                keyboardType="number-pad"
                onChangeText={setStationY}
                placeholder="Y"
                placeholderTextColor="#8a94a6"
                style={[styles.menuInput, styles.setupCoordinateInput]}
                value={stationY}
              />
            </View>
            <PrimaryButton disabled={isMutating} icon="save" label={isMutating ? "Saving..." : "Save"} onPress={saveEdit} />
            <Pressable onPress={cancelEdit} style={{ alignItems: "center", marginTop: 10 }}>
              <Text style={{ color: colors.muted, fontSize: 14 }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>{station.name}</Text>
        </View>
        <View style={styles.setupSection}>
          <Text style={styles.formLabel}>Coordinates</Text>
          <Text style={styles.chipText}>{station.xCoordinate}, {station.yCoordinate}</Text>
        </View>
        <View style={[styles.setupSection, { flexDirection: "row", gap: 8 }]}>
          <Pressable
            disabled={isMutating}
            onPress={enterEdit}
            style={[styles.iconButton, { flex: 1, justifyContent: "center" }]}
          >
            <MaterialIcons color={colors.ink} name="edit" size={18} />
            <Text style={styles.chipText}>Edit</Text>
          </Pressable>
          <Pressable
            disabled={isMutating}
            onPress={handleDelete}
            style={[styles.iconButton, { flex: 1, justifyContent: "center", borderColor: colors.danger }]}
          >
            <MaterialIcons color={colors.danger} name="delete-outline" size={18} />
            <Text style={[styles.chipText, { color: colors.danger }]}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (challenge) {
    const enterEdit = () => {
      setChallengeName(challenge.name);
      setChallengeDescription(challenge.description);
      setChallengeChips(String(challenge.reward));
      setChallengeType(challenge.challengeType);
      setChallengeX(String(challenge.xCoordinate));
      setChallengeY(String(challenge.yCoordinate));
      setIsEditing(true);
    };

    const cancelEdit = () => {
      setIsEditing(false);
    };

    const saveEdit = async () => {
      const trimmedName = challengeName.trim();
      const trimmedDescription = challengeDescription.trim();
      const reward = parsePositiveInteger(challengeChips, "Challenge reward");
      const xCoordinate = parsePositiveInteger(challengeX, "Challenge x coordinate");
      const yCoordinate = parsePositiveInteger(challengeY, "Challenge y coordinate");
      if (!trimmedName || !trimmedDescription || reward === null || xCoordinate === null || yCoordinate === null) return;
      await onPatchChallenge(challenge.id, {
        name: trimmedName,
        description: trimmedDescription,
        reward,
        challengeType,
        xCoordinate,
        yCoordinate,
      });
      setIsEditing(false);
    };

    const handleDelete = () => {
      confirmDelete(challenge.name, () => onDeleteChallenge(challenge.id));
    };

    if (isEditing) {
      return (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Edit challenge</Text>
          <View style={styles.setupSection}>
            <Text style={styles.formLabel}>Name</Text>
            <TextInput
              onChangeText={setChallengeName}
              placeholder="Challenge name"
              placeholderTextColor="#8a94a6"
              style={styles.menuInput}
              value={challengeName}
            />
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              multiline
              onChangeText={setChallengeDescription}
              placeholder="Description"
              placeholderTextColor="#8a94a6"
              style={[styles.menuInput, styles.setupDescriptionInput]}
              value={challengeDescription}
            />
            <Text style={styles.formLabel}>Chips / value</Text>
            <TextInput
              inputMode="numeric"
              keyboardType="number-pad"
              onChangeText={setChallengeChips}
              placeholder="Chips"
              placeholderTextColor="#8a94a6"
              style={styles.menuInput}
              value={challengeChips}
            />
            <Text style={styles.formLabel}>Type</Text>
            <View style={styles.colorSwatchRow}>
              {CHALLENGE_TYPES.map((type) => (
                <Pressable
                  accessibilityLabel={`Use challenge type ${type}`}
                  accessibilityRole="button"
                  key={type}
                  onPress={() => setChallengeType(type)}
                  style={[styles.teamOption, challengeType === type && styles.setupOptionSelected]}
                >
                  <Text style={styles.teamOptionText}>{getChallengeTypeLabel(type)}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.setupCoordinateRow}>
              <TextInput
                inputMode="numeric"
                keyboardType="number-pad"
                onChangeText={setChallengeX}
                placeholder="X"
                placeholderTextColor="#8a94a6"
                style={[styles.menuInput, styles.setupCoordinateInput]}
                value={challengeX}
              />
              <TextInput
                inputMode="numeric"
                keyboardType="number-pad"
                onChangeText={setChallengeY}
                placeholder="Y"
                placeholderTextColor="#8a94a6"
                style={[styles.menuInput, styles.setupCoordinateInput]}
                value={challengeY}
              />
            </View>
            <PrimaryButton disabled={isMutating} icon="save" label={isMutating ? "Saving..." : "Save"} onPress={saveEdit} />
            <Pressable onPress={cancelEdit} style={{ alignItems: "center", marginTop: 10 }}>
              <Text style={{ color: colors.muted, fontSize: 14 }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>{challenge.name}</Text>
          <Text style={styles.chipValue}>{getChallengeTypeLabel(challenge.challengeType)}</Text>
        </View>
        <View style={styles.setupSection}>
          <Text style={styles.formLabel}>Reward</Text>
          <Text style={styles.chipText}>{challenge.reward} chips</Text>
          <Text style={styles.formLabel}>Description</Text>
          <Text style={styles.emptyText}>{challenge.description}</Text>
          <Text style={styles.formLabel}>Coordinates</Text>
          <Text style={styles.chipText}>{challenge.xCoordinate}, {challenge.yCoordinate}</Text>
        </View>
        <View style={[styles.setupSection, { flexDirection: "row", gap: 8 }]}>
          <Pressable
            disabled={isMutating}
            onPress={enterEdit}
            style={[styles.iconButton, { flex: 1, justifyContent: "center" }]}
          >
            <MaterialIcons color={colors.ink} name="edit" size={18} />
            <Text style={styles.chipText}>Edit</Text>
          </Pressable>
          <Pressable
            disabled={isMutating}
            onPress={handleDelete}
            style={[styles.iconButton, { flex: 1, justifyContent: "center", borderColor: colors.danger }]}
          >
            <MaterialIcons color={colors.danger} name="delete-outline" size={18} />
            <Text style={[styles.chipText, { color: colors.danger }]}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return null;
}
