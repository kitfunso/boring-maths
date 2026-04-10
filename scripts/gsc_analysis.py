"""
GSC Analysis Script — Find content optimization opportunities.

Reads GSC export JSON files and cross-references with .astro page titles
to produce a prioritized report of SEO opportunities.
"""

import json
import re
import os
from pathlib import Path
from collections import defaultdict
from typing import NamedTuple

# Paths
BASE_DIR = Path("C:/Users/skf_s/boring-maths")
GSC_DIR = BASE_DIR / "gsc-export" / "2026-04-10"
PAGES_DIR = BASE_DIR / "src" / "pages" / "calculators"
OUTPUT_PATH = BASE_DIR / "docs" / "gsc-analysis-2026-04-10.md"

# --- Data Loading ---

def load_json(path: Path) -> list[dict]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, dict) and "rows" in data:
        return data["rows"]
    return data


def extract_page_titles() -> dict[str, str]:
    """Extract title from const title = '...' in .astro files."""
    titles: dict[str, str] = {}
    for astro_file in PAGES_DIR.rglob("*.astro"):
        try:
            content = astro_file.read_text(encoding="utf-8")
        except Exception:
            continue
        match = re.search(r"const title\s*=\s*['\"](.+?)['\"];?", content)
        if match:
            # Build URL path from file path
            rel = astro_file.relative_to(BASE_DIR / "src" / "pages")
            # e.g. calculators/abv-calculator.astro -> /calculators/abv-calculator
            url_path = "/" + str(rel).replace("\\", "/").replace(".astro", "")
            if url_path.endswith("/index"):
                url_path = url_path[:-6] or "/"
            full_url = f"https://boring-math.com{url_path}"
            titles[full_url] = match.group(1)
    return titles


# --- Analysis Functions ---

class PageData(NamedTuple):
    url: str
    clicks: int
    impressions: int
    ctr: float
    position: float


class QueryPageData(NamedTuple):
    query: str
    url: str
    clicks: int
    impressions: int
    ctr: float
    position: float


def parse_pages(rows: list[dict]) -> list[PageData]:
    return [
        PageData(
            url=r["keys"][0].rstrip("/"),
            clicks=r["clicks"],
            impressions=r["impressions"],
            ctr=r["ctr"],
            position=r["position"],
        )
        for r in rows
    ]


def parse_query_page(rows: list[dict]) -> list[QueryPageData]:
    return [
        QueryPageData(
            query=r["keys"][0],
            url=r["keys"][1].rstrip("/"),
            clicks=r["clicks"],
            impressions=r["impressions"],
            ctr=r["ctr"],
            position=r["position"],
        )
        for r in rows
    ]


def calc_opportunity_score(impressions: int, position: float) -> float:
    """Higher score = more leverage. Weight impressions by inverse position."""
    if position <= 0:
        return 0.0
    return impressions / position


def find_high_impression_zero_click_pages(
    pages: list[PageData],
) -> list[PageData]:
    """Pages with impressions but zero clicks, position 10-100."""
    return sorted(
        [p for p in pages if p.clicks == 0 and p.impressions >= 5 and 10 <= p.position <= 100],
        key=lambda p: calc_opportunity_score(p.impressions, p.position),
        reverse=True,
    )


def find_cannibalization(
    qp_data: list[QueryPageData],
) -> dict[str, list[QueryPageData]]:
    """Queries that rank for multiple pages."""
    query_pages: dict[str, list[QueryPageData]] = defaultdict(list)
    for qp in qp_data:
        query_pages[qp.query].append(qp)

    # Keep only queries with 2+ pages
    return {
        q: sorted(pages, key=lambda p: p.position)
        for q, pages in query_pages.items()
        if len(pages) >= 2
    }


def find_content_gaps(
    qp_data: list[QueryPageData],
    page_titles: dict[str, str],
) -> list[tuple[QueryPageData, str, list[str]]]:
    """Queries ranking for a page where key query terms are absent from the title."""
    gaps = []
    for qp in qp_data:
        if qp.impressions < 3:
            continue
        title = page_titles.get(qp.url, "")
        if not title:
            continue
        title_lower = title.lower()
        # Tokenize query, skip very short/common words
        query_words = [w for w in qp.query.lower().split() if len(w) > 2]
        stop_words = {
            "the", "for", "and", "how", "much", "what", "with", "from",
            "can", "you", "your", "that", "this", "are", "was", "will",
            "calculator", "calculate", "free", "online", "best", "does",
        }
        meaningful_words = [w for w in query_words if w not in stop_words]
        missing = [w for w in meaningful_words if w not in title_lower]
        if missing and len(missing) <= len(meaningful_words):
            gaps.append((qp, title, missing))

    # Sort by opportunity score
    return sorted(
        gaps,
        key=lambda x: calc_opportunity_score(x[0].impressions, x[0].position),
        reverse=True,
    )


