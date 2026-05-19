import { useState } from "react";

import { GameScreen } from "@/screens/GameScreen";
import { MenuScreen } from "@/screens/MenuScreen";
import { TeamChoiceScreen } from "@/screens/TeamChoiceScreen";

type ActiveGame = {
  gameId: string;
  teamId: string;
};

export default function Index() {
  const [pendingGameId, setPendingGameId] = useState<string | null>(null);
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);

  const backToMenu = () => {
    setActiveGame(null);
    setPendingGameId(null);
  };

  return activeGame ? (
    <GameScreen
      initialGameId={activeGame.gameId}
      initialTeamId={activeGame.teamId}
      onBackToMenu={backToMenu}
    />
  ) : pendingGameId ? (
    <TeamChoiceScreen
      gameId={pendingGameId}
      onBackToMenu={backToMenu}
      onSelectTeam={(teamId) => setActiveGame({ gameId: pendingGameId, teamId })}
    />
  ) : (
    <MenuScreen onOpenGame={setPendingGameId} />
  );
}
