export interface Chunk {
  chunk_id: string;
  paper_id: string;
  page: number;
  section: string | null;
  text: string;
  token_count: number;
}

export type PaperStatus =
  | "uploaded" | "parsing" | "chunking" | "extracting" | "verifying" | "ready" | "failed";

export interface Paper {
  paper_id: string;
  filename: string;
  title: string | null;
  page_count: number | null;
  status: PaperStatus;
  status_detail?: string;
  created_at: string;
}

export type ClaimCategory = "claim" | "evidence" | "limitation" | "methodology";
export type ClaimStatus = "verified" | "flagged" | "unverified";

export interface Citation {
  page: number;
  section: string | null;
  chunk_id: string;
  quote: string;
}

export interface Claim {
  claim_id: string;
  paper_id: string;
  category: ClaimCategory;
  text: string;
  citation: Citation;
  confidence: number;
  status: ClaimStatus;
  verification_note?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  source_claim_id?: string;
}

export interface Brief {
  paper_id: string;
  summary: string;
  sections: { heading: string; body: string; citation_ids?: string[] }[];
  concept_map?:string;
}

export interface ProcessingEvent {
  ts: string;
  step: string;
  detail: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
