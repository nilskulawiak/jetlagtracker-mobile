import type { StoredSession } from "./sessionStorage";

export type { StoredSession };

const SESSION_KEY = "jetlag_session";

export async function saveSession(session: StoredSession): Promise<void> {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<StoredSession | null> {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as StoredSession) : null;
}

export async function clearSession(): Promise<void> {
  localStorage.removeItem(SESSION_KEY);
}
