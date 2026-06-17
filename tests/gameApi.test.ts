import { ApiError, deleteChallenge, getGameState, setApiBaseUrl } from "../api/gameApi";
import type { GameState } from "../types/game";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeAll(() => {
  setApiBaseUrl("http://test");
});

beforeEach(() => {
  jest.useFakeTimers();
  mockFetch.mockReset();
});

afterEach(() => {
  jest.useRealTimers();
});

function setupFetch({
  status = 200,
  body,
  textBody,
  hangForever = false,
}: {
  status?: number;
  body?: unknown;
  textBody?: string;
  hangForever?: boolean;
}) {
  mockFetch.mockImplementation((_url: string, init?: RequestInit) => {
    return new Promise((resolve, reject) => {
      const { signal } = init ?? {};

      if (signal?.aborted) {
        reject(new DOMException("The operation was aborted", "AbortError"));
        return;
      }

      signal?.addEventListener(
        "abort",
        () => reject(new DOMException("The operation was aborted", "AbortError")),
        { once: true },
      );

      if (!hangForever) {
        resolve({
          ok: status >= 200 && status < 300,
          status,
          json: async () => body,
          text: async () => textBody ?? "",
        } as Response);
      }
    });
  });
}

const mockGameState: GameState = {
  game: {
    id: "g1",
    name: "Test Game",
    status: "STARTED",
    createdAt: "2024-01-01T00:00:00Z",
    mapWidth: 1000,
    mapHeight: 1000,
    mapImage: "map.png",
  },
  teams: [],
  stations: [],
  challenges: [],
  actions: [],
};

describe("gameApi", () => {
  test("returns parsed JSON on 200", async () => {
    setupFetch({ body: mockGameState });

    const result = await getGameState("g1");

    expect(result).toEqual(mockGameState);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://test/games/g1/state",
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });

  test("returns undefined on 204", async () => {
    setupFetch({ status: 204 });

    const result = await deleteChallenge("g1", "c1");

    expect(result).toBeUndefined();
  });

  test("throws ApiError with backend message on non-2xx", async () => {
    setupFetch({ status: 400, textBody: "Game not found" });

    await expect(getGameState("bad-id")).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      message: "Game not found",
    });
  });

  test("throws ApiError with fallback message when backend body is empty", async () => {
    setupFetch({ status: 500, textBody: "" });

    await expect(getGameState("g1")).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
      message: "Request failed with 500",
    });
  });

  test("throws ApiError(408) when the request exceeds the 10 second timeout", async () => {
    setupFetch({ hangForever: true });

    const promise = getGameState("g1");
    jest.advanceTimersByTime(10_001);

    await expect(promise).rejects.toMatchObject({
      name: "ApiError",
      status: 408,
      message: "Request timed out",
    });
  });

  test("re-throws AbortError when an external signal is aborted mid-request", async () => {
    const controller = new AbortController();
    setupFetch({ hangForever: true });

    const promise = getGameState("g1", controller.signal);
    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
    await expect(promise).rejects.not.toBeInstanceOf(ApiError);
  });

  test("aborts immediately when external signal is already aborted before the call", async () => {
    const controller = new AbortController();
    controller.abort();
    setupFetch({ hangForever: true });

    await expect(getGameState("g1", controller.signal)).rejects.toMatchObject({
      name: "AbortError",
    });
  });
});
