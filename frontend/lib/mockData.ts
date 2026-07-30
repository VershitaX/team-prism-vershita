import { Paper, Claim, Flashcard, Brief, ProcessingEvent } from "./types";

export const MOCK_PAPER: Paper = {
  paper_id: "demo-paper-1",
  filename: "attention_is_all_you_need.pdf",
  title: "Attention Is All You Need",
  page_count: 15,
  status: "ready",
  created_at: new Date().toISOString(),
};

export const MOCK_CLAIMS: Claim[] = [
  {
    claim_id: "c1",
    paper_id: "demo-paper-1",
    category: "claim",
    text: "The Transformer replaces recurrence entirely with self-attention, allowing far more parallelization during training.",
    citation: { page: 2, section: "Introduction", chunk_id: "chunk-004", quote: "the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism" },
    confidence: 0.96,
    status: "verified",
  },
  {
    claim_id: "c2",
    paper_id: "demo-paper-1",
    category: "claim",
    text: "The model achieves a new state-of-the-art BLEU score on English-to-German translation.",
    citation: { page: 8, section: "Results", chunk_id: "chunk-021", quote: "achieving a new state of the art BLEU score of 28.4" },
    confidence: 0.94,
    status: "verified",
  },
  {
    claim_id: "c3",
    paper_id: "demo-paper-1",
    category: "methodology",
    text: "Training used 8 NVIDIA P100 GPUs over 12 hours for the base model.",
    citation: { page: 7, section: "Training", chunk_id: "chunk-018", quote: "we trained the base models for a total of 100,000 steps or 12 hours" },
    confidence: 0.91,
    status: "verified",
  },
  {
    claim_id: "c4",
    paper_id: "demo-paper-1",
    category: "limitation",
    text: "The paper suggests the architecture may need modification to handle very long input/output sequences efficiently.",
    citation: { page: 9, section: "Future Work", chunk_id: "chunk-024", quote: "we plan to investigate local, restricted attention mechanisms" },
    confidence: 0.62,
    status: "flagged",
    verification_note: "Source discusses this as future work, not a stated limitation of the current model.",
  },
  {
    claim_id: "c5",
    paper_id: "demo-paper-1",
    category: "evidence",
    text: "Multi-head attention allows the model to jointly attend to information from different representation subspaces.",
    citation: { page: 4, section: "Model Architecture", chunk_id: "chunk-009", quote: "Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions" },
    confidence: 0.98,
    status: "verified",
  },
];

export const MOCK_BRIEF: Brief = {
  paper_id: "demo-paper-1",
  summary: "This paper introduces the Transformer, a sequence model built entirely on attention mechanisms, removing recurrence and convolutions. It trains faster than prior architectures and sets a new state of the art on machine translation.",
  sections: [
    { heading: "Problem", body: "Recurrent models process sequences step by step, which limits parallelization and slows down training on long sequences." },
    { heading: "Approach", body: "Replace recurrence with self-attention across the full sequence, built from stacked encoder/decoder layers using multi-head attention.", citation_ids: ["c1", "c5"] },
    { heading: "Key Result", body: "New state-of-the-art BLEU score on English-to-German translation, trained in a fraction of the time of comparable models.", citation_ids: ["c2", "c3"] },
    { heading: "Caveat", body: "Handling of very long sequences is flagged as an open direction rather than a solved problem.", citation_ids: ["c4"] },
  ],
};

export const MOCK_FLASHCARDS: Flashcard[] = [
  { id: "f1", question: "What replaces recurrence in the Transformer?", answer: "Self-attention mechanisms across the whole sequence.", source_claim_id: "c1" },
  { id: "f2", question: "What BLEU score did the model reach on En-De translation?", answer: "28.4 — a new state of the art at the time.", source_claim_id: "c2" },
  { id: "f3", question: "What hardware and time was used to train the base model?", answer: "8 NVIDIA P100 GPUs, 12 hours (100,000 steps).", source_claim_id: "c3" },
  { id: "f4", question: "What does multi-head attention let the model do?", answer: "Jointly attend to information from different representation subspaces at different positions.", source_claim_id: "c5" },
  { id: "f5", question: "Is 'struggles with long sequences' a confirmed limitation per the paper?", answer: "Not exactly — the paper frames it as future work, not a demonstrated limitation. Flagged by verification.", source_claim_id: "c4" },
];

export const MOCK_PROCESSING_LOG: ProcessingEvent[] = [
  { ts: "t+0.4s", step: "parse_pdf", detail: "Extracted 15 pages, 8,412 words" },
  { ts: "t+1.1s", step: "chunk", detail: "Split into 34 chunks (avg 420 tokens), tagged by section" },
  { ts: "t+2.0s", step: "search_paper", detail: "Searching for 'we propose' → 3 hits (pages 1, 3, 4)" },
  { ts: "t+2.6s", step: "read_page", detail: "Reading page 1 (Abstract)" },
  { ts: "t+3.4s", step: "read_page", detail: "Reading page 3 (Model Architecture)" },
  { ts: "t+4.5s", step: "extract_claims", detail: "Drafted 6 claims, 2 limitations, 1 methodology summary" },
  { ts: "t+5.2s", step: "search_paper", detail: "Searching for 'limitation' → 1 hit (page 9)" },
  { ts: "t+5.9s", step: "read_page", detail: "Reading page 9 (Future Work)" },
  { ts: "t+6.7s", step: "verify", detail: "Cross-checking each claim's quote against its source chunk" },
  { ts: "t+7.8s", step: "verify", detail: "5 claims verified, 1 flagged (quote paraphrased, not verbatim)" },
  { ts: "t+8.0s", step: "done", detail: "Briefing ready" },
];
