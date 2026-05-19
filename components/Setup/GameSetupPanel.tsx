import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { PrimaryButton } from "@/components/Shared/Buttons";
import { styles } from "@/components/Shared/styles";
import type { ChallengeType, CreateChallengeRequest, CreateStationRequest, CreateTeamRequest } from "@/types/game";
import { colors } from "@/utils/colors";

const TEAM_COLORS = ["#d92d20", "#1570ef", "#039855", "#dc6803", "#7f56d9", "#0891b2"];
const CHALLENGE_TYPES: ChallengeType[] = ["CHIPS", "MULTIPLIER", "STEAL"];

function parsePositiveInteger(value: string, label: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    Alert.alert(label, `${label} must be a positive whole number.`);
    return null;
  }

  return parsed;
}

export function GameSetupPanel({
  challengeCount,
  isMutating,
  onCreateChallenge,
  onCreateStation,
  onCreateTeam,
  onStartGame,
}: {
  challengeCount: number;
  isMutating: boolean;
  onCreateChallenge: (body: CreateChallengeRequest) => Promise<void>;
  onCreateStation: (body: CreateStationRequest) => Promise<void>;
  onCreateTeam: (body: CreateTeamRequest) => Promise<void>;
  onStartGame: (body: { numberOfChallenges: number }) => Promise<void>;
}) {
  const [numberOfChallenges, setNumberOfChallenges] = useState(String(Math.max(1, Math.min(3, challengeCount || 1))));
  const [teamColor, setTeamColor] = useState(TEAM_COLORS[0]);
  const [teamName, setTeamName] = useState("");
  const [teamStartingChips, setTeamStartingChips] = useState("");
  const [stationName, setStationName] = useState("");
  const [stationX, setStationX] = useState("");
  const [stationY, setStationY] = useState("");
  const [challengeName, setChallengeName] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeChips, setChallengeChips] = useState("");
  const [challengeType, setChallengeType] = useState<ChallengeType>("CHIPS");
  const [challengeX, setChallengeX] = useState("");
  const [challengeY, setChallengeY] = useState("");

  const startCreatedGame = async () => {
    const parsedNumberOfChallenges = parsePositiveInteger(numberOfChallenges, "Number of challenges");

    if (parsedNumberOfChallenges === null) return;

    await onStartGame({ numberOfChallenges: parsedNumberOfChallenges });
  };

  const stepNumberOfChallenges = (direction: -1 | 1) => {
    setNumberOfChallenges((currentValue) => {
      const currentNumber = Number(currentValue);
      const safeNumber = Number.isInteger(currentNumber) && currentNumber > 0 ? currentNumber : 1;
      const nextNumber = Math.max(1, safeNumber + direction);

      return String(nextNumber);
    });
  };

  const submitTeam = async () => {
    const trimmedName = teamName.trim();

    if (!trimmedName) {
      Alert.alert("Team name", "Enter a team name.");
      return;
    }

    const startingChips = teamStartingChips.trim() ? parsePositiveInteger(teamStartingChips, "Starting chips") : null;

    if (teamStartingChips.trim() && startingChips === null) return;

    await onCreateTeam({
      color: teamColor,
      name: trimmedName,
      startingChips,
    });
    setTeamName("");
    setTeamStartingChips("");
  };

  const submitStation = async () => {
    const trimmedName = stationName.trim();
    const xCoordinate = parsePositiveInteger(stationX, "Station x coordinate");
    const yCoordinate = parsePositiveInteger(stationY, "Station y coordinate");

    if (!trimmedName) {
      Alert.alert("Station name", "Enter a station name.");
      return;
    }

    if (xCoordinate === null || yCoordinate === null) return;

    await onCreateStation({
      name: trimmedName,
      xCoordinate,
      yCoordinate,
    });
    setStationName("");
    setStationX("");
    setStationY("");
  };

  const submitChallenge = async () => {
    const trimmedName = challengeName.trim();
    const trimmedDescription = challengeDescription.trim();
    const reward = parsePositiveInteger(challengeChips, "Challenge reward");
    const xCoordinate = parsePositiveInteger(challengeX, "Challenge x coordinate");
    const yCoordinate = parsePositiveInteger(challengeY, "Challenge y coordinate");

    if (!trimmedName) {
      Alert.alert("Challenge name", "Enter a challenge name.");
      return;
    }

    if (!trimmedDescription) {
      Alert.alert("Challenge description", "Enter a challenge description.");
      return;
    }

    if (reward === null || xCoordinate === null || yCoordinate === null) return;

    await onCreateChallenge({
      reward,
      challengeType,
      description: trimmedDescription,
      name: trimmedName,
      status: "CREATED",
      xCoordinate,
      yCoordinate,
    });
    setChallengeName("");
    setChallengeDescription("");
    setChallengeChips("");
    setChallengeX("");
    setChallengeY("");
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Game setup</Text>

      <View style={styles.setupSection}>
        <Text style={styles.formLabel}>Challenges to reveal</Text>
        <View style={styles.stepperRow}>
          <Pressable
            accessibilityLabel="Reveal fewer challenges"
            accessibilityRole="button"
            disabled={isMutating || Number(numberOfChallenges) <= 1}
            onPress={() => stepNumberOfChallenges(-1)}
            style={[styles.stepperButton, isMutating && styles.disabledButton]}
          >
            <MaterialIcons color={colors.ink} name="remove" size={22} />
          </Pressable>
          <TextInput
            inputMode="numeric"
            keyboardType="number-pad"
            onChangeText={setNumberOfChallenges}
            style={[styles.chipInput, styles.stepperNumberInput]}
            value={numberOfChallenges}
          />
          <Pressable
            accessibilityLabel="Reveal more challenges"
            accessibilityRole="button"
            disabled={isMutating}
            onPress={() => stepNumberOfChallenges(1)}
            style={[styles.stepperButton, isMutating && styles.disabledButton]}
          >
            <MaterialIcons color={colors.ink} name="add" size={22} />
          </Pressable>
        </View>
        <PrimaryButton
          disabled={isMutating}
          icon="play-arrow"
          label={isMutating ? "Saving..." : "Start game"}
          onPress={startCreatedGame}
        />
      </View>

      <View style={styles.setupSection}>
        <Text style={styles.formLabel}>Add team</Text>
        <TextInput
          onChangeText={setTeamName}
          placeholder="Team name"
          placeholderTextColor="#8a94a6"
          style={styles.menuInput}
          value={teamName}
        />
        <View style={styles.colorSwatchRow}>
          {TEAM_COLORS.map((color) => (
            <Pressable
              accessibilityLabel={`Use color ${color}`}
              accessibilityRole="button"
              key={color}
              onPress={() => setTeamColor(color)}
              style={[
                styles.colorSwatch,
                { backgroundColor: color },
                teamColor === color && styles.colorSwatchSelected,
              ]}
            />
          ))}
        </View>
        <TextInput
          inputMode="numeric"
          keyboardType="number-pad"
          onChangeText={setTeamStartingChips}
          placeholder="Starting chips"
          placeholderTextColor="#8a94a6"
          style={styles.menuInput}
          value={teamStartingChips}
        />
        <PrimaryButton disabled={isMutating} icon="group-add" label="Add team" onPress={submitTeam} />
      </View>

      <View style={styles.setupSection}>
        <Text style={styles.formLabel}>Add station</Text>
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
        <PrimaryButton disabled={isMutating} icon="add-location-alt" label="Add station" onPress={submitStation} />
      </View>

      <View style={styles.setupSection}>
        <Text style={styles.formLabel}>Add challenge</Text>
        <TextInput
          onChangeText={setChallengeName}
          placeholder="Challenge name"
          placeholderTextColor="#8a94a6"
          style={styles.menuInput}
          value={challengeName}
        />
        <TextInput
          multiline
          onChangeText={setChallengeDescription}
          placeholder="Description"
          placeholderTextColor="#8a94a6"
          style={[styles.menuInput, styles.setupDescriptionInput]}
          value={challengeDescription}
        />
        <TextInput
          inputMode="numeric"
          keyboardType="number-pad"
          onChangeText={setChallengeChips}
          placeholder="Chips / value"
          placeholderTextColor="#8a94a6"
          style={styles.menuInput}
          value={challengeChips}
        />
        <View style={styles.colorSwatchRow}>
          {CHALLENGE_TYPES.map((type) => (
            <Pressable
              accessibilityLabel={`Use challenge type ${type}`}
              accessibilityRole="button"
              key={type}
              onPress={() => setChallengeType(type)}
              style={[
                styles.teamOption,
                challengeType === type && styles.setupOptionSelected,
              ]}
            >
              <Text style={styles.teamOptionText}>{type}</Text>
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
        <PrimaryButton disabled={isMutating} icon="add-task" label="Add challenge" onPress={submitChallenge} />
      </View>
    </View>
  );
}
