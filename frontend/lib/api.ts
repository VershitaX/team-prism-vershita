import { Paper, Claim, Brief, Flashcard, ProcessingEvent } from "./types";
import { MOCK_PAPER, MOCK_CLAIMS, MOCK_BRIEF, MOCK_FLASHCARDS, MOCK_PROCESSING_LOG } from "./mockData";

const USE_MOCK = true;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function uploadPaper(file: File): Promise<Paper> {
  if (USE_MOCK) { await delay(600); return { ...MOCK_PAPER, filename: file.name }; }
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/paper/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

export async function getPaperStatus(paperId: string): Promise<Paper> {
  if (USE_MOCK) { await delay(300); return MOCK_PAPER; }
  const res = await fetch(`${API_BASE}/paper/${paperId}`);
  if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
  return res.json();
}

export function subscribeToProcessing(
  paperId: string,
  onEvent: (e: ProcessingEvent) => void,
  onDone: () => void
): () => void {
  if (USE_MOCK) {
    let cancelled = false;
    (async () => {
      for (const event of MOCK_PROCESSING_LOG) {
        if (cancelled) return;
        await delay(550);
        onEvent(event);
      }
      if (!cancelled) onDone();
    })();
    return () => { cancelled = true; };
  }
  const source = new EventSource(`${API_BASE}/paper/${paperId}/stream`);
  source.onmessage = (e) => onEvent(JSON.parse(e.data));
  source.addEventListener("done", () => { onDone(); source.close(); });
  return () => source.close();
}

export async function getClaims(paperId: string): Promise<Claim[]> {
  if (USE_MOCK) { await delay(300); return MOCK_CLAIMS; }
  const res = await fetch(`${API_BASE}/paper/${paperId}/claims`);
  if (!res.ok) throw new Error(`Fetching claims failed: ${res.status}`);
  return res.json();
}

export async function getBrief(paperId: string): Promise<Brief> {
  if (USE_MOCK) { await delay(200); return MOCK_BRIEF; }
  const res = await fetch(`${API_BASE}/paper/${paperId}/brief`);
  if (!res.ok) throw new Error(`Fetching brief failed: ${res.status}`);
  return res.json();
}

export async function getFlashcards(paperId: string): Promise<Flashcard[]> {
  if (USE_MOCK) { await delay(200); return MOCK_FLASHCARDS; }
  const res = await fetch(`${API_BASE}/paper/${paperId}/flashcards`);
  if (!res.ok) throw new Error(`Fetching flashcards failed: ${res.status}`);
  return res.json();
}
