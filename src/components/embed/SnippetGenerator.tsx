import { useState, useMemo, useRef } from 'preact/hooks';
import type { CalculatorEntry } from '../../lib/calculators';
import { calculators } from '../../lib/calculators';
import { embeddableSlugs, getEmbedSnippet } from '../../lib/embeds';

function getEmbedSlug(href: string): string {
  // /calculators/mortgage-calculator -> mortgage-calculator
  return href.replace('/calculators/', '');
}

interface SnippetGeneratorProps {
  readonly initialSlug?: string;
}

export default function SnippetGenerator({ initialSlug }: SnippetGeneratorProps) {
  const embeddableCalcs = useMemo(
    () => calculators.filter((c) => embeddableSlugs.includes(getEmbedSlug(c.href))),
    []
  );

  const initialCalc = initialSlug
    ? embeddableCalcs.find((c) => getEmbedSlug(c.href) === initialSlug)
    : embeddableCalcs[0];

  const [selected, setSelected] = useState<CalculatorEntry>(initialCalc ?? embeddableCalcs[0]);
  const [search, setSearch] = useState('');
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('700');
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return embeddableCalcs;
    const q = search.toLowerCase();
    return embeddableCalcs.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [search, embeddableCalcs]);

  const slug = getEmbedSlug(selected.href);
  const embedSrc = `https://boring-math.com/embed/${slug}`;

  const snippet = getEmbedSnippet(slug, width, height);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = snippet;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function selectCalc(calc: CalculatorEntry) {
    setSelected(calc);
    setSearch('');
    setDropdownOpen(false);
  }

  return (
    <div class="space-y-8">
      {/* Controls */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calculator picker */}
        <div class="md:col-span-3">
          <label class="block text-sm font-medium text-[var(--color-subtle)] mb-2">
            Select a calculator
          </label>
          <div class="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              class="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-charcoal)] border border-white/10 rounded-xl text-[var(--color-cream)] text-left hover:border-[var(--color-accent)]/30 transition-colors"
            >
              <span>
                {selected.title}
                <span class="text-[var(--color-muted)] ml-2 text-sm">({selected.category})</span>
              </span>
              <svg
                class={`w-5 h-5 text-[var(--color-muted)] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div class="absolute z-50 mt-2 w-full bg-[var(--color-night)] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                <div class="p-3 border-b border-white/5">
                  <input
                    type="text"
                    placeholder="Search calculators..."
                    value={search}
                    onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
                    class="w-full px-3 py-2 bg-[var(--color-charcoal)] border border-white/10 rounded-lg text-sm text-[var(--color-cream)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-none"
                    autoFocus
                  />
                </div>
                <div class="max-h-64 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div class="px-4 py-3 text-sm text-[var(--color-muted)]">No results found</div>
                  ) : (
                    filtered.map((calc) => (
                      <button
                        key={calc.href}
                        type="button"
                        onClick={() => selectCalc(calc)}
                        class={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center justify-between ${
                          calc.href === selected.href
                            ? 'text-[var(--color-accent)] bg-white/5'
                            : 'text-[var(--color-cream)]'
                        }`}
                      >
                        <span>{calc.title}</span>
                        <span class="text-xs text-[var(--color-muted)]">{calc.category}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Width input */}
        <div>
          <label
            htmlFor="embed-width"
            class="block text-sm font-medium text-[var(--color-subtle)] mb-2"
          >
            Width
          </label>
          <input
            id="embed-width"
            type="text"
            value={width}
            onInput={(e) => setWidth((e.target as HTMLInputElement).value)}
            placeholder="100%"
            class="w-full px-4 py-3 bg-[var(--color-charcoal)] border border-white/10 rounded-xl text-[var(--color-cream)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/20 focus:outline-none transition-colors"
          />
          <p class="mt-1 text-xs text-[var(--color-muted)]">e.g. 100%, 600px, 40rem</p>
        </div>

        {/* Height input */}
        <div>
          <label
            htmlFor="embed-height"
            class="block text-sm font-medium text-[var(--color-subtle)] mb-2"
          >
            Height (px)
          </label>
          <input
            id="embed-height"
            type="number"
            value={height}
            onInput={(e) => setHeight((e.target as HTMLInputElement).value)}
            placeholder="700"
            min="200"
            max="2000"
            class="w-full px-4 py-3 bg-[var(--color-charcoal)] border border-white/10 rounded-xl text-[var(--color-cream)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/20 focus:outline-none transition-colors"
          />
        </div>

        {/* Preview of selected calc info */}
        <div class="flex items-end">
          <div class="px-4 py-3 rounded-xl bg-white/5 border border-white/5 w-full">
            <p class="text-xs text-[var(--color-muted)] mb-1">Embed URL</p>
            <p class="text-sm text-[var(--color-accent)] break-all font-mono">{embedSrc}</p>
          </div>
        </div>
      </div>

      {/* Code snippet */}
      <div>
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm font-medium text-[var(--color-subtle)]">Embed code</p>
          <button
            type="button"
            onClick={handleCopy}
            class={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              copied
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-[var(--color-accent)] text-[var(--color-void)] hover:shadow-[var(--shadow-glow)]'
            }`}
          >
            {copied ? (
              <>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy to clipboard
              </>
            )}
          </button>
        </div>
        <div class="relative">
          <pre class="p-4 bg-[var(--color-night)] border border-white/5 rounded-xl overflow-x-auto text-sm font-mono text-[var(--color-cream)] leading-relaxed whitespace-pre-wrap break-all">
            <code>{snippet}</code>
          </pre>
        </div>
      </div>

      {/* Live preview */}
      <div>
        <p class="text-sm font-medium text-[var(--color-subtle)] mb-3">Live preview</p>
        <div class="rounded-xl border border-white/10 overflow-hidden bg-[var(--color-night)]">
          {/* Browser chrome mockup */}
          <div class="flex items-center gap-2 px-4 py-3 bg-[var(--color-charcoal)] border-b border-white/5">
            <div class="flex gap-1.5">
              <div class="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div class="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div class="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div class="flex-1 mx-4">
              <div class="px-3 py-1.5 bg-[var(--color-night)] rounded-lg text-xs text-[var(--color-muted)] font-mono truncate">
                {embedSrc}
              </div>
            </div>
          </div>
          {/* Iframe */}
          <div class="p-4 bg-white/[0.02]">
            <iframe
              src={`/embed/${slug}`}
              width={width}
              height={height}
              frameBorder="0"
              style="border:none;border-radius:12px;max-width:100%;"
              loading="lazy"
              title={`${selected.title} embed preview`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
