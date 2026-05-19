import type { ChallengeType } from "../types/game";

export function getChallengeTypeLabel(type: ChallengeType | undefined) {
  switch (type) {
    case "CHIPS":
      return "Chips";
    case "MULTIPLIER":
      return "Multiplier";
    case "STEAL":
      return "Steal";
    default:
      return "Reward";
  }
}

export function getChallengeValueLabel(challenge: { challengeType?: ChallengeType; reward: number }) {
  if (challenge.challengeType === "CHIPS" || !challenge.challengeType) {
    return `${challenge.reward} chips`;
  }

  return `${getChallengeTypeLabel(challenge.challengeType)} ${challenge.reward}`;
}
