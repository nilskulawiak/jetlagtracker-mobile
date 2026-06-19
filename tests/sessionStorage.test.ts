import * as SecureStore from "expo-secure-store";

import { clearSession, getSession, saveSession } from "../utils/sessionStorage";
import type { StoredSession } from "../utils/sessionStorage";

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockStore = SecureStore as jest.Mocked<typeof SecureStore>;

const SESSION_KEY = "jetlag_session";

const session: StoredSession = {
  sessionToken: "tok-abc123",
  userId: "uid-1",
  email: "test@example.com",
  displayName: "Tester",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("sessionStorage", () => {
  test("saveSession serializes and writes to SecureStore under the correct key", async () => {
    await saveSession(session);

    expect(mockStore.setItemAsync).toHaveBeenCalledWith(SESSION_KEY, JSON.stringify(session));
    expect(mockStore.setItemAsync).toHaveBeenCalledTimes(1);
  });

  test("getSession reads from SecureStore and deserializes", async () => {
    mockStore.getItemAsync.mockResolvedValue(JSON.stringify(session));

    const result = await getSession();

    expect(mockStore.getItemAsync).toHaveBeenCalledWith(SESSION_KEY);
    expect(result).toEqual(session);
  });

  test("getSession returns null when SecureStore has no entry", async () => {
    mockStore.getItemAsync.mockResolvedValue(null);

    const result = await getSession();

    expect(result).toBeNull();
  });

  test("clearSession deletes the session key from SecureStore", async () => {
    await clearSession();

    expect(mockStore.deleteItemAsync).toHaveBeenCalledWith(SESSION_KEY);
    expect(mockStore.deleteItemAsync).toHaveBeenCalledTimes(1);
  });

  test("saveSession then getSession roundtrip preserves all fields", async () => {
    let stored: string | null = null;
    mockStore.setItemAsync.mockImplementation(async (_key, value) => {
      stored = value;
    });
    mockStore.getItemAsync.mockImplementation(async () => stored);

    await saveSession(session);
    const result = await getSession();

    expect(result).toEqual(session);
  });
});
