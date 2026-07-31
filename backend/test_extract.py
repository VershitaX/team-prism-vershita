"""
Manual extraction test script.
Fetches chunks for a paper and POSTs them to /extract directly,
so you see the real response (success or error) immediately
instead of relying on the background task + polling /status.

Usage:
    python test_extract.py <paper_id>
"""
import sys
import json
import requests

BASE_URL = "http://127.0.0.1:8000"


def main():
    if len(sys.argv) != 2:
        print("Usage: python test_extract.py <paper_id>")
        sys.exit(1)

    paper_id = sys.argv[1]

    print(f"Fetching chunks for paper_id={paper_id} ...")
    chunks_resp = requests.get(f"{BASE_URL}/paper/{paper_id}/chunks", timeout=30)

    if chunks_resp.status_code != 200:
        print(f"Failed to fetch chunks: {chunks_resp.status_code}")
        print(chunks_resp.text)
        sys.exit(1)
    chunks_data = chunks_resp.json()
    raw_chunks = chunks_data["chunks"]
    print(f"Got {len(raw_chunks)} chunks total.")

    LIMIT = 5
    raw_chunks = raw_chunks[:LIMIT]
    print(f"Using only the first {len(raw_chunks)} chunks for a quick test.")

    # Reshape ChunkOut -> the Chunk schema /extract expects
    # ChunkOut has: chunk_id, chunk_index, page, section, text, token_count
    # Chunk (extract) expects: chunk_id, paper_id, page, section, text
    extract_chunks = [
        {
            "chunk_id": c["chunk_id"],
            "paper_id": paper_id,
            "page": c["page"],
            "section": c["section"],
            "text": c["text"],
        }
        for c in raw_chunks
    ]

    payload = {
        "paper_id": paper_id,
        "chunks": extract_chunks,
    }

    print("Calling POST /paper/{paper_id}/extract ...")
    print("(This runs synchronously - it will sit here until it's done or errors out.)")

    extract_resp = requests.post(
        f"{BASE_URL}/paper/{paper_id}/extract",
        json=payload,
        timeout=600,  # 10 min ceiling just in case, but should be much faster with Groq
    )

    print(f"\nStatus code: {extract_resp.status_code}")

    if extract_resp.status_code != 200:
        print("ERROR response body:")
        print(extract_resp.text)
        sys.exit(1)

    result = extract_resp.json()
    claims = result.get("claims", [])
    print(f"\nSuccess! Got {len(claims)} verified claims.\n")

    # Print a quick summary
    verified_count = sum(1 for c in claims if c.get("status") == "verified")
    flagged_count = sum(1 for c in claims if c.get("status") == "flagged")
    print(f"  verified: {verified_count}")
    print(f"  flagged:  {flagged_count}")

    print("\nFirst 5 claims:")
    for c in claims[:5]:
        print(f"  - [{c['claim_type']}] {c['claim_text'][:80]} -> {c['status']} ({c['confidence']})")

    # Save full result to a file for inspection
    with open("extract_result.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print("\nFull result saved to extract_result.json")


if __name__ == "__main__":
    main()