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
