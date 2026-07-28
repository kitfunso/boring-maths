"""
GSC Region Analysis — where users come from, per country.

Reads the country-dimension exports produced by `npm run seo:gsc-pull`
(gsc-countries-28d.json, gsc-country-page-28d.json, gsc-country-query-28d.json)
and writes a per-region review: country totals, clicks by country, top
pages/queries per major market, region-intent mismatch, and striking-distance
sets per market.
"""

import json
import re
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(__file__).resolve().parent.parent


def _latest_export_dir() -> Path:
    export_root = BASE_DIR / "gsc-export"
    dated = sorted(
        (d for d in export_root.iterdir() if d.is_dir() and (d / "gsc-countries-28d.json").exists()),
        key=lambda d: d.name,
    )
    if not dated:
        raise SystemExit(
            f"No exports with country data under {export_root}. Run: npm run seo:gsc-pull"
        )
    return dated[-1]


GSC_DIR = _latest_export_dir()
OUTPUT_PATH = BASE_DIR / "docs" / f"gsc-region-analysis-{GSC_DIR.name}.md"

COUNTRY_NAMES = {
    "gbr": "United Kingdom", "usa": "United States", "ind": "India",
    "can": "Canada", "aus": "Australia", "irl": "Ireland", "deu": "Germany",
    "fra": "France", "nld": "Netherlands", "esp": "Spain", "ita": "Italy",
    "pol": "Poland", "phl": "Philippines", "pak": "Pakistan", "nga": "Nigeria",
    "zaf": "South Africa", "sgp": "Singapore", "mys": "Malaysia", "hkg": "Hong Kong",
    "are": "UAE", "nzl": "New Zealand", "bra": "Brazil", "idn": "Indonesia",
    "bgd": "Bangladesh", "ken": "Kenya", "swe": "Sweden", "tur": "Turkey",
    "vnm": "Vietnam", "tha": "Thailand", "egy": "Egypt", "mex": "Mexico",
}

# Region-intent classification by URL slug tokens/phrases. Deliberately
# conservative: only unambiguous markers. Matched page lists are printed in the
# report so misclassification is visible rather than silent.
UK_PHRASES = (
    "stamp-duty", "national-insurance", "council-tax", "child-benefit",
    "universal-credit", "salary-sacrifice", "dividend-tax", "student-loan",
    "take-home-pay", "capital-gains",
)
UK_TOKENS = {"uk", "lbtt", "ltt", "sdlt", "vat", "hmrc", "avios", "isa", "iht"}
US_PHRASES = ("sales-tax",)
US_TOKENS = {"us", "usa", "401k", "roth", "irs"}


