import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApiError, getMe, logout } from "@/api/gameApi";
import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";
import { GameScreen } from "@/screens/GameScreen";
import { MenuScreen } from "@/screens/MenuScreen";
import { TeamChoiceScreen } from "@/screens/TeamChoiceScreen";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { RegisterScreen } from "@/screens/auth/RegisterScreen";
import { clearSession, getSession } from "@/utils/sessionStorage";
import type { MemberRole } from "@/types/game";

type AuthState = "checking" | "authed" | "unauthed";
type AuthMode = "login" | "register";

type ActiveGame = {
  gameId: string;
  teamId?: string;
  role?: MemberRole;
};

export default function Index() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
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

  const openGame = (gameId: string, teamId?: string, role?: MemberRole) => {
    setActiveGame({ gameId, teamId, role });
  };

  const handleLogOut = async () => {
    try {
      await logout();
    } catch {
      // ignore — always clear locally even if the server call fails
    }
    await clearSession();
    setActiveGame(null);
    setAuthState("unauthed");
  };

  const handleAuthError = async () => {
    await clearSession();
    setActiveGame(null);
    setAuthState("unauthed");
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

  if (activeGame && !activeGame.teamId) {
    return (
      <TeamChoiceScreen
        gameId={activeGame.gameId}
        onBack={() => setActiveGame(null)}
        onTeamChosen={(teamId) => setActiveGame((prev) => prev ? { ...prev, teamId } : null)}
      />
    );
  }

  if (activeGame) {
    return (
      <GameScreen
        initialGameId={activeGame.gameId}
        initialTeamId={activeGame.teamId}
        onBackToMenu={() => setActiveGame(null)}
      />
    );
  }

  return (
    <MenuScreen
      onAuthError={() => { void handleAuthError(); }}
      onLogOut={() => { void handleLogOut(); }}
      onOpenGame={openGame}
    />
  );
}
