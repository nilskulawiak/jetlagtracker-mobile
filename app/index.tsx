import { useState } from "react";

import { GameScreen } from "@/screens/GameScreen";
import { MenuScreen } from "@/screens/MenuScreen";

export default function Index() {
  const [gameId, setGameId] = useState<string | null>(null);

  return gameId ? (
    <GameScreen initialGameId={gameId} onBackToMenu={() => setGameId(null)} />
  ) : (
    <MenuScreen onOpenGame={setGameId} />
  );
}
