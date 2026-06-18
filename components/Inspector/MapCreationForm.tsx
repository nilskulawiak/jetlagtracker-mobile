import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { ItemFormBody } from "@/components/Inspector/ItemFormBody";
import { styles } from "@/components/Shared/styles";
import type { ChallengeType, CreateChallengeRequest, CreateStationRequest } from "@/types/game";
import { CHALLENGE_TYPES, parsePositiveInteger } from "@/utils/setupHelpers";

export function MapCreationForm({
  gameX,
  gameY,
  isMutating,
  onCancel,
  onCoordinateChange,
  onCreateChallenge,
  onCreateStation,
  onRewardChange,
  type,
}: {
  gameX: number;
  gameY: number;
  isMutating: boolean;
  onCancel: () => void;
  onCoordinateChange: (x: number, y: number) => void;
  onCreateChallenge: (body: CreateChallengeRequest) => Promise<void>;
  onCreateStation: (body: CreateStationRequest) => Promise<void>;
  onRewardChange?: (reward: number | null) => void;
  type: "STATION" | "CHALLENGE";
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [chips, setChips] = useState("");
  const [challengeType, setChallengeType] = useState<ChallengeType>(CHALLENGE_TYPES[0]);
  const [xStr, setXStr] = useState(String(gameX));
  const [yStr, setYStr] = useState(String(gameY));

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

  const handleChipsChange = (text: string) => {
    setChips(text);
    const parsed = parseInt(text, 10);
    onRewardChange?.(Number.isInteger(parsed) && parsed > 0 ? parsed : null);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const xCoordinate = parsePositiveInteger(xStr, "X coordinate");
    const yCoordinate = parsePositiveInteger(yStr, "Y coordinate");
    if (!trimmedName || xCoordinate === null || yCoordinate === null) return;

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
      <ItemFormBody
        autoFocusName
        challengeType={challengeType}
        chips={chips}
        description={description}
        isMutating={isMutating}
        name={name}
        onCancel={onCancel}
        onChallengeTypeChange={setChallengeType}
        onChipsChange={handleChipsChange}
        onDescriptionChange={setDescription}
        onNameChange={setName}
        onSave={handleSave}
        onXChange={handleXChange}
        onYChange={handleYChange}
        saveIcon={type === "STATION" ? "add-location-alt" : "add-task"}
        saveLabel={type === "STATION" ? "Add station" : "Add challenge"}
        type={type}
        xStr={xStr}
        yStr={yStr}
      />
    </View>
  );
}
