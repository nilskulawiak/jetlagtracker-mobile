import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export interface StoredSession {
  sessionToken: string;
  userId: string;
  email: string;
  displayName: string;
}

const SESSION_KEY = "jetlag_session";

export async function saveSession(session: StoredSession): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<StoredSession | null> {
  if (Platform.OS === "web") {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  }
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  return raw ? (JSON.parse(raw) as StoredSession) : null;
}

export async function clearSession(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
