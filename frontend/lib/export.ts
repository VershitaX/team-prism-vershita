import { Brief, Claim, Flashcard, Paper } from "./types";

export function buildMarkdown(paper: Paper, brief: Brief, claims: Claim[], flashcards: Flashcard[]): string {
  const lines: string[] = [];
  lines.push(`# ${paper.title ?? paper.filename}`);
  lines.push("");
  lines.push(brief.summary);
  lines.push("");

  for (const section of brief.sections) {
    lines.push(`## ${section.heading}`);
    lines.push(section.body);
    if (section.citation_ids?.length) {
      const cites = section.citation_ids
        .map((id) => claims.find((c) => c.claim_id === id))
        .filter(Boolean) as Claim[];
      for (const c of cites) {
        lines.push(`> p.${c.citation.page}${c.citation.section ? ` \u00b7 \u00a7${c.citation.section}` : ""}: "${c.citation.quote}"`);
      }
    }
    lines.push("");
  }

  lines.push("## Claims & Limitations");
  for (const c of claims) {
    lines.push(`- **[${c.category}${c.status === "flagged" ? ", flagged" : ""}]** ${c.text}`);
    lines.push(`  - Source: p.${c.citation.page}${c.citation.section ? ` \u00a7${c.citation.section}` : ""} \u2014 "${c.citation.quote}"`);
  }
  lines.push("");

  lines.push("## Flashcards");
  for (const f of flashcards) {
    lines.push(`**Q:** ${f.question}`);
    lines.push(`**A:** ${f.answer}`);
    lines.push("");
  }

  return lines.join("\n");
}

export function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
