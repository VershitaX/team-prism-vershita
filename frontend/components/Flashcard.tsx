"use client";
import { useState } from "react";
import { Flashcard as FlashcardType } from "@/lib/types";

export default function Flashcard({ card }: { card: FlashcardType }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      onClick={() => setFlipped((v) => !v)}
      className="h-40 w-full text-left rounded-lg border border-rule bg-paper-raised p-4 flex items-center justify-center text-center transition-shadow hover:shadow-md cursor-pointer"
    >
      <p className={flipped ? "text-sm text-verified" : "text-[1.05rem]"}>
        {flipped ? card.answer : card.question}
      </p>
    </button>
  );
}
