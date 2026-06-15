import type { ChallengeType } from "../types/game";

export function getChallengeTypeLabel(type: ChallengeType) {
  switch (type) {
    case "CHIPS":
      return "Chips";
    case "MULTIPLIER":
      return "Multiplier";
    case "STEAL":
      return "Steal";
    case "CALL_YOUR_SHOT":
      return "Call Your Shot";
  }
}

export function getChallengeValueLabel(challenge: { challengeType: ChallengeType; reward: number }) {
  if (challenge.challengeType === "CHIPS") {
    return `${challenge.reward} chips`;
  }

  if (challenge.challengeType === "CALL_YOUR_SHOT") {
    return `×${challenge.reward} chips per called chip`;
  }

  return `${getChallengeTypeLabel(challenge.challengeType)} ${challenge.reward}%`;
}
