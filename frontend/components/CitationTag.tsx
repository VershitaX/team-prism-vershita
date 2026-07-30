"use client";
import { useState } from "react";
import { Citation, ClaimStatus } from "@/lib/types";

const statusColor: Record<ClaimStatus, string> = {
  verified: "var(--verified)",
  flagged: "var(--flagged)",
  unverified: "var(--unverified)",
};

export default function CitationTag({
  citation,
  status = "verified",
}: {
  citation: Citation;
  status?: ClaimStatus;
}) {
  const [open, setOpen] = useState(false);
  const color = statusColor[status];

  return (
    <span className="inline-block align-middle">
      <button
        onClick={() => setOpen((v) => !v)}
        className="font-mono text-xs px-1.5 py-0.5 rounded border transition-colors cursor-pointer"
        style={{ color, borderColor: color, background: open ? `${color}1a` : "transparent" }}
      >
        p.{citation.page}{citation.section ? ` · §${citation.section}` : ""}
      </button>
      {open && (
        <span className="block mt-2 mb-1 pl-3 border-l-2 text-sm italic text-ink-muted" style={{ borderColor: color }}>
          &ldquo;{citation.quote}&rdquo;
        </span>
      )}
    </span>
  );
}
