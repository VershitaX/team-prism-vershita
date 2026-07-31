"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, clearSession } from "@/lib/api";
import { User } from "@/lib/types";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getSession());
  }, []);

  function handleLogout() {
    clearSession();
    setUser(null);
    router.push("/");
  }

  return (
    <header className="no-print sticky top-0 z-10 border-b border-rule bg-paper/90 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-verified" />
          <span className="font-mono text-sm tracking-wide">Briefly</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-ink-muted">
          {user ? (
            <>
              <span className="text-ink">{user.full_name}</span>
              <button onClick={handleLogout} className="hover:text-ink transition-colors cursor-pointer">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-ink transition-colors">Log in</Link>
              <Link href="/signup" className="hover:text-ink transition-colors px-3 py-1.5 rounded-md bg-verified text-white hover:opacity-90">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}