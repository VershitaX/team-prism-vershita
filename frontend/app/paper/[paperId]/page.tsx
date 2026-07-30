"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Brief, Claim, Flashcard as FlashcardType, Paper } from "@/lib/types";
import { getBrief, getClaims, getFlashcards, getPaperStatus } from "@/lib/api";
import { buildMarkdown, downloadMarkdown } from "@/lib/export";
import Tabs from "@/components/Tabs";
import ClaimCard from "@/components/ClaimCard";
import CitationTag from "@/components/CitationTag";
import Flashcard from "@/components/Flashcard";
import ConceptMap from "@/components/ConceptMap";

const TABS = [
  { id: "brief", label: "Brief" },
  { id: "claims", label: "Claims" },
  { id: "flashcards", label: "Flashcards" },
  { id: "concept", label: "Concept Map" },
];

export default function PaperDashboard() {
  const params = useParams<{ paperId: string }>();
  const [active, setActive] = useState("brief");
  const [paper, setPaper] = useState<Paper | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, b, c, f] = await Promise.all([
          getPaperStatus(params.paperId),
          getBrief(params.paperId),
          getClaims(params.paperId),
          getFlashcards(params.paperId),
        ]);
        setPaper(p); setBrief(b); setClaims(c); setFlashcards(f);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong loading this briefing.");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.paperId]);

  function claimById(id: string) { return claims.find((c) => c.claim_id === id); }

  function handleMarkdownExport() {
    if (!paper || !brief) return;
    const md = buildMarkdown(paper, brief, claims, flashcards);
    downloadMarkdown(`${(paper.title ?? paper.filename).replace(/\s+/g, "_")}_briefing.md`, md);
  }

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center"><p className="text-ink-muted font-mono text-sm">Loading briefing…</p></main>;
  }

  if (error || !paper || !brief) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-flagged font-medium mb-2">Something went wrong</p>
        <p className="text-ink-muted text-sm mb-6">{error ?? "Couldn't load this briefing."}</p>
        <a href="/" className="text-verified underline text-sm">Try uploading again</a>
      </main>
    );
  }

  const verifiedCount = claims.filter((c) => c.status === "verified").length;
  const flaggedCount = claims.filter((c) => c.status === "flagged").length;

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6 flex items-start justify-between gap-4 no-print">
          <div>
            <p className="font-mono text-xs tracking-widest text-verified uppercase mb-1">Briefly</p>
            <h1 className="text-2xl leading-tight">{paper.title ?? paper.filename}</h1>
            <p className="text-xs text-ink-muted mt-1 font-mono">
              {paper.page_count} pages · {verifiedCount} verified · {flaggedCount} flagged
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={handleMarkdownExport} className="text-xs font-medium px-3 py-2 rounded-md border border-rule bg-paper-raised hover:bg-verified-soft transition-colors cursor-pointer">
              Markdown
            </button>
            <button onClick={() => window.print()} className="text-xs font-medium px-3 py-2 rounded-md border border-rule bg-paper-raised hover:bg-verified-soft transition-colors cursor-pointer">
              PDF
            </button>
          </div>
        </header>

        <div className="no-print"><Tabs tabs={TABS} active={active} onChange={setActive} /></div>

        <div className="mt-6">
          {active === "brief" && (
            <div className="space-y-6">
              <p className="text-lg leading-relaxed text-ink-muted">{brief.summary}</p>
              {brief.sections.map((section) => (
                <div key={section.heading}>
                  <h2 className="text-xl mb-2">{section.heading}</h2>
                  <p className="leading-relaxed mb-2">{section.body}</p>
                  <div className="flex flex-wrap gap-2">
                    {section.citation_ids?.map((id) => {
                      const c = claimById(id);
                      if (!c) return null;
                      return <CitationTag key={id} citation={c.citation} status={c.status} />;
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          {active === "claims" && (
            <div className="space-y-4">{claims.map((c) => <ClaimCard key={c.claim_id} claim={c} />)}</div>
          )}
          {active === "flashcards" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{flashcards.map((f) => <Flashcard key={f.id} card={f} />)}</div>
          )}
          {active === "concept" && brief.concept_map && (
          <ConceptMap definition={brief.concept_map} />
          )}
        </div>
      </div>
    </main>
  );
}
