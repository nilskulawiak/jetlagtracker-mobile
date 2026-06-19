import * as SecureStore from "expo-secure-store";

export interface StoredSession {
  sessionToken: string;
  userId: string;
  email: string;
  displayName: string;
}

const SESSION_KEY = "jetlag_session";

export async function saveSession(session: StoredSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<StoredSession | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  return raw ? (JSON.parse(raw) as StoredSession) : null;
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
