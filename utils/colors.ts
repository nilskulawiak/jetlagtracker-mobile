import type { ChallengeStatus as ChallengeStatusType } from "@/types/game";

const COMPLETE_STATUS_TOKENS = ["complete"];
const FAILED_STATUS_TOKENS = ["fail"];
const ACTIVE_STATUS_TOKENS = ["active", "open"];

export const ChallengeStatus = {
  AVAILABLE: "AVAILABLE",
  CREATED: "CREATED",
  DONE: "DONE",
} as const;

export const colors = {
  challengeDone: "#8a94a6",
  danger: "#b42318",
  dangerSoft: "#fff5f5",
  dangerSoftBorder: "#ffc7c2",
  dangerSurface: "#fff2f1",
  dangerSurfaceBorder: "#ffd0cc",
  info: "#0b6bcb",
  infoSoft: "#e7f0ff",
  ink: "#0f172a",
  line: "#e1e7ef",
  lineStrong: "#d7dee9",
  muted: "#667085",
  page: "#f6f8fb",
  panel: "#ffffff",
  softPanel: "#f7f9fc",
  stationEmpty: "#f8fafc",
  text: "#364152",
  textSoft: "#536073",
  unknown: "#5b6677",
} as const;

function hasStatusToken(status: string, tokens: string[]) {
  const normalized = status.toLowerCase();

  return tokens.some((token) => normalized.includes(token));
}

function normalizeChallengeStatus(status: string): ChallengeStatusType | string {
  return status.trim().toUpperCase();
}

export function isChallengeCreated(status: string) {
  return normalizeChallengeStatus(status) === ChallengeStatus.CREATED;
}

export function isChallengeDone(status: string) {
  return normalizeChallengeStatus(status) === ChallengeStatus.DONE;
}

export function isChallengeVisible(status: string) {
  return !isChallengeCreated(status);
}

export function getChallengeStatusColor(status: string) {
  if (isChallengeDone(status)) return colors.challengeDone;
  if (normalizeChallengeStatus(status) === ChallengeStatus.AVAILABLE) return colors.info;
  if (hasStatusToken(status, COMPLETE_STATUS_TOKENS)) return "#18794e";
  if (hasStatusToken(status, FAILED_STATUS_TOKENS)) return colors.danger;
  if (hasStatusToken(status, ACTIVE_STATUS_TOKENS)) return colors.info;

  return colors.unknown;
}
