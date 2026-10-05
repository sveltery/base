# Source-first documentation successor plan

Status: pre-code dependency assessment; no visual port is implemented yet. PR71
head `8504bf22b31e82c7d48fc6c7ee63cd810e78e1df` remains the running development
baseline, not acceptance of the newly requested Base UI docs source port.

## Immutable source and review scope

Original Base UI v1.8.0 commit
`47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c` is the source. Exact bodies are
available at `https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/`.
The original root LICENSE is MIT, copyright2019 Material-UI SAS. Substantial
adaptations will retain its complete notice in `apps/docs/THIRD_PARTY_NOTICES.md`
and identify original file/pin in the adapted component/helper/CSS source.

Read/extracted scope: `docs/src/app/(docs)/layout.tsx` and `layout.css`,
`docs/src/components`, `docs/src/utils`, `docs/src/css`, original icons/blocks,
sitemap, docs manifest and PostCSS/Next configuration. The original docs-infra
package is separately pinned at `@mui/internal-docs-infra@0.12.1-canary.42`
(actual npm tarball and MIT notice inspected); its useSearch and parseSource
imports are dependencies, not invented replacements.

Selected closure before implementation:

| Original owner | Actual imports/business dependencies | Proposed local owner/native substitution |
| --- | --- | --- |
| `(docs)/layout` | Header, SideNav, QuickNav, sitemapPage/getDisplayTitle, DocsProviders, GoogleAnalytics, icons, CSS | `apps/docs/src/lib/docs/DocsLayout.svelte`; preserve RootLayout/ContentLayout nesting, page/nav order and source classes; Kit page state/native links replace Next, Svelte snippets/context replace React providers. Authored Sveltery metadata replaces React MDX and npm/version claims. Analytics is omitted, explicitly. |
| Header | Logo, SearchControls, SkipNav, Header.css | Native Svelte Header/SkipNav with same geometry; Sveltery wordmark replaces Base UI trademark identity. |
| SideNav | real ScrollArea; scroll-into-view-if-needed; Header height; Next pathname; clsx | Native reusable parts and item with real local ScrollArea; retain active-item source scroll-margin/header-offset algorithm. Native `class` replaces clsx assembly where it carries no business contract. |
| QuickNav | real ScrollArea; pathname/analytics; CSS | Native reusable QuickNav parts; preserve fixed breakpoint/layout and section link order; metadata supplies actual section IDs. |
| SearchControls/SearchDialog/MobileNavDrawer | Dialog/Drawer handles, Autocomplete, ScrollArea, platform, timers, lazy sitemap, delayed search results, engine, tracking, lucide CornerDownLeft | Port control ownership, lazy loader/250ms warmup, stale-query IDs,400ms empty delay, IME guards and modified Enter helper once. Real local Dialog/ScrollArea can be reused. Unimplemented Drawer/Autocomplete and detached Dialog handles remain explicit missing business boundaries; native dialog/input/list primitives can support a bounded docs-native surface, but cannot claim those Original widget/gesture contracts. |
| useDocsSearch → infra/useSearch | Orama database/create/insert/search; QPS plugin; English stemmer/stopwords; schema flattening/grouping, boosts, URLs/default results | Preserve actual engine and pure business bodies in one Svelte-native search module. React memo/effects/callbacks become native state/lifecycle. Authored Doc data becomes sitemap input; it must not change existing section IDs. |
| searchUtils/searchSitemap | semver-context slugs, group normalization/count, IME/modified Enter, singleton loader retry | Direct body adaptation with native event type and native lazy module import; unused semver branches remain recognizable if helper is used. |
| CodeBlock | clipboard-copy; ScrollArea; GhostButton; Check/Copy icons; copy2s feedback; SelectAll; infra precomputed useCode | Native Root/Panel/Content composition and source copy/selection/feedback algorithm; precomputed source is actual rendered Svelte file, with Kit build/load replacing Next server/React code contexts. |
| infra parseSource | starry-night; grammarMaps/loaders, addLineGutters, extendSyntaxTokens; TextMate/Oniguruma | Build-side native highlighting using selected Original pure parser/helper bodies and Svelte/CSS/TS grammars; output token tree rendered natively. No React highlighter/provider runtime. Unsupported interactive editing/enhancer/export scope remains deferred. |
| Demo | Collapsible, ScrollArea, Menu/Select wrappers; useDemo→useCode; file/variant selection; exports; errors; collapse scroll compensation | Source-derived Preview/Code composition for the actual single Svelte example; native Svelte boundary and real local Collapsible/ScrollArea. Port relevant collapse/focus/copy behavior. Do not present unavailable React variants/StackBlitz/CodeSandbox exports as implemented. |
| ReferenceTable/ReferenceAccordion | useTypes; Accordion details/summary wrappers; observeScrollableInner; DescriptionList; TableCode; CodeBlock; type/HAST conversion | Actual native details/summary source algorithm (selection guard, hash-driven open, ResizeObserver/RAF cleanup) and source visual table composition; existing extracted local declarations are input. No fabricated default/description metadata. |
| CSS index/layout/component files | Tailwind reset/theme/utilities; native CSS layers/nesting; custom-media; fonts; syntax | Preserve source token values, source selectors, breakpoint64rem/84rem,48rem content,17.5rem sidebars,3rem desktop outer padding,3/4rem header and media dark colors. Native CSS substitutes only Tailwind generation/Next path aliases where required. |

