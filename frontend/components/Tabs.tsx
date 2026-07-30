export default function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 border-b border-rule">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            active === tab.id ? "border-verified text-verified" : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
