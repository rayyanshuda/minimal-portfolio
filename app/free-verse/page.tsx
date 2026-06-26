import { loadContentPieces } from "@/app/lib/load-content";
import FreeVerseClient from "./free-verse-client";

export default function FreeVersePage() {
  const verses = loadContentPieces("free-verse");
  return <FreeVerseClient verses={verses} />;
}