def build_page_opportunity_scores(
    qp_data: list[QueryPageData],
) -> dict[str, dict]:
    """Aggregate opportunity scores per page with top queries."""
    page_scores: dict[str, dict] = defaultdict(
        lambda: {"total_score": 0.0, "total_impressions": 0, "total_clicks": 0, "queries": []}
    )
    for qp in qp_data:
        score = calc_opportunity_score(qp.impressions, qp.position)
        entry = page_scores[qp.url]
        entry["total_score"] += score
        entry["total_impressions"] += qp.impressions
        entry["total_clicks"] += qp.clicks
        entry["queries"].append(
            {
                "query": qp.query,
                "impressions": qp.impressions,
                "clicks": qp.clicks,
                "position": round(qp.position, 1),
                "score": round(score, 2),
            }
        )

    # Sort queries within each page by score
    for url, data in page_scores.items():
        data["queries"] = sorted(data["queries"], key=lambda q: q["score"], reverse=True)

    return dict(page_scores)


# --- Report Generation ---

def generate_report(
    page_scores: dict[str, dict],
    zero_click_pages: list[PageData],
    cannibalization: dict[str, list[QueryPageData]],
    content_gaps: list[tuple[QueryPageData, str, list[str]]],
    page_titles: dict[str, str],
) -> str:
    lines = []
    lines.append("# GSC Analysis Report — 2026-04-10 (28-day window)")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    total_impressions = sum(d["total_impressions"] for d in page_scores.values())
    total_clicks = sum(d["total_clicks"] for d in page_scores.values())
    lines.append(f"- **Total impressions**: {total_impressions:,}")
    lines.append(f"- **Total clicks**: {total_clicks:,}")
    lines.append(f"- **Overall CTR**: {total_clicks / total_impressions * 100:.2f}%" if total_impressions > 0 else "- **Overall CTR**: N/A")
    lines.append(f"- **Pages with data**: {len(page_scores)}")
    lines.append(f"- **Zero-click high-impression pages**: {len(zero_click_pages)}")
    lines.append(f"- **Cannibalized queries**: {len(cannibalization)}")
    lines.append(f"- **Content gap signals**: {len(content_gaps)}")
    lines.append("")

    # --- Section 1: Top 15 pages by opportunity score ---
    lines.append("## Top 15 Pages by Opportunity Score")
    lines.append("")
    lines.append("Opportunity score = sum of (impressions / position) across all queries for that page.")
    lines.append("Higher score = more search demand relative to current ranking.")
    lines.append("")

    sorted_pages = sorted(page_scores.items(), key=lambda x: x[1]["total_score"], reverse=True)[:15]

    for rank, (url, data) in enumerate(sorted_pages, 1):
        slug = url.replace("https://boring-math.com", "")
        title = page_titles.get(url, "(no title found)")
        lines.append(f"### {rank}. {slug}")
        lines.append(f"- **Title**: {title}")
        lines.append(f"- **Opportunity score**: {data['total_score']:.1f}")
        lines.append(f"- **Impressions**: {data['total_impressions']:,} | **Clicks**: {data['total_clicks']} | **Aggregate CTR**: {data['total_clicks'] / data['total_impressions'] * 100:.2f}%" if data['total_impressions'] > 0 else f"- **Impressions**: 0")
        lines.append(f"- **Top queries**:")
        for q in data["queries"][:8]:
            lines.append(f"  - `{q['query']}` — {q['impressions']} imp, {q['clicks']} clicks, pos {q['position']}, score {q['score']}")
        lines.append("")

    # --- Section 2: High-impression zero-click pages ---
    lines.append("## High-Impression Zero-Click Pages")
    lines.append("")
    lines.append("These pages appear in search results but get no clicks. Titles/descriptions may need improvement,")
    lines.append("or the position is too low for visibility.")
    lines.append("")

    for p in zero_click_pages[:20]:
        slug = p.url.replace("https://boring-math.com", "")
        title = page_titles.get(p.url, "(no title found)")
        score = calc_opportunity_score(p.impressions, p.position)
        lines.append(f"- **{slug}** — {p.impressions} imp, pos {p.position:.1f}, score {score:.1f}")
        lines.append(f"  - Title: {title}")
    lines.append("")

    # --- Section 3: Cannibalization ---
    lines.append("## Query Cannibalization")
    lines.append("")
    lines.append("Same query ranking for multiple pages. Google may split ranking signals.")
    lines.append("")

    # Sort by total impressions
    cannibal_sorted = sorted(
        cannibalization.items(),
        key=lambda x: sum(qp.impressions for qp in x[1]),
        reverse=True,
    )

    for query, pages in cannibal_sorted[:20]:
        total_imp = sum(qp.impressions for qp in pages)
        lines.append(f"### `{query}` ({total_imp} total impressions)")
        for qp in pages:
            slug = qp.url.replace("https://boring-math.com", "")
            lines.append(f"- {slug} — {qp.impressions} imp, {qp.clicks} clicks, pos {qp.position:.1f}")
        lines.append("")

    # --- Section 4: Content Gaps ---
    lines.append("## Content Gaps (Query Terms Missing from Title)")
    lines.append("")
    lines.append("Queries ranking for a page where important search terms are absent from the page title.")
    lines.append("Adding these terms to titles, H1s, or meta descriptions may improve relevance signals.")
    lines.append("")

    seen_urls = set()
    count = 0
    for qp, title, missing in content_gaps[:30]:
        slug = qp.url.replace("https://boring-math.com", "")
        key = (slug, tuple(sorted(missing)))
        if key in seen_urls:
            continue
        seen_urls.add(key)
        count += 1
        score = calc_opportunity_score(qp.impressions, qp.position)
        lines.append(f"{count}. **`{qp.query}`** → {slug}")
        lines.append(f"   - Current title: \"{title}\"")
        lines.append(f"   - Missing terms: {', '.join(missing)}")
        lines.append(f"   - {qp.impressions} imp, pos {qp.position:.1f}, score {score:.1f}")
        lines.append("")
        if count >= 25:
            break

    # --- Section 5: Title/Meta Recommendations for Top 5 ---
    lines.append("## Title/Meta Recommendations — Top 5 Opportunities")
    lines.append("")
    lines.append("Concrete title rewrites for the highest-opportunity pages.")
    lines.append("")

    for rank, (url, data) in enumerate(sorted_pages[:5], 1):
        slug = url.replace("https://boring-math.com", "")
        current_title = page_titles.get(url, "(no title found)")
        top_queries = [q["query"] for q in data["queries"][:10]]

        # Extract the most common meaningful terms from top queries
        term_freq: dict[str, int] = defaultdict(int)
        stop = {
            "the", "for", "and", "how", "much", "what", "with", "from",
            "can", "you", "your", "that", "this", "are", "was", "will",
            "calculator", "calculate", "free", "online", "best", "does",
            "boring", "math",
        }
        for q in top_queries:
            for w in q.lower().split():
                if len(w) > 2 and w not in stop:
                    term_freq[w] += 1

        high_freq_terms = sorted(term_freq.items(), key=lambda x: x[1], reverse=True)[:8]
        current_lower = current_title.lower()
        missing_terms = [t for t, _ in high_freq_terms if t not in current_lower]

        lines.append(f"### {rank}. {slug}")
        lines.append(f"- **Current title**: \"{current_title}\"")
        lines.append(f"- **Top search terms**: {', '.join(t for t, c in high_freq_terms)}")
        if missing_terms:
            lines.append(f"- **Missing from title**: {', '.join(missing_terms)}")
        else:
            lines.append(f"- **All top terms present in title**")
        lines.append(f"- **Top queries driving impressions**:")
        for q in data["queries"][:5]:
            lines.append(f"  - `{q['query']}` ({q['impressions']} imp, pos {q['position']})")
        lines.append(f"- **Recommendation**: See suggested title below")

        # Generate a suggested title
        # Pull the page's core topic from the slug
        page_name = slug.split("/")[-1].replace("-", " ").title()
        if missing_terms:
            lines.append(f"- **Suggested title**: Include terms: {', '.join(missing_terms[:3])}")
        lines.append("")

    # --- Section 6: Quick Wins ---
    lines.append("## Quick Wins — Striking Distance (Position 5-20, Zero Clicks)")
    lines.append("")
    lines.append("Pages close to page 1 that need a small push (title tweak, internal links, content update).")
    lines.append("")

    striking = sorted(
        [p for p in zero_click_pages if 5 <= p.position <= 20 and p.impressions >= 3],
        key=lambda p: p.impressions,
        reverse=True,
    )
    for p in striking[:10]:
        slug = p.url.replace("https://boring-math.com", "")
        title = page_titles.get(p.url, "(no title found)")
        lines.append(f"- **{slug}** — {p.impressions} imp, pos {p.position:.1f}")
        lines.append(f"  - Title: {title}")
    lines.append("")

    return "\n".join(lines)


# --- Main ---

def main() -> None:
    print("Loading GSC data...")
    pages_raw = load_json(GSC_DIR / "gsc-pages-28d.json")
    qp_raw = load_json(GSC_DIR / "gsc-query-page-28d.json")

    print(f"Loaded {len(pages_raw)} page rows, {len(qp_raw)} query-page rows")

    pages = parse_pages(pages_raw)
    qp_data = parse_query_page(qp_raw)

    print("Extracting page titles from .astro files...")
    page_titles = extract_page_titles()
    print(f"Found {len(page_titles)} page titles")

    print("Calculating opportunity scores...")
    page_scores = build_page_opportunity_scores(qp_data)

    print("Finding zero-click pages...")
    zero_click_pages = find_high_impression_zero_click_pages(pages)
    print(f"Found {len(zero_click_pages)} zero-click high-impression pages")

    print("Finding cannibalization...")
    cannibalization = find_cannibalization(qp_data)
    print(f"Found {len(cannibalization)} cannibalized queries")

    print("Finding content gaps...")
    content_gaps = find_content_gaps(qp_data, page_titles)
    print(f"Found {len(content_gaps)} content gap signals")

    print("Generating report...")
    report = generate_report(
        page_scores,
        zero_click_pages,
        cannibalization,
        content_gaps,
        page_titles,
    )

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(report, encoding="utf-8")
    print(f"\nReport written to {OUTPUT_PATH}")
    print(f"Report length: {len(report):,} chars, {report.count(chr(10)):,} lines")


if __name__ == "__main__":
    main()
