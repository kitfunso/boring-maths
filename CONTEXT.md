# CONTEXT.md — shared vocabulary

Glossary only. One entry per term the codebase actually uses. No design notes, no
specification. Add a term the first time work needs it and it is not already here.

## Registry terms

**Registry** — `src/lib/calculators.ts`. The source of truth for which calculators
exist. Drives the homepage grid and the count. A page that exists but is not in the
registry is deliberate: hub and guide pages are excluded.

**Country code** — the `country` field on a registry entry: `UK`, `US`, `EU`, `SG`.
It records which nation's rules a calculator implements. It is NOT a locale and it is
NOT valid in markup: see **locale code**.

## Regional-variant terms

**Locale code** — an IETF language tag emitted in `hreflang`, built from ISO 639-1
language plus ISO 3166-1 alpha-2 region: `en-GB`, `en-US`, `en-SG`. Distinct from a
country code, and the two differ where it matters. `UK` and `EU` are reserved codes
that Google ignores; the United Kingdom's region code is `GB`, and the European Union
has no valid region code at all.

**Family** — a set of calculators that answer the same user question under different
national rules, for example "what is my net pay" answered for the UK, the US and
Singapore. Membership is a judgment about equivalence, not a string match on the slug,
so families are declared explicitly rather than derived.

**Cluster** — the set of `hreflang` link tags emitted on one page for its family.
Google requires a cluster to be reciprocal and self-referencing: every member links
every member, itself included.

**x-default** — the `hreflang` value marking the page to serve when no locale matches.
It means "this page targets no particular locale". No page on this site qualifies, so
no family declares one.
