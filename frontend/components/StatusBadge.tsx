import { ClaimStatus } from "@/lib/types";

const config: Record<ClaimStatus, { label: string; color: string; bg: string }> = {
  verified: { label: "Verified", color: "var(--verified)", bg: "var(--verified-soft)" },
  flagged: { label: "Flagged", color: "var(--flagged)", bg: "var(--flagged-soft)" },
  unverified: { label: "Unverified", color: "var(--unverified)", bg: "#eceeec" },
};

export default function StatusBadge({ status }: { status: ClaimStatus }) {
  const { label, color, bg } = config[status];
  return (
    <span
      className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ color, background: bg }}
    >
      {label}
    </span>
  );
}
