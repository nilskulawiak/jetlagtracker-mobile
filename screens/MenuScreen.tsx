import { useState } from "react";

import type { PresetSummaryResponse } from "@/types/game";
import { ContinueGamePage } from "./menu/ContinueGamePage";
import { HomePage } from "./menu/HomePage";
import { PresetFormPage } from "./menu/PresetFormPage";
import { PresetsPage } from "./menu/PresetsPage";
import { SettingsPage } from "./menu/SettingsPage";

type MenuMode = "home" | "continue" | "presets" | "presetForm" | "settings";

export function MenuScreen({ onOpenGame }: { onOpenGame: (gameId: string) => void }) {
  const [mode, setMode] = useState<MenuMode>("home");
  const [selectedPreset, setSelectedPreset] = useState<PresetSummaryResponse | null>(null);

  if (mode === "home") {
    return (
      <HomePage
        onContinueGame={() => setMode("continue")}
        onCreateFromPreset={() => setMode("presets")}
        onSettings={() => setMode("settings")}
      />
    );
  }

  if (mode === "continue") {
    return (
      <ContinueGamePage
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
        onGameCreated={onOpenGame}
        preset={selectedPreset}
      />
    );
  }

  if (mode === "settings") {
    return <SettingsPage onBack={() => setMode("home")} />;
  }

  return null;
}
