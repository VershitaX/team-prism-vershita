import { Claim } from "@/lib/types";
import CitationTag from "./CitationTag";
import StatusBadge from "./StatusBadge";

const categoryLabel: Record<Claim["category"], string> = {
  claim: "Claim",
  evidence: "Evidence",
  limitation: "Limitation",
  methodology: "Methodology",
};

export default function ClaimCard({ claim }: { claim: Claim }) {
  const borderColor =
    claim.status === "verified" ? "var(--verified)" :
    claim.status === "flagged" ? "var(--flagged)" : "var(--unverified)";

  return (
    <div
      className="bg-paper-raised rounded-lg p-5 border-l-4"
      style={{ borderLeftColor: borderColor, borderTop: "1px solid var(--rule)", borderRight: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-wide text-ink-muted">
          {categoryLabel[claim.category]}
        </span>
        <StatusBadge status={claim.status} />
      </div>
      <p className="text-[1.05rem] leading-snug mb-3">{claim.text}</p>
      <CitationTag citation={claim.citation} status={claim.status} />
      {claim.verification_note && (
        <p className="mt-2 text-xs text-flagged bg-flagged-soft rounded px-2 py-1.5">
          {claim.verification_note}
        </p>
      )}
      <div className="mt-3 h-1 w-full bg-rule/40 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.round(claim.confidence * 100)}%`, background: borderColor }} />
      </div>
      <p className="mt-1 text-[11px] font-mono text-ink-muted">
        confidence {Math.round(claim.confidence * 100)}%
      </p>
    </div>
  );
}