def load_rows(name: str) -> list[dict]:
    with open(GSC_DIR / name, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["rows"] if isinstance(data, dict) and "rows" in data else data


def country_name(code: str) -> str:
    return COUNTRY_NAMES.get(code, code.upper())


def slug_of(url: str) -> str:
    return url.rstrip("/").rsplit("/", 1)[-1]


def region_intent(url: str) -> str:
    slug = slug_of(url)
    tokens = set(slug.split("-"))
    if any(p in slug for p in UK_PHRASES) or tokens & UK_TOKENS:
        return "UK"
    if any(p in slug for p in US_PHRASES) or tokens & US_TOKENS:
        return "US"
    return "global"


def wavg_pos(rows: list[dict]) -> float:
    impr = sum(r["impressions"] for r in rows)
    if not impr:
        return 0.0
    return sum(r["position"] * r["impressions"] for r in rows) / impr


def fmt_row(cells: list[str]) -> str:
    return "| " + " | ".join(cells) + " |"


def main() -> None:
    countries = sorted(load_rows("gsc-countries-28d.json"), key=lambda r: -r["impressions"])
    country_page = load_rows("gsc-country-page-28d.json")
    country_query = load_rows("gsc-country-query-28d.json")

    total_clicks = sum(r["clicks"] for r in countries)
    total_impr = sum(r["impressions"] for r in countries)

    lines: list[str] = []
    out = lines.append
    out(f"# GSC Region Analysis — {GSC_DIR.name}")
    out("")
    meta = GSC_DIR / "_pull-meta.json"
    if meta.exists():
        m = json.loads(meta.read_text(encoding="utf-8"))
        out(f"Window: {m['startDate']} → {m['endDate']} (dataState={m['dataState']})")
    out(f"Totals: **{total_clicks} clicks / {total_impr:,} impressions** across {len(countries)} countries.")
    out("")
    cp_clicks = sum(r["clicks"] for r in country_page)
    out(
        f"> **Caveat:** GSC drops many rows when country is combined with page/query "
        f"(privacy thresholds). Country totals above are reliable; the per-market page/query "
        f"tables below understate clicks (only {cp_clicks} of {total_clicks} clicks survive in "
        f"the country+page split) — read them for impression/position signal, not click counts."
    )
    out("")

    # --- 1. Country totals ---
    out("## 1. Top countries by impressions")
    out("")
    out(fmt_row(["Country", "Clicks", "Impressions", "Impr %", "CTR", "Avg pos"]))
    out(fmt_row(["---"] * 6))
    for r in countries[:20]:
        out(fmt_row([
            country_name(r["keys"][0]),
            str(r["clicks"]),
            f"{r['impressions']:,}",
            f"{100 * r['impressions'] / total_impr:.1f}%",
            f"{100 * r['ctr']:.2f}%",
            f"{r['position']:.1f}",
        ]))
    out("")

    # --- 2. Every country that clicked ---
    clicked = sorted((r for r in countries if r["clicks"] > 0), key=lambda r: -r["clicks"])
    out("## 2. Countries with clicks")
    out("")
    out(fmt_row(["Country", "Clicks", "Impressions", "CTR", "Avg pos"]))
    out(fmt_row(["---"] * 5))
    for r in clicked:
        out(fmt_row([
            country_name(r["keys"][0]), str(r["clicks"]), f"{r['impressions']:,}",
            f"{100 * r['ctr']:.2f}%", f"{r['position']:.1f}",
        ]))
    out("")

    # --- 3. Top pages per major market ---
    top_codes = [r["keys"][0] for r in countries[:6]]
    by_country_pages: dict[str, list[dict]] = defaultdict(list)
    for r in country_page:
        by_country_pages[r["keys"][0]].append(r)

    out("## 3. Top pages per major market")
    for code in top_codes:
        rows = sorted(by_country_pages[code], key=lambda r: (-r["clicks"], -r["impressions"]))[:10]
        out("")
        out(f"### {country_name(code)}")
        out("")
        out(fmt_row(["Page", "Clicks", "Impr", "Pos"]))
        out(fmt_row(["---"] * 4))
        for r in rows:
            page = r["keys"][1].replace("https://boring-math.com", "")
            out(fmt_row([page, str(r["clicks"]), f"{r['impressions']:,}", f"{r['position']:.1f}"]))
    out("")

    # --- 4. Top queries per major market ---
    by_country_queries: dict[str, list[dict]] = defaultdict(list)
    for r in country_query:
        by_country_queries[r["keys"][0]].append(r)

    out("## 4. Top queries per major market")
    for code in top_codes[:4]:
        rows = sorted(by_country_queries[code], key=lambda r: (-r["clicks"], -r["impressions"]))[:12]
        out("")
        out(f"### {country_name(code)}")
        out("")
        out(fmt_row(["Query", "Clicks", "Impr", "Pos"]))
        out(fmt_row(["---"] * 4))
        for r in rows:
            out(fmt_row([r["keys"][1], str(r["clicks"]), f"{r['impressions']:,}", f"{r['position']:.1f}"]))
    out("")

    # --- 5. Region-intent vs actual audience ---
    intent_pages: dict[str, set[str]] = defaultdict(set)
    intent_country: dict[str, dict[str, dict[str, float]]] = defaultdict(
        lambda: defaultdict(lambda: {"clicks": 0, "impressions": 0})
    )
    for r in country_page:
        code, url = r["keys"]
        intent = region_intent(url)
        intent_pages[intent].add(url)
        agg = intent_country[intent][code]
        agg["clicks"] += r["clicks"]
        agg["impressions"] += r["impressions"]

    out("## 5. Region-intent pages vs where they are actually seen")
    out("")
    out("Pages classified by slug markers (conservative; unmatched = global).")
    for intent in ("UK", "US"):
        pages = sorted(intent_pages.get(intent, set()))
        if not pages:
            continue
        dist = sorted(intent_country[intent].items(), key=lambda kv: -kv[1]["impressions"])
        total_i = sum(v["impressions"] for _, v in dist) or 1
        out("")
        out(f"### {intent}-intent pages ({len(pages)})")
        out("")
        out(", ".join(slug_of(p) for p in pages))
        out("")
        out(fmt_row(["Seen in", "Clicks", "Impressions", "Share"]))
        out(fmt_row(["---"] * 4))
        for code, v in dist[:8]:
            out(fmt_row([
                country_name(code), str(int(v["clicks"])), f"{int(v['impressions']):,}",
                f"{100 * v['impressions'] / total_i:.1f}%",
            ]))
    out("")

    # --- 6. Striking distance per market (pos 5-25, by impressions) ---
    out("## 6. Striking distance per market (pos 5-25)")
    for code in ("gbr", "usa"):
        rows = [
            r for r in by_country_pages.get(code, [])
            if 5 <= r["position"] <= 25 and r["impressions"] >= 20
        ]
        rows.sort(key=lambda r: -r["impressions"])
        out("")
        out(f"### {country_name(code)}")
        out("")
        out(fmt_row(["Page", "Clicks", "Impr", "Pos"]))
        out(fmt_row(["---"] * 4))
        for r in rows[:15]:
            page = r["keys"][1].replace("https://boring-math.com", "")
            out(fmt_row([page, str(r["clicks"]), f"{r['impressions']:,}", f"{r['position']:.1f}"]))
    out("")

    OUTPUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"Report written to {OUTPUT_PATH}")
    print(f"Totals: {total_clicks} clicks / {total_impr:,} impressions / {len(countries)} countries")
    for r in clicked[:8]:
        print(f"  {country_name(r['keys'][0]):16} {r['clicks']:3} clicks  {r['impressions']:7,} impr  pos {r['position']:.1f}")


if __name__ == "__main__":
    main()
