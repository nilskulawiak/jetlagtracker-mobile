import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { ItemFormBody } from "@/components/Inspector/ItemFormBody";
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
import { confirmDelete, parsePositiveInteger } from "@/utils/setupHelpers";

export function CreationInspector({
  challenge,
  isMutating,
  onCoordinateChange,
  onDeleteChallenge,
  onDeleteStation,
  onEditingChange,
  onPatchChallenge,
  onPatchStation,
  pendingCoords,
  station,
}: {
  challenge?: ChallengeResponse | null;
  isMutating: boolean;
  onCoordinateChange?: (x: number, y: number) => void;
  onDeleteChallenge: (id: string) => Promise<void>;
  onDeleteStation: (id: string) => Promise<void>;
  onEditingChange?: (isEditing: boolean) => void;
  onPatchChallenge: (id: string, body: PatchChallengeRequest) => Promise<void>;
  onPatchStation: (id: string, body: PatchStationRequest) => Promise<void>;
  pendingCoords?: { x: number; y: number } | null;
  station?: StationStateResponse | null;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const [stationName, setStationName] = useState("");
  const [stationX, setStationX] = useState("");
  const [stationY, setStationY] = useState("");

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

  // Auto-enter edit mode on first drag; sync x/y on subsequent drags.
  // Intentionally omits isEditing/station/challenge from deps — only re-runs when coords change.
  useEffect(() => {
    if (!pendingCoords) return;
    if (!isEditing) {
      if (station) {
        setStationName(station.name);
        setStationX(String(pendingCoords.x));
        setStationY(String(pendingCoords.y));
        setIsEditing(true);
      } else if (challenge) {
        setChallengeName(challenge.name);
        setChallengeDescription(challenge.description);
        setChallengeChips(String(challenge.reward));
        setChallengeType(challenge.challengeType);
        setChallengeX(String(pendingCoords.x));
        setChallengeY(String(pendingCoords.y));
        setIsEditing(true);
      }
    } else {
      if (station) {
        setStationX(String(pendingCoords.x));
        setStationY(String(pendingCoords.y));
      } else if (challenge) {
        setChallengeX(String(pendingCoords.x));
        setChallengeY(String(pendingCoords.y));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCoords]);

  if (station) {
    const enterEdit = () => {
      setStationName(station.name);
      setStationX(String(station.xCoordinate));
      setStationY(String(station.yCoordinate));
      setIsEditing(true);
      onEditingChange?.(true);
    };

    const cancelEdit = () => {
      setIsEditing(false);
      onEditingChange?.(false);
    };

    const saveEdit = async () => {
      const trimmedName = stationName.trim();
      const xCoordinate = parsePositiveInteger(stationX, "Station x coordinate");
      const yCoordinate = parsePositiveInteger(stationY, "Station y coordinate");
      if (!trimmedName || xCoordinate === null || yCoordinate === null) return;
      await onPatchStation(station.id, { name: trimmedName, xCoordinate, yCoordinate });
      setIsEditing(false);
      onEditingChange?.(false);
    };

    const handleDelete = () => confirmDelete(station.name, () => onDeleteStation(station.id));

    const handleStationXChange = (text: string) => {
      setStationX(text);
      const parsedX = parseInt(text, 10);
      const parsedY = parseInt(stationY, 10);
      if (parsedX > 0 && parsedY > 0) onCoordinateChange?.(parsedX, parsedY);
    };

    const handleStationYChange = (text: string) => {
      setStationY(text);
      const parsedX = parseInt(stationX, 10);
      const parsedY = parseInt(text, 10);
      if (parsedX > 0 && parsedY > 0) onCoordinateChange?.(parsedX, parsedY);
    };

    if (isEditing) {
      return (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Edit station</Text>
          <ItemFormBody
            isMutating={isMutating}
            name={stationName}
            onCancel={cancelEdit}
            onDelete={handleDelete}
            onNameChange={setStationName}
            onSave={saveEdit}
            onXChange={handleStationXChange}
            onYChange={handleStationYChange}
            type="STATION"
            xStr={stationX}
            yStr={stationY}
          />
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
      onEditingChange?.(true);
    };

    const cancelEdit = () => {
      setIsEditing(false);
      onEditingChange?.(false);
    };

    const saveEdit = async () => {
      const trimmedName = challengeName.trim();
      const trimmedDescription = challengeDescription.trim();
      const reward = parsePositiveInteger(challengeChips, "Challenge reward");
      const xCoordinate = parsePositiveInteger(challengeX, "Challenge x coordinate");
      const yCoordinate = parsePositiveInteger(challengeY, "Challenge y coordinate");
      if (!trimmedName || !trimmedDescription || reward === null || xCoordinate === null || yCoordinate === null) return;
      await onPatchChallenge(challenge.id, { name: trimmedName, description: trimmedDescription, reward, challengeType, xCoordinate, yCoordinate });
      setIsEditing(false);
      onEditingChange?.(false);
    };

    const handleDelete = () => confirmDelete(challenge.name, () => onDeleteChallenge(challenge.id));

    const handleChallengeXChange = (text: string) => {
      setChallengeX(text);
      const parsedX = parseInt(text, 10);
      const parsedY = parseInt(challengeY, 10);
      if (parsedX > 0 && parsedY > 0) onCoordinateChange?.(parsedX, parsedY);
    };

    const handleChallengeYChange = (text: string) => {
      setChallengeY(text);
      const parsedX = parseInt(challengeX, 10);
      const parsedY = parseInt(text, 10);
      if (parsedX > 0 && parsedY > 0) onCoordinateChange?.(parsedX, parsedY);
    };

    if (isEditing) {
      return (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Edit challenge</Text>
          <ItemFormBody
            challengeType={challengeType}
            chips={challengeChips}
            description={challengeDescription}
            isMutating={isMutating}
            name={challengeName}
            onCancel={cancelEdit}
            onChallengeTypeChange={setChallengeType}
            onChipsChange={setChallengeChips}
            onDelete={handleDelete}
            onDescriptionChange={setChallengeDescription}
            onNameChange={setChallengeName}
            onSave={saveEdit}
            onXChange={handleChallengeXChange}
            onYChange={handleChallengeYChange}
            type="CHALLENGE"
            xStr={challengeX}
            yStr={challengeY}
          />
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
