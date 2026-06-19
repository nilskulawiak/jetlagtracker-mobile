import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApiError, getMe } from "@/api/gameApi";
import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";
import { GameScreen } from "@/screens/GameScreen";
import { MenuScreen } from "@/screens/MenuScreen";
import { TeamChoiceScreen } from "@/screens/TeamChoiceScreen";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { RegisterScreen } from "@/screens/auth/RegisterScreen";
import { clearSession, getSession } from "@/utils/sessionStorage";

type AuthState = "checking" | "authed" | "unauthed";
type AuthMode = "login" | "register";

type ActiveGame = {
  gameId: string;
  teamId: string;
};

export default function Index() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [pendingGameId, setPendingGameId] = useState<string | null>(null);
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);

  useEffect(() => {
    void checkAuth();
  }, []);

  async function checkAuth() {
    const session = await getSession();
    if (!session) {
      setAuthState("unauthed");
      return;
    }
    try {
      await getMe();
      setAuthState("authed");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearSession();
        setAuthState("unauthed");
      } else {
        // Network error — assume session is still valid, proceed optimistically
        setAuthState("authed");
      }
    }
  }

  const backToMenu = () => {
    setActiveGame(null);
    setPendingGameId(null);
  };

  if (authState === "checking") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.info} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (authState === "unauthed") {
    return authMode === "login" ? (
      <LoginScreen
        onAuthed={() => setAuthState("authed")}
        onGoToRegister={() => setAuthMode("register")}
      />
    ) : (
      <RegisterScreen
        onAuthed={() => setAuthState("authed")}
        onGoToLogin={() => setAuthMode("login")}
      />
    );
  }

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
