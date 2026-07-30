"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProcessingEvent } from "@/lib/types";
import { subscribeToProcessing } from "@/lib/api";

export default function ProcessingPage() {
  const params = useParams<{ paperId: string }>();
  const router = useRouter();
  const [events, setEvents] = useState<ProcessingEvent[]>([]);
  const [done, setDone] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToProcessing(
      params.paperId,
      (event) => setEvents((prev) => [...prev, event]),
      () => setDone(true)
    );
    return unsubscribe;
  }, [params.paperId]);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [events]);

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => router.push(`/paper/${params.paperId}`), 900);
      return () => clearTimeout(t);
    }
  }, [done, params.paperId, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-xl w-full">
        <p className="font-mono text-xs tracking-widest text-verified uppercase mb-2 text-center">
          {done ? "Ready" : "Reading the paper"}
        </p>
        <h1 className="text-3xl text-center mb-8">{done ? "Briefing complete" : "The agent is working…"}</h1>
        <div className="rounded-xl border border-rule bg-paper-raised p-5 h-80 overflow-y-auto font-mono text-[13px]">
          {events.map((e, i) => (
            <div key={i} className="flex gap-3 py-1.5 border-b border-rule/50 last:border-0">
              <span className="text-ink-muted shrink-0 w-14">{e.ts}</span>
              <span className="text-verified shrink-0 w-32">{e.step}</span>
              <span className="text-ink-muted">{e.detail}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </main>
  );
}
