import { loadContentPieces } from "@/app/lib/load-content";
import MlJourneyClient from "./ml-journey-client";

export default function MlJourneyPage() {
  const pieces = loadContentPieces("machine-learning-journey");
  return <MlJourneyClient pieces={pieces} />;
}