The selected Original bodies and all used imports, including reused library
business helpers outside the docs diff, need final source/native/maintainability
review. Missing business dependencies prevent full docs feature fidelity; this
plan does not waive that gate.

## Scoped additional third-party dependencies

These candidates are selected by actual imports. None is added yet. Exact
versions below match the original lock or inspected original package requirement.

| Package | Version/license | Needed for | Native/other alternative and limit |
| --- | --- | --- | --- |
| `scroll-into-view-if-needed` |3.1.0 / MIT | SideNav’s bounded nearest-scroll actions/custom behavior | Native scrollIntoView does not provide the same boundary/action algorithm. Preserve package. |
| `clipboard-copy` |4.0.1 / MIT | Original copy behavior including fallback | navigator.clipboard alone changes fallback behavior. Preserve package. |
| `@orama/orama` |3.1.18 / Apache-2.0 | Actual docs-infra search engine | A title substring filter would change ranking/tokenization/grouping and is not an equivalent source port. |
| `@orama/plugin-qps` |3.1.18 / Apache-2.0 | Original QPS search algorithm optimized for descriptive text | Removing the plugin changes search semantics. |
| `@orama/stemmers` |3.1.18 / Apache-2.0 | Original English stemming | Handwritten stemming is not a justified replacement. |
| `@orama/stopwords` |3.1.18 / Apache-2.0 | Original filtered software-doc stopwords | Preserve original word filtering. |
| `@wooorm/starry-night` |3.10.0 / MIT | Original syntax engine | Plain text does not match highlighting; alternative engine would require a recorded difference. Its TextMate/Oniguruma dependencies and each selected grammar’s retained notices require inclusion. |
| `tailwindcss` |4.2.4 / MIT | Original reset/theme input | If only explicit CSS is used, preserve the exact selected reset bodies with MIT rather than inventing a new reset. Do not add all Tailwind demo generation by default. |
| `postcss-custom-media` |12.0.1 / MIT | Original custom media definitions across source CSS | Expanding Original aliases to the same literal conditions is a build-native substitution, if recorded and verified. |

Potential build-only dependencies, only if the source Tailwind pipeline is kept:
`@tailwindcss/postcss@4.2.4`, `postcss@8.5.26`, `postcss-import@16.1.1` (MIT).
Vite already resolves CSS imports; do not duplicate that tool without need.
`clsx@2.1.1` is Original MIT class assembly, replaceable by native Svelte class
syntax without changing source business behavior. `match-sorter@8.3.0` belongs to
variant selectors rather than the selected search engine. `lz-string@1.5.0`
belongs to sandbox export, currently deferred. Do not install the entire docs
manifest or React/Next/MDX runtime. Native SVG adaptations of actual MIT icon
paths replace React-only icon wrappers; no extra icon library is needed.

## Font and rendering blockers

Original WOFF2 metadata was inspected, rather than assuming root MIT covers fonts.
Die Grotesk A: copyright2025 Klim Type Foundry, All Rights Reserved; nameID13
makes use subject to Klim Font Licence Agreements, nameID14
`https://klim.co.nz/licences/`. No applicable redistribution/use grant was found.
Do not copy these fonts. Exact heading/body typography remains blocked on a valid
license; preserve source metrics with an explicitly recorded system fallback.

Paper Mono: copyright2025 Paper Mono Project Authors, source
`https://github.com/paper-design/paper-mono`, SIL Open Font License1.1;
`https://openfontlicense.org`. It can be included with its actual OFL text and
copyright notice after license provenance is saved.

Public Quick start and Dialog pages were inspected through the supported web
connector on2026-10-05. They confirm header Search/Navigation, Overview/Handbook/
Components/Utils sections, right-side contents, plain h1/subtitle/source links,
preview first, code/file controls, then usage/anatomy/examples/API flow. The source
CSS defines the visual tokens/geometry above. Direct `base-ui.com` HTTP/browser
access returns a network-policy403, and no callable browser screenshot service is
available; current rendered pixel comparison to the public site is unverified.
Do not claim an exact visual match from text or source inspection alone.

## Proposed implementation and ownership

After Root plan review, add Source-derived docs-owned components/helpers/CSS in
`apps/docs/src/lib/docs`, update only standalone docs wrappers to consume them,
and reuse shared authored prose/API/example data. Keep the existing fixture docs
shell and fixture URLs/types/business source untouched by the visual successor.
Own the source-correspondence/hash/import record, notices/fontOFL, bounded docs
validation, docs manifest/lock additions, apps/docs ESLint target, and a static
docs build step in existing CI. Preserve the currently running dev server5178,
Kit3.0.0, private/unpublished status, independent Base UI/shadcn credits and the
historical8504 commit. Validate actual19routes/assets/links, SSR/static output,
keyboard/search/focus/mobile overflow and screenshots where browser startup is
available. Reopen final independent/configured review at the actual successor
head before any normal merge. Cloudflare hosting remains user-managed.
