"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadPaper } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Please upload a PDF."); return; }
    setError(null);
    setUploading(true);
    try {
      const paper = await uploadPaper(file);
      router.push(`/processing/${paper.paper_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-xl w-full">
        <div className="mb-10 text-center">
          <p className="font-mono text-xs tracking-widest text-verified uppercase mb-3">Briefly</p>
          <h1 className="text-4xl leading-tight mb-3">Read the paper.<br />Trust every citation.</h1>
          <p className="text-ink-muted text-[15px]">
            Upload a PDF. Every claim comes back with the exact page and quote it was pulled from.
          </p>
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
          onClick={() => inputRef.current?.click()}
          className={`rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-colors bg-paper-raised ${dragOver ? "border-verified bg-verified-soft" : "border-rule"}`}
        >
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          {uploading ? (
            <p className="text-sm text-ink-muted">Uploading…</p>
          ) : (
            <>
              <p className="text-sm font-medium mb-1">Drop a paper here, or click to browse</p>
              <p className="text-xs text-ink-muted">PDF only</p>
            </>
          )}
        </div>
        {error && <p className="mt-3 text-sm text-flagged text-center">{error}</p>}
      </div>
    </main>
  );
}
