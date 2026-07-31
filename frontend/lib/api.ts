import { Paper, Claim, Brief, Flashcard, ProcessingEvent, PaperStatus, User, AuthResponse } from "./types";
import { MOCK_PAPER, MOCK_CLAIMS, MOCK_BRIEF, MOCK_FLASHCARDS, MOCK_PROCESSING_LOG } from "./mockData";

const USE_MOCK = true;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function uploadPaper(file: File): Promise<Paper> {
  if (USE_MOCK) { await delay(600); return { ...MOCK_PAPER, filename: file.name }; }

  const form = new FormData();
  form.append("file", file);

  const maxAttempts = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE}/paper/upload`,
        { method: "POST", body: form },
        30000
      );
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      return res.json();
    } catch (e) {
      lastError = e instanceof Error ? e : new Error("Upload failed");
      if (attempt < maxAttempts) await delay(1000);
    }
  }
  throw new Error(lastError?.message ?? "Upload failed after retrying. Please try again.");
}

export async function getPaperStatus(paperId: string): Promise<Paper> {
  if (USE_MOCK) { await delay(300); return MOCK_PAPER; }
  const res = await fetchWithTimeout(`${API_BASE}/paper/${paperId}`, {}, 10000);
  if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
  return res.json();
}

export async function waitForPaperReady(
  paperId: string,
  onStatusChange?: (status: PaperStatus) => void,
  timeoutMs: number = 120000
): Promise<Paper> {
  const start = Date.now();
  let lastStatus: PaperStatus | null = null;

  while (Date.now() - start < timeoutMs) {
    const paper = await getPaperStatus(paperId);
    if (paper.status !== lastStatus) {
      lastStatus = paper.status;
      onStatusChange?.(paper.status);
    }
    if (paper.status === "ready") return paper;
    if (paper.status === "failed") throw new Error("Processing failed while parsing this paper.");
    await delay(1500);
  }
  throw new Error("Timed out waiting for paper to finish processing.");
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

export async function signupUser(fullName: string, email: string, password: string): Promise<AuthResponse> {
  if (USE_MOCK) {
    await delay(500);
    const user: User = { id: "u1", email, full_name: fullName, created_at: new Date().toISOString() };
    return { access_token: "mock-token", token_type: "bearer", user };
  }
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name: fullName }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail ?? `Signup failed: ${res.status}`);
  }
  return res.json();
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  if (USE_MOCK) {
    await delay(500);
    const user: User = { id: "u1", email, full_name: "Demo User", created_at: new Date().toISOString() };
    return { access_token: "mock-token", token_type: "bearer", user };
  }
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail ?? `Login failed: ${res.status}`);
  }
  return res.json();
}

export function saveSession(auth: AuthResponse) {
  localStorage.setItem("token", auth.access_token);
  localStorage.setItem("user", JSON.stringify(auth.user));
}

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}