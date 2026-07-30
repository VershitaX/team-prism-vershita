"use client";
import { useEffect, useRef } from "react";

export default function ConceptMap({ definition }: { definition: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!definition || !ref.current) return;
    (async () => {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({ startOnLoad: false, theme: "neutral" });
      const id = "concept-map-" + Math.random().toString(36).slice(2);
      const { svg } = await mermaid.render(id, definition);
      if (ref.current) ref.current.innerHTML = svg;
    })();
  }, [definition]);

  return <div ref={ref} className="bg-white rounded-lg p-4 overflow-x-auto" />;
}
