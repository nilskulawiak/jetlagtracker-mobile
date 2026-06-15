import { useState } from "react";
import { Alert, Platform, Pressable, Text, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { PrimaryButton } from "@/components/Shared/Buttons";
import { styles } from "@/components/Shared/styles";
import type {
  ChallengeResponse,
  ChallengeType,
  CreateChallengeRequest,
  CreateStationRequest,
  CreateTeamRequest,
  PatchChallengeRequest,
  PatchStationRequest,
  PatchTeamRequest,
  StationStateResponse,
  TeamResponse,
} from "@/types/game";
import { colors } from "@/utils/colors";
import { getChallengeTypeLabel } from "@/utils/challengeDisplay";

const TEAM_COLORS = ["#d92d20", "#1570ef", "#039855", "#dc6803", "#7f56d9", "#0891b2"];
const CHALLENGE_TYPES: ChallengeType[] = ["CHIPS", "MULTIPLIER", "STEAL", "CALL_YOUR_SHOT"];

function parsePositiveInteger(value: string, label: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    Alert.alert(label, `${label} must be a positive whole number.`);
    return null;
  }

  return parsed;
}

function confirmDelete(name: string, onConfirm: () => void) {
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

export function GameSetupPanel({
  challengeCount,
  challenges,
  isMutating,
  onCreateChallenge,
  onCreateStation,
  onCreateTeam,
  onDeleteChallenge,
  onDeleteStation,
  onDeleteTeam,
  onPatchChallenge,
  onPatchStation,
  onPatchTeam,
  onStartGame,
  stations,
  teams,
}: {
  challengeCount: number;
  challenges: ChallengeResponse[];
  isMutating: boolean;
  onCreateChallenge: (body: CreateChallengeRequest) => Promise<void>;
  onCreateStation: (body: CreateStationRequest) => Promise<void>;
  onCreateTeam: (body: CreateTeamRequest) => Promise<void>;
  onDeleteChallenge: (challengeId: string) => Promise<void>;
  onDeleteStation: (stationId: string) => Promise<void>;
  onDeleteTeam: (teamId: string) => Promise<void>;
  onPatchChallenge: (challengeId: string, body: PatchChallengeRequest) => Promise<void>;
  onPatchStation: (stationId: string, body: PatchStationRequest) => Promise<void>;
  onPatchTeam: (teamId: string, body: PatchTeamRequest) => Promise<void>;
  onStartGame: (body: { numberOfChallenges: number }) => Promise<void>;
  stations: StationStateResponse[];
  teams: TeamResponse[];
}) {
  const [numberOfChallenges, setNumberOfChallenges] = useState(String(Math.max(1, Math.min(3, challengeCount || 1))));

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [teamColor, setTeamColor] = useState(TEAM_COLORS[0]);
  const [teamName, setTeamName] = useState("");
  const [teamStartingChips, setTeamStartingChips] = useState("");

  const [editingStationId, setEditingStationId] = useState<string | null>(null);
  const [stationName, setStationName] = useState("");
  const [stationX, setStationX] = useState("");
  const [stationY, setStationY] = useState("");

  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null);
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
      return String(Math.max(1, safeNumber + direction));
    });
  };

  // Team helpers
  const enterEditTeam = (team: TeamResponse) => {
    setEditingTeamId(team.id);
    setTeamName(team.name);
    setTeamColor(team.color);
    setTeamStartingChips(team.availableChips != null ? String(team.availableChips) : "");
  };

  const cancelEditTeam = () => {
    setEditingTeamId(null);
    setTeamName("");
    setTeamColor(TEAM_COLORS[0]);
    setTeamStartingChips("");
  };

  const submitTeam = async () => {
    const trimmedName = teamName.trim();
    if (!trimmedName) { Alert.alert("Team name", "Enter a team name."); return; }
    const chips = teamStartingChips.trim() ? parsePositiveInteger(teamStartingChips, "Starting chips") : null;
    if (teamStartingChips.trim() && chips === null) return;

    if (editingTeamId) {
      await onPatchTeam(editingTeamId, {
        name: trimmedName,
        color: teamColor,
        ...(chips != null && { availableChips: chips }),
      });
      setEditingTeamId(null);
    } else {
      await onCreateTeam({ color: teamColor, name: trimmedName, startingChips: chips });
    }
    setTeamName("");
    setTeamColor(TEAM_COLORS[0]);
    setTeamStartingChips("");
  };

  const handleDeleteTeam = (team: TeamResponse) => {
    confirmDelete(team.name, () => onDeleteTeam(team.id));
  };

  // Station helpers
  const enterEditStation = (station: StationStateResponse) => {
    setEditingStationId(station.id);
    setStationName(station.name);
    setStationX(String(station.xCoordinate));
    setStationY(String(station.yCoordinate));
  };

  const cancelEditStation = () => {
    setEditingStationId(null);
    setStationName("");
    setStationX("");
    setStationY("");
  };

  const submitStation = async () => {
    const trimmedName = stationName.trim();
    const xCoordinate = parsePositiveInteger(stationX, "Station x coordinate");
    const yCoordinate = parsePositiveInteger(stationY, "Station y coordinate");
    if (!trimmedName) { Alert.alert("Station name", "Enter a station name."); return; }
    if (xCoordinate === null || yCoordinate === null) return;

    if (editingStationId) {
      await onPatchStation(editingStationId, { name: trimmedName, xCoordinate, yCoordinate });
      setEditingStationId(null);
    } else {
      await onCreateStation({ name: trimmedName, xCoordinate, yCoordinate });
    }
    setStationName("");
    setStationX("");
    setStationY("");
  };

  const handleDeleteStation = (station: StationStateResponse) => {
    confirmDelete(station.name, () => onDeleteStation(station.id));
  };

  // Challenge helpers
  const enterEditChallenge = (challenge: ChallengeResponse) => {
    setEditingChallengeId(challenge.id);
    setChallengeName(challenge.name);
    setChallengeDescription(challenge.description);
    setChallengeChips(String(challenge.reward));
    setChallengeType(challenge.challengeType);
    setChallengeX(String(challenge.xCoordinate));
    setChallengeY(String(challenge.yCoordinate));
  };

  const cancelEditChallenge = () => {
    setEditingChallengeId(null);
    setChallengeName("");
    setChallengeDescription("");
    setChallengeChips("");
    setChallengeX("");
    setChallengeY("");
  };

  const submitChallenge = async () => {
    const trimmedName = challengeName.trim();
    const trimmedDescription = challengeDescription.trim();
    const reward = parsePositiveInteger(challengeChips, "Challenge reward");
    const xCoordinate = parsePositiveInteger(challengeX, "Challenge x coordinate");
    const yCoordinate = parsePositiveInteger(challengeY, "Challenge y coordinate");
    if (!trimmedName) { Alert.alert("Challenge name", "Enter a challenge name."); return; }
    if (!trimmedDescription) { Alert.alert("Challenge description", "Enter a challenge description."); return; }
    if (reward === null || xCoordinate === null || yCoordinate === null) return;

    if (editingChallengeId) {
      await onPatchChallenge(editingChallengeId, {
        name: trimmedName,
        description: trimmedDescription,
        reward,
        challengeType,
        xCoordinate,
        yCoordinate,
      });
      setEditingChallengeId(null);
    } else {
      await onCreateChallenge({
        reward,
        challengeType,
        description: trimmedDescription,
        name: trimmedName,
        status: "CREATED",
        xCoordinate,
        yCoordinate,
      });
    }
    setChallengeName("");
    setChallengeDescription("");
    setChallengeChips("");
    setChallengeX("");
    setChallengeY("");
  };

  const handleDeleteChallenge = (challenge: ChallengeResponse) => {
    confirmDelete(challenge.name, () => onDeleteChallenge(challenge.id));
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
        <Text style={styles.formLabel}>{editingTeamId ? "Edit team" : "Add team"}</Text>
        {teams.map((team) => (
          <View key={team.id} style={[styles.menuListItem, editingTeamId === team.id && { borderColor: colors.info }]}>
            <View style={[styles.legendDot, { backgroundColor: team.color }]} />
            <Text style={[styles.chipText, { flex: 1 }]}>{team.name}</Text>
            <Text style={styles.chipValue}>{team.availableChips ?? "–"}</Text>
            <Pressable disabled={isMutating} onPress={() => enterEditTeam(team)} style={{ padding: 6 }}>
              <MaterialIcons color={colors.ink} name="edit" size={18} />
            </Pressable>
            <Pressable disabled={isMutating} onPress={() => handleDeleteTeam(team)} style={{ padding: 6 }}>
              <MaterialIcons color={colors.danger} name="delete" size={18} />
            </Pressable>
          </View>
        ))}
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
              style={[styles.colorSwatch, { backgroundColor: color }, teamColor === color && styles.colorSwatchSelected]}
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
        <PrimaryButton
          disabled={isMutating}
          icon={editingTeamId ? "save" : "group-add"}
          label={editingTeamId ? "Save team" : "Add team"}
          onPress={submitTeam}
        />
        {editingTeamId ? (
          <Pressable onPress={cancelEditTeam} style={{ alignItems: "center", marginTop: 10 }}>
            <Text style={{ color: colors.muted, fontSize: 14 }}>Cancel edit</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.setupSection}>
        <Text style={styles.formLabel}>{editingStationId ? "Edit station" : "Add station"}</Text>
        {stations.map((station) => (
          <View key={station.id} style={[styles.menuListItem, editingStationId === station.id && { borderColor: colors.info }]}>
            <MaterialIcons color={colors.muted} name="place" size={18} />
            <Text style={[styles.chipText, { flex: 1 }]}>{station.name}</Text>
            <Text style={styles.chipValue}>{station.xCoordinate}, {station.yCoordinate}</Text>
            <Pressable disabled={isMutating} onPress={() => enterEditStation(station)} style={{ padding: 6 }}>
              <MaterialIcons color={colors.ink} name="edit" size={18} />
            </Pressable>
            <Pressable disabled={isMutating} onPress={() => handleDeleteStation(station)} style={{ padding: 6 }}>
              <MaterialIcons color={colors.danger} name="delete" size={18} />
            </Pressable>
          </View>
        ))}
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
        <PrimaryButton
          disabled={isMutating}
          icon={editingStationId ? "save" : "add-location-alt"}
          label={editingStationId ? "Save station" : "Add station"}
          onPress={submitStation}
        />
        {editingStationId ? (
          <Pressable onPress={cancelEditStation} style={{ alignItems: "center", marginTop: 10 }}>
            <Text style={{ color: colors.muted, fontSize: 14 }}>Cancel edit</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.setupSection}>
        <Text style={styles.formLabel}>{editingChallengeId ? "Edit challenge" : "Add challenge"}</Text>
        {challenges.map((challenge) => (
          <View key={challenge.id} style={[styles.menuListItem, editingChallengeId === challenge.id && { borderColor: colors.info }]}>
            <MaterialIcons color={colors.muted} name="emoji-events" size={18} />
            <Text style={[styles.chipText, { flex: 1 }]}>{challenge.name}</Text>
            <Text style={styles.chipValue}>{getChallengeTypeLabel(challenge.challengeType)}</Text>
            <Pressable disabled={isMutating} onPress={() => enterEditChallenge(challenge)} style={{ padding: 6 }}>
              <MaterialIcons color={colors.ink} name="edit" size={18} />
            </Pressable>
            <Pressable disabled={isMutating} onPress={() => handleDeleteChallenge(challenge)} style={{ padding: 6 }}>
              <MaterialIcons color={colors.danger} name="delete" size={18} />
            </Pressable>
          </View>
        ))}
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
        <PrimaryButton
          disabled={isMutating}
          icon={editingChallengeId ? "save" : "add-task"}
          label={editingChallengeId ? "Save challenge" : "Add challenge"}
          onPress={submitChallenge}
        />
        {editingChallengeId ? (
          <Pressable onPress={cancelEditChallenge} style={{ alignItems: "center", marginTop: 10 }}>
            <Text style={{ color: colors.muted, fontSize: 14 }}>Cancel edit</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
