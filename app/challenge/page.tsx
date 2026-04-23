import { getTodayScenario } from "@/data/scenarios";
import ChallengeClient from "./ChallengeClient";

export default function ChallengePage() {
  const scenario = getTodayScenario();
  return <ChallengeClient scenario={scenario} />;
}
