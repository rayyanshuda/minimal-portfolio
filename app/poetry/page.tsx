import { loadContentPieces } from "@/app/lib/load-content";
import PoetryClient from "./poetry-client";

export default function PoetryPage() {
  const poems = loadContentPieces("poetry");
  return <PoetryClient poems={poems} />;
}
