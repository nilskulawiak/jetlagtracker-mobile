import {
  generateInvite,
  getMe,
  getMyGames,
  joinGame,
  login,
  logout,
  register,
  setApiBaseUrl,
  setMyTeam,
} from "../api/gameApi";
import type {
  AuthResponse,
  GameMembershipResponse,
  JoinGameResponse,
  UserResponse,
} from "../types/game";
import { getSession } from "@/utils/sessionStorage";
import type { StoredSession } from "../utils/sessionStorage";

jest.mock("@/utils/sessionStorage", () => ({
  getSession: jest.fn(),
}));

const mockGetSession = jest.mocked(getSession);

const mockFetch = jest.fn();
global.fetch = mockFetch;

const storedSession: StoredSession = {
  sessionToken: "test-token-abc",
  userId: "uid-1",
  email: "user@example.com",
  displayName: "Tester",
};

const mockUser: UserResponse = {
  id: "uid-1",
  email: "user@example.com",
  displayName: "Tester",
};

const mockAuthResponse: AuthResponse = {
  sessionToken: "tok-abc",
  user: mockUser,
};

beforeAll(() => {
  setApiBaseUrl("http://test");
});

beforeEach(() => {
  jest.useFakeTimers();
  mockFetch.mockReset();
  mockGetSession.mockResolvedValue(null);
});

afterEach(() => {
  jest.useRealTimers();
});

function setupFetch(status: number, body?: unknown) {
  mockFetch.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => "",
  } as Response);
}

describe("auth header injection", () => {
  test("includes Authorization header when session token is stored", async () => {
    mockGetSession.mockResolvedValue(storedSession);
    setupFetch(200, mockUser);

    await getMe();

    expect(mockFetch).toHaveBeenCalledWith(
      "http://test/auth/me",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token-abc",
        }),
      }),
    );
  });

  test("omits Authorization header when no session is stored", async () => {
    mockGetSession.mockResolvedValue(null);
    setupFetch(200, mockUser);

    await getMe();

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });
});

describe("register", () => {
  test("sends POST /auth/register with email, displayName, and password", async () => {
    setupFetch(200, mockAuthResponse);

    const result = await register("user@example.com", "Tester", "secret123");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://test/auth/register",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "user@example.com", displayName: "Tester", password: "secret123" }),
      }),
    );
    expect(result).toEqual(mockAuthResponse);
  });
});

describe("login", () => {
  test("sends POST /auth/login with email and password", async () => {
    setupFetch(200, mockAuthResponse);

    const result = await login("user@example.com", "secret123");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://test/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "user@example.com", password: "secret123" }),
      }),
    );
    expect(result).toEqual(mockAuthResponse);
  });
});

describe("logout", () => {
  test("sends POST /auth/logout", async () => {
    setupFetch(204);

    await logout();

    expect(mockFetch).toHaveBeenCalledWith(
      "http://test/auth/logout",
      expect.objectContaining({ method: "POST" }),
    );
  });
});

describe("getMe", () => {
  test("sends GET /auth/me and returns the user", async () => {
    setupFetch(200, mockUser);

    const result = await getMe();

    expect(mockFetch).toHaveBeenCalledWith("http://test/auth/me", expect.any(Object));
    expect(result).toEqual(mockUser);
  });
});

describe("getMyGames", () => {
  test("sends GET /games/mine and returns membership list", async () => {
    const memberships: GameMembershipResponse[] = [
      {
        gameId: "game-1",
        role: "HOST",
        teamId: "team-1",
        teamName: "Team A",
        game: {
          id: "game-1",
          name: "Taiwan Rail Rush",
          status: "STARTED",
          createdAt: "2024-01-01T00:00:00Z",
          mapWidth: 1000,
          mapHeight: 800,
          mapImage: "taiwan.png",
        },
      },
    ];
    setupFetch(200, memberships);

    const result = await getMyGames();

    expect(mockFetch).toHaveBeenCalledWith("http://test/games/mine", expect.any(Object));
    expect(result).toEqual(memberships);
  });
});

describe("generateInvite", () => {
  test("sends POST /games/{gameId}/invites and returns invite code", async () => {
    setupFetch(200, { inviteCode: "ABCD1234" });

    const result = await generateInvite("game-123");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://test/games/game-123/invites",
      expect.objectContaining({ method: "POST" }),
    );
    expect(result).toEqual({ inviteCode: "ABCD1234" });
  });
});

describe("joinGame", () => {
  test("sends POST /games/join with inviteCode body and returns join response", async () => {
    const joinResponse: JoinGameResponse = {
      gameId: "game-123",
      role: "PLAYER",
      teamId: "team-456",
      game: {
        game: {
          id: "game-123",
          name: "Test Game",
          status: "STARTED",
          createdAt: "2024-01-01T00:00:00Z",
          mapWidth: 1000,
          mapHeight: 800,
          mapImage: "taiwan.png",
        },
        teams: [],
        stations: [],
        challenges: [],
        actions: [],
      },
    };
    setupFetch(200, joinResponse);

    const result = await joinGame("ABCD1234");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://test/games/join",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ inviteCode: "ABCD1234" }),
      }),
    );
    expect(result).toEqual(joinResponse);
  });
});

describe("setMyTeam", () => {
  test("sends PATCH /games/{gameId}/my-team with teamId body", async () => {
    setupFetch(204);

    await setMyTeam("game-123", "team-456");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://test/games/game-123/my-team",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ teamId: "team-456" }),
      }),
    );
  });
});
