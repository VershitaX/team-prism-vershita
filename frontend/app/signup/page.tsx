"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupUser, saveSession } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = await signupUser(name, email, password);
      saveSession(auth);
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="max-w-sm w-full bg-paper-raised border border-rule rounded-xl p-8">
        <p className="font-mono text-xs tracking-widest text-verified uppercase mb-2">Briefly</p>
        <h1 className="text-2xl mb-6">Create account</h1>
        <input type="text" placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-md border border-rule bg-paper" />
        <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-md border border-rule bg-paper" />
        <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-md border border-rule bg-paper" />
        {error && <p className="text-flagged text-sm mb-3">{error}</p>}
        <button type="submit" disabled={loading} className="w-full py-2 rounded-md bg-verified text-white font-medium cursor-pointer disabled:opacity-60">
          {loading ? "Creating account…" : "Sign up"}
        </button>
        <p className="mt-4 text-sm text-ink-muted text-center">
          Already have an account? <a href="/login" className="text-verified underline">Log in</a>
        </p>
      </form>
    </main>
  );
}
