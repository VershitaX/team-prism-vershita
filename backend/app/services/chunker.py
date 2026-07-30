"""
Splits extracted page text into chunks of roughly 300-500 tokens each,
keeping the page number and section tag attached to every chunk.

We approximate "tokens" as whitespace-split words * 1.3 (a common rough
ratio for English text -> LLM tokens). This is intentionally simple —
good enough for chunk sizing, not meant to be exact.
"""

MIN_TOKENS = 300
MAX_TOKENS = 500


def _approx_token_count(text: str) -> int:
    word_count = len(text.split())
    return int(word_count * 1.3)


def chunk_pages(pages: list[dict]) -> list[dict]:
    """
    Input:  [{"page": 1, "section": "Abstract", "text": "..."}, ...]
    Output: [{"chunk_index": 0, "page": 1, "section": "Abstract",
              "text": "...", "token_count": 340}, ...]

    Strategy: walk through each page's text sentence-by-sentence (splitting
    on ". "), accumulating into a buffer until it crosses MIN_TOKENS, then
    close the chunk off (unless doing so would blow way past MAX_TOKENS,
    in which case we close early). Chunks never span across a section
    boundary or page in a way that loses the tag - each chunk keeps a
    single page + section.
    """
    chunks = []
    chunk_index = 0

    for page in pages:
        sentences = _split_into_sentences(page["text"])
        buffer = []
        buffer_tokens = 0

        for sentence in sentences:
            sentence_tokens = _approx_token_count(sentence)

            if buffer and buffer_tokens + sentence_tokens > MAX_TOKENS:
                # flush current buffer before it gets too big
                chunks.append(_make_chunk(chunk_index, page, buffer))
                chunk_index += 1
                buffer = []
                buffer_tokens = 0

            buffer.append(sentence)
            buffer_tokens += sentence_tokens

            if buffer_tokens >= MIN_TOKENS:
                chunks.append(_make_chunk(chunk_index, page, buffer))
                chunk_index += 1
                buffer = []
                buffer_tokens = 0

        if buffer:
            chunks.append(_make_chunk(chunk_index, page, buffer))
            chunk_index += 1

    return chunks


def _split_into_sentences(text: str) -> list[str]:
    # Simple, dependency-free sentence splitter. Good enough for chunking
    # purposes (we don't need perfect grammar boundaries, just reasonable
    # breakpoints that don't cut mid-word).
    raw = text.replace("\n", " ").split(". ")
    return [s.strip() + "." if not s.endswith(".") else s.strip() for s in raw if s.strip()]


def _make_chunk(index: int, page: dict, sentences: list[str]) -> dict:
    text = " ".join(sentences)
    return {
        "chunk_index": index,
        "page": page["page"],
        "section": page["section"],
        "text": text,
        "token_count": _approx_token_count(text),
    }
