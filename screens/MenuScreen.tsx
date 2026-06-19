import { useState } from "react";

import type { MemberRole, PresetSummaryResponse } from "@/types/game";
import { ContinueGamePage } from "./menu/ContinueGamePage";
import { HomePage } from "./menu/HomePage";
import { JoinGamePage } from "./menu/JoinGamePage";
import { ManualGameFormPage } from "./menu/ManualGameFormPage";
import { PresetFormPage } from "./menu/PresetFormPage";
import { PresetsPage } from "./menu/PresetsPage";
import { SettingsPage } from "./menu/SettingsPage";

type MenuMode = "home" | "continue" | "join" | "manualForm" | "presets" | "presetForm" | "settings";

export function MenuScreen({
  onAuthError,
  onLogOut,
  onOpenGame,
}: {
  onAuthError: () => void;
  onLogOut: () => void;
  onOpenGame: (gameId: string, teamId?: string, role?: MemberRole) => void;
}) {
  const [mode, setMode] = useState<MenuMode>("home");
  const [selectedPreset, setSelectedPreset] = useState<PresetSummaryResponse | null>(null);

  if (mode === "home") {
    return (
      <HomePage
        onContinueGame={() => setMode("continue")}
        onCreateManually={() => setMode("manualForm")}
        onCreateFromPreset={() => setMode("presets")}
        onJoinGame={() => setMode("join")}
        onLogOut={onLogOut}
        onSettings={() => setMode("settings")}
      />
    );
  }

  if (mode === "manualForm") {
    return (
      <ManualGameFormPage
        onBack={() => setMode("home")}
        onGameCreated={(gameId) => onOpenGame(gameId, undefined, "HOST")}
      />
    );
  }

  if (mode === "continue") {
    return (
      <ContinueGamePage
        onAuthError={onAuthError}
        onBack={() => setMode("home")}
        onOpenGame={onOpenGame}
      />
    );
  }

  if (mode === "join") {
    return (
      <JoinGamePage
        onBack={() => setMode("home")}
        onOpenGame={onOpenGame}
      />
    );
  }

  if (mode === "presets") {
    return (
      <PresetsPage
        onBack={() => setMode("home")}
        onSelectPreset={(preset) => {
          setSelectedPreset(preset);
          setMode("presetForm");
        }}
      />
    );
  }

  if (mode === "presetForm" && selectedPreset) {
    return (
      <PresetFormPage
        onBack={() => setMode("presets")}
        onGameCreated={(gameId) => onOpenGame(gameId, undefined, "HOST")}
        preset={selectedPreset}
      />
    );
  }

  if (mode === "settings") {
    return <SettingsPage onBack={() => setMode("home")} />;
  }

  return null;
}
