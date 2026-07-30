"""
Turns a PDF file into a list of (page_number, section_name, text) pieces.

How section-detection works (simple + good enough for arXiv-style papers):
Academic papers have short, standalone heading lines like "Abstract",
"2. Related Work", "Methods", "Limitations". We scan each line of text on
the page; if a line is short and matches a known heading keyword, we treat
everything from that point on as belonging to that section, until the next
heading appears. This isn't perfect NLP, it's a regex heuristic — but it
works well on clean, single-column arXiv PDFs, which is exactly the demo
scope you agreed to scope down to.
"""
import re
import fitz  # PyMuPDF

# Known section headings we look for, in the order they typically appear.
# We match case-insensitively, and allow an optional leading number like "3."
KNOWN_SECTIONS = [
    "abstract",
    "introduction",
    "related work",
    "background",
    "method", "methods", "methodology", "approach",
    "experiment", "experiments", "experimental setup",
    "result", "results",
    "discussion",
    "limitation", "limitations",
    "conclusion", "conclusions",
    "future work",
    "acknowledgment", "acknowledgments", "acknowledgements",
    "reference", "references",
    "appendix",
]

# Matches lines like "3. Methods", "3 Methods", "Methods", "METHODS"
HEADING_PATTERN = re.compile(
    r"^\s*(?:\d+(?:\.\d+)*\.?\s+)?([A-Za-z][A-Za-z \-]{2,40})\s*$"
)


def _normalize_section_name(raw: str) -> str:
    """Map a matched heading like 'methodology' to a clean display name."""
    key = raw.strip().lower()
    if key in ("method", "methods", "methodology", "approach"):
        return "Methods"
    if key in ("result", "results"):
        return "Results"
    if key in ("limitation", "limitations"):
        return "Limitations"
    if key in ("conclusion", "conclusions"):
        return "Conclusion"
    if key in ("reference", "references"):
        return "References"
    if key in ("acknowledgment", "acknowledgments", "acknowledgements"):
        return "Acknowledgements"
    if key in ("experiment", "experiments", "experimental setup"):
        return "Experiments"
    return key.title()


def _detect_heading(line: str) -> str | None:
    """Return a normalized section name if this line looks like a heading, else None."""
    line = line.strip()
    if not line or len(line) > 45:
        return None
    match = HEADING_PATTERN.match(line)
    if not match:
        return None
    candidate = match.group(1).strip().lower()
    for known in KNOWN_SECTIONS:
        if candidate == known or candidate.startswith(known):
            return _normalize_section_name(known)
    return None


def extract_pages(pdf_path: str) -> list[dict]:
    """
    Reads the PDF and returns one entry per page:
    [{"page": 1, "section": "Abstract", "text": "..."}, ...]

    The 'section' is whatever section was active when that page's text
    started (a page can technically span two sections; we tag the whole
    page with the section it starts in — a reasonable simplification for
    the demo).
    """
    doc = fitz.open(pdf_path)
    pages = []
    current_section = "Unknown"

    for page_index in range(len(doc)):
        page = doc[page_index]
        text = page.get_text("text")
        lines = text.split("\n")

        section_for_this_page = current_section
        first_heading_seen_on_page = False

        for line in lines:
            heading = _detect_heading(line)
            if heading:
                current_section = heading
                if not first_heading_seen_on_page:
                    section_for_this_page = heading
                    first_heading_seen_on_page = True

        cleaned_text = text.strip()
        if cleaned_text:
            pages.append({
                "page": page_index + 1,
                "section": section_for_this_page,
                "text": cleaned_text,
            })

    doc.close()
    return pages


def guess_title(pdf_path: str) -> str | None:
    """Best-effort guess at the paper title: PDF metadata, else first line of page 1."""
    doc = fitz.open(pdf_path)
    meta_title = (doc.metadata or {}).get("title")
    if meta_title and len(meta_title.strip()) > 3:
        doc.close()
        return meta_title.strip()

    if len(doc) > 0:
        first_page_text = doc[0].get_text("text").strip()
        first_line = first_page_text.split("\n")[0].strip() if first_page_text else None
        doc.close()
        return first_line or None

    doc.close()
    return None
