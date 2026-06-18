import type { ChallengeResponse, StationStateResponse } from "../types/game";
import { buildMapSelectableItems, resolveMapTap } from "../utils/mapSelection";

const mapConfig = {
  mapHeight: 1000,
  mapWidth: 1000,
  renderedMapHeight: 1000,
  renderedMapWidth: 1000,
};

function station(overrides: Partial<StationStateResponse>): StationStateResponse {
  return {
    chips: [],
    id: "station-1",
    name: "Station 1",
    ownerTeamId: null,
    xCoordinate: 100,
    yCoordinate: 100,
    ...overrides,
  };
}

function challenge(overrides: Partial<ChallengeResponse>): ChallengeResponse {
  return {
    challengeAttempts: [],
    challengeType: "CHIPS",
    description: "Challenge description",
    id: "challenge-1",
    name: "Challenge 1",
    reward: 10,
    status: "AVAILABLE",
    xCoordinate: 200,
    yCoordinate: 200,
    ...overrides,
  };
}

describe("map selection", () => {
  test("resolveMapTap returns the closest item when one hit is clearly nearest", () => {
    const items = resolveMapTap({
      ...mapConfig,
      challenges: [challenge({ id: "challenge-near", xCoordinate: 110, yCoordinate: 100 })],
      scale: 1,
      stations: [station({ id: "station-closest", xCoordinate: 100, yCoordinate: 100 })],
      tapMapX: 100,
      tapMapY: 100,
    });

    expect(items.map((item) => item.id)).toEqual(["station-closest"]);
  });

  test("resolveMapTap returns multiple nearby items when the closest hit is ambiguous", () => {
    const items = resolveMapTap({
      ...mapConfig,
      challenges: [challenge({ id: "challenge-near", xCoordinate: 108, yCoordinate: 100 })],
      scale: 1,
      stations: [station({ id: "station-near", xCoordinate: 100, yCoordinate: 100 })],
      tapMapX: 100,
      tapMapY: 100,
    });

    expect(items.map((item) => item.id)).toEqual(["station-near", "challenge-near"]);
  });

  test("resolveMapTap shrinks the effective touch radius as the map zooms in", () => {
    const commonParams = {
      ...mapConfig,
      challenges: [],
      stations: [station({ id: "station-offset", xCoordinate: 120, yCoordinate: 100 })],
      tapMapX: 100,
      tapMapY: 100,
    };

    expect(resolveMapTap({ ...commonParams, scale: 1 }).map((item) => item.id)).toEqual(["station-offset"]);
    expect(resolveMapTap({ ...commonParams, scale: 3 }).map((item) => item.id)).toEqual([]);
  });

  test("resolveMapTap with isPointerDevice returns only the single closest item even when two items are within range", () => {
    const items = resolveMapTap({
      ...mapConfig,
      challenges: [challenge({ id: "challenge-near", xCoordinate: 108, yCoordinate: 100 })],
      isPointerDevice: true,
      scale: 1,
      stations: [station({ id: "station-near", xCoordinate: 100, yCoordinate: 100 })],
      tapMapX: 100,
      tapMapY: 100,
    });

    expect(items.map((item) => item.id)).toEqual(["station-near"]);
  });

  test("resolveMapTap with isPointerDevice uses icon-sized hit radius per kind", () => {
    // Station icon radius = 8px: 7px away hits, 9px away misses
    const stationParams = {
      ...mapConfig,
      challenges: [],
      isPointerDevice: true as const,
      scale: 1,
      stations: [station({ id: "station-a", xCoordinate: 100, yCoordinate: 100 })],
    };
    expect(resolveMapTap({ ...stationParams, tapMapX: 107, tapMapY: 100 }).map((i) => i.id)).toEqual(["station-a"]);
    expect(resolveMapTap({ ...stationParams, tapMapX: 109, tapMapY: 100 }).map((i) => i.id)).toEqual([]);

    // Challenge icon radius = 15px: 14px away hits, 16px away misses
    const challengeParams = {
      ...mapConfig,
      challenges: [challenge({ id: "challenge-a", xCoordinate: 200, yCoordinate: 200 })],
      isPointerDevice: true as const,
      scale: 1,
      stations: [],
    };
    expect(resolveMapTap({ ...challengeParams, tapMapX: 214, tapMapY: 200 }).map((i) => i.id)).toEqual(["challenge-a"]);
    expect(resolveMapTap({ ...challengeParams, tapMapX: 216, tapMapY: 200 }).map((i) => i.id)).toEqual([]);

    // Radius is fixed regardless of zoom (not expanded at low zoom)
    expect(
      resolveMapTap({ ...stationParams, scale: 0.1, tapMapX: 109, tapMapY: 100 }).map((i) => i.id),
    ).toEqual([]);
  });

  test("buildMapSelectableItems hides created challenges unless setup visibility is enabled", () => {
    const createdChallenge = challenge({
      id: "created-challenge",
      status: "CREATED",
    });

    expect(
      buildMapSelectableItems({
        ...mapConfig,
        challenges: [createdChallenge],
        stations: [],
      }).map((item) => item.id),
    ).toEqual([]);

    expect(
      buildMapSelectableItems({
        ...mapConfig,
        challenges: [createdChallenge],
        showCreatedChallenges: true,
        stations: [],
      }).map((item) => item.id),
    ).toEqual(["created-challenge"]);
  });
});
