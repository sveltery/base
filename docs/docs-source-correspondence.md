# Documentation source shell correspondence

Original: Base UI commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`.
Published infrastructure: `@mui/internal-docs-infra@0.12.1-canary.42`.
The historical first-shell file/hash manifest is `receipts/docs/source-shell-files.json`; full MIT notice
is retained in `apps/docs/THIRD_PARTY_NOTICES.md`.

| Original selected bodies | Native target and boundary |
| --- | --- |
| `app/(docs)/layout.tsx`, `layout.css` | `DocsLayout.svelte`, `layout.css`: identical named container/content/sidebar composition; Kit route metadata replaces Next layout. |
| Header, SkipNav | `Header.svelte`: native links and Sveltery identity; selected Source dimensions/CSS remain. |
| SideNav, SideNavItem | `SideNav.svelte`, `SideNavItem.svelte`: current-page nearest-scroll callback, boundary, offset and margin bodies retained; native reactive lifecycle and URL normalization replace React effects. |
| QuickNav, ScrollArea | `QuickNav.svelte`, `ScrollArea.svelte`: actual accepted library ScrollArea primitives; source wrapper classes/parts retained. |
| CodeBlock, CopyButton | `CodeBlock.svelte`: DOM-source copying, timeout feedback, Ctrl/Cmd+A selection scope and source Root/Panel/Content composition; clipboard-copy remains actual dependency. |
| Demo, DemoCodeBlock | `Demo.svelte`, `DemoCodeBlock.svelte`: actual Collapsible primitives, source retained-mounted panel and closed cutoff, before/after collapse viewport preservation; tick replaces React flushSync, native Svelte boundary replaces React ErrorBoundary. |
| ReferenceAccordion, Accordion, DescriptionList, TableCode, observeScrollableInner | `ReferenceTable.svelte`, `ReferenceItem.svelte`, `observeScrollableInner.ts`: native details/summary, hash opening, selection/double-mousedown guard, source description wrapper/overscroll gradient and ResizeObserver/RAF lifecycle. Actual local declaration data replaces React useTypes metadata. |
| Subtitle, ViewSourceLink, MDX headings | `DocsPage.svelte`: native markup and canonical authored IDs/prose; component-only source-directory mapping targets actual Sveltery main directories. No invented Markdown twins. |
| `useSearch.mjs` schema/flatten/format/index/search/ranking/buildResultUrl | `search/engine.ts`: published pure bodies retained; React hook ownership becomes initialized service. Actual schema, sitemap, result variants, callbacks and Orama options are typed in the maintained implementation. The frozen untyped checkpoint is retained in Git and historical receipts. |
| useDeferredSearchSitemap | `search/loader.ts`, NativeSearch warmup: lazy cached import, failed promise reset, next activation retries failed engine initialization. |
| SearchControls/SearchDialog/MobileNav | `NativeSearch.svelte`: source query/loading ownership, pending suppression and IME guard exposed through bounded native dialog/input/list. This is interim; Autocomplete keyboard selection, Drawer gestures, detached handle and Tooltip business remain absent. |
| docs CSS/token/reset/helper closure | `css`, `components/*.css`, `styles.css`: Original CSS bodies; aliases become relative imports, Tailwind/PostCSS expands Original retained theme/utilities/custom media. Original React-demo scan removed; native adapters explicitly isolated in styles.css. |

The first shell does **not** accept SourceFull search widget fidelity, code syntax
parser/gutters, modifier-Enter navigation, API formatter/type metadata, Markdown
twins or every upstream theme control. Starry Night is installed for the next
parser/helper successor; it is not advertised as active in this shell. Original
syntax parser singleton/mutex/fail-open/token/gutter bodies will be retained in
that successor. No React/Next/MDX runtime was added. Exact rendered similarity is
unverified without a legitimate Original screenshot and licensed Die Grotesk.
Paper Mono includes actual OFL text and original WOFF2; Die Grotesk remains named
system fallback. Ordinary docs pages contain product information, not this audit.

## Selected dependencies

Runtime: scroll-into-view-if-needed 3.1.0 (MIT, Original active navigation),
clipboard-copy 4.0.1 (MIT, Original copy helper), @wooorm/starry-night 3.10.0 (MIT,
next Source parser), @orama/orama, plugin-qps, stemmers, stopwords 3.1.18 each
(Apache-2.0, Original index/ranking/tokenizer).
Build: Tailwind and @tailwindcss/postcss 4.2.4 (MIT, retained Original theme/reset/
utility input), postcss-custom-media 12.0.1 (MIT, Original custom breakpoints),
@csstools/css-parser-algorithms 4.0.2 (MIT, compatible peer required by installed
media-query-list-parser 5.0.2 and cascade-layer-name-parser 3.0.2). Initial install
reported generic peer warning; `pnpm peers check` identified installed 4.0.1 versus
required ^4.0.2; scoped exact build dependency repaired it and subsequent peer
check reported no issues. Library/fixture direct version pins stay unchanged.

## Validation and setup limits

Node 24.19.0, cached pinned pnpm 12.6.0 launcher. Default environment pnpm fallback
attempted auto-install and failed SQLite database opening; use direct cached
launcher rather than changing pins. Initial Vite auto-restart failed SSR environment
setup, leaving old CSS pipeline; restarting only owned dev process repaired it.
Actual emitted dev CSS has zero @theme/@custom-media/unexpanded named-breakpoint
rules, and six 84rem occurrences. Standalone HTTP receipt contains all 19 authored
pages plus font and OFL asset200. Kit check zero errors/warnings; static adapter
build exports authored docs only. Development remains port5178, session12438.
Browser interactions/screenshots require secured supported hosted browser setup;
HTTP/type/static checks do not establish keyboard/mobile acceptance.

## Parser and query successor

The successor ports complete published `pipeline/parseSource` bodies:
`parseSource`, `createParseSource`, `registerGrammars`, `registerAllGrammars`,
`createIfNeeded`, `enqueue`, `registerScopes`, `loadGrammars`, `resetStarryNight`,
`grammarCache` registration/readiness facade, `grammarMaps`, `grammarLoaders`,
`grammars`, `starryNightGutter`/`countLines`/`createLine`, `createFrame`,
`isFrameSpan`/`hasClassName`, full `extendSyntaxTokens` helper closure and
`languageCapabilities`. `getShallowTextContent` is imported directly from its
actual shared `hastUtils/getHastTextContent` leaf rather than through unrelated
React type/compression barrels. One native `CodeContent.svelte` renderer supplies
CodeBlock and Demo; escaped Svelte text/span rendering replaces `hastToJsx` and
`toJsxRuntime`. It does not copy the React runtime, editing/variant transition or
compression machinery. Plain-text frame/gutter fallback remains readable in SSR;
syntax is loaded after hydration with native effect cleanup/cancellation.

The unchanged `createPlainTextRoot` business body moves to a lightweight shared
`plainText.ts` to keep the regex engine out of the initial renderer import.
Singleton global key, creation dedup, serialized registration chain, dependency
fixpoint, fail-open fallback, token enhancement and gutter/frame metadata remain
Original. The supported `getOnigurumaUrlFetch` option loads actual pinned
`vscode-oniguruma@2.0.1` WASM through Vite's asset URL; Node retains Starry Night's
real filesystem loader. This additional direct MIT dependency is explicitly
approved; no CDN runtime request is needed. Node tests adapt only Vite's asset
URL module resolution, then run the actual Node regex engine and complete parser.

The original grammar inventory remains JS, TS, TSX, JSON, Markdown, MDX, HTML,
CSS, shell and YAML. The native extension adds the genuine Starry Night
`source.svelte` grammar (sebastinez/svelte-atom, MIT, copyright 2018 Umang Galaiya),
including its CSS/JS/TS dependencies. JSON loader/barrel payload is deliberately
absent: Starry Night 3.10.0's header declares Nixinova/NovaGrammars and ISC, but
that repository's notice/readme URLs returned404. No current authored JSON
samples exist. JSON scope metadata remains mapped and fails open to readable
plain text; this is incomplete, not full language acceptance. Complete located
MIT/TextMate notices and Oniguruma/TextMate notices ship in the static artifact.

Selected Search helpers now preserve `normalizeSearchGroup`,
`searchResultToString`, `handleModifiedEnterNavigation` and
`isUnmodifiedLeftClick`. Native KeyboardEvent replaces React nativeEvent;
modifier Enter applies to a genuinely focused native result link. No absent
Autocomplete highlighted-result state is invented for the input. Default
modified-link navigation remains native; close occurs only for an unmodified
left click. IME/229 guard and noop without a result remain actual Source branches.
Autocomplete arrow selection, Drawer gestures, Tooltip/detached handle, complete
API type formatter and code emphasis/focus/variant pipeline remain incomplete.
Unmarked demo frames currently use the retained CSS empty collapsed window until
Show code; no invented focused-frame metadata or six-line preview acceptance is
claimed. Canonical Collapsible's inherited source/native modernization is owned
separately; its used closure remains blocked until that audit is accepted.

The OFL text retains its full original notice, with only the original line21
trailing space normalized after frozen5a3's git diff check failed. No license text
was removed. Native docs components were formatted into readable blocks using
temporary formatter tooling outside the project, without adding project deps.

Actual Node parser checks3/3 cover concurrent singleton grammar registration,
Svelte dependencies/text preservation, extended TypeScript/template token classes,
unsupported fallback,121-line frame splitting and terminal-newline fallback.
Actual SSR-rendered demo text equals its original2080-byte source exactly.
Local Chromium startup failed before test execution (initial crashpad config;
then SUID sandbox setup after normal writable XDG directories). No security
bypass or browser assertion credit was taken. The dedicated config retains
chromiumSandbox:true and runs three actual standalone Kit3 tests on secured
Ubuntu22.04, with copied established action SHA pins, JSON/raw logs/traces and
screenshots. Default component browser discovery is unchanged. Hosted results
and independent exact-head review remain pending.

A concrete native sitemap gap was reproduced: Original schema declares `types`,
but Original dummyDoc omits it; with no actual page type metadata QPS throws
reading `tokensLength` for every nonempty query. The engine/dummy/ranking bodies
remain unchanged. Native sitemap now indexes exported type names from actual
Dialog/Accordion declaration JSON (the native counterpart of Source useTypes
metadata transport). Actual queries button/avatar/remote form return their correct
first route. A focused regression runs those real queries; the original failure
receipt is retained. This does not claim the complete Source API formatter.

## Frozen fa041 review checkpoint and focused repairs

Fresh review identified a nonexistent `.QuickNav` browser target; desktop
visibility was unvalidated and mobile absence made its hidden assertion vacuous.
Tests now target the rendered `.QuickNavRoot`, and mobile first asserts actual
SideNav/QuickNav node existence. IME/229 modifier-Enter probes target a genuinely
focused native result link, where the selected helper runs, rather than the input.

The fa041 notices incorrectly grouped QPS under Orama's2023 copyright and only
linked Apache terms. Exact package-specific2024 QPS and2023 stemmer/stopword
notices are now retained, along with the genuine complete Apache2 license from
installed `/usr/share/common-licenses/Apache-2.0`. Only trailing whitespace was
normalized. The static-adapter-copy asset was refreshed directly in the retained
local build; source, copied build and actual HTTP-served bytes match. This focused
asset check is not a new build or browser acceptance. Historical assertions/run
history and incomplete licensing checkpoint are retained without parity credit;
hosted successor browser execution and exact-head review remain pending.

## Maintained TypeScript source correction

The frozen `fd4928c034be417fcdc0451f4214c34ddbc09510` checkpoint used 12
published parser/helper JavaScript modules and one native search JavaScript
module, with separate declarations and `@ts-nocheck`. The pinned
`@mui/internal-docs-infra@0.12.1-canary.42` archive was inspected for original
TypeScript and source-map `sourcesContent`: it contains compiled `.mjs` and
`.d.mts` declarations, with no source `.ts`/`.tsx` or `.map` files and no
immutable `gitHead` in its metadata. That exact published package remains the
authority; no other upstream revision was substituted.

All 13 maintained runtime modules are now `.ts`, and the four separate local
declarations are folded into the implementation APIs. The complete token helper
closure, grammar cache/facade/maps/loaders/barrel, fallback/gutter/frame and
search/index/ranking bodies are unchanged after type erasure. The new
`receipts/docs/typescript-source-files.json` records original hashes, frozen and
typed hashes, all runtime and type-only import edges, and the native caller/test
closure. Its companion portable Node evidence tool checks the actual installed
TypeScript 6.0.3 AST after erasure against the frozen 13 bodies; it normalizes only
import `.mjs` to `.js` spelling, redundant parentheses and shorthand assignments.
All 13 match. Earlier source archives, receipts, failures and notices are intact.

| Maintained typed owner | Actual types and preserved boundary |
| --- | --- |
| `highlight/types.ts` | HAST node/element/root types derive from Starry Night's supplied HAST API; recursive frame fallbacks, line/frame metadata, parser function, grammar singleton and Source frame-kind/truncation unions remain explicit. Starry Night 3.10.0 and its installed `@types/hast` 3.0.5 declare MIT. All these imports erase before runtime. |
| `parseSource.ts`, `grammarCache.ts` | Typed shared global property, instance creation promise, grammar arrays, registration task/mutex and readiness slice. The facade still has only a dynamic runtime parser import; the engine remains deferred. |
| `grammarMaps.ts`, `grammarLoaders.ts`, `grammars.ts`, `languageCapabilities.ts` | Unknown map keys return `undefined`; supplied `Grammar` types describe real dynamic/static payloads; Source language capability branches stay unchanged. JSON payload stays absent and unsupported; Svelte grammar and local Vite WASM remain unchanged. |
| `plainText.ts`, `addLineGutters.ts`, `createFrame.ts`, `isFrameSpan.ts`, `getHastTextContent.ts` | Actual HAST trees, frame/line metadata, class arrays, recursive/shallow text and native parser result APIs. One documented cast acknowledges generic HAST Root can contain a document doctype while this real highlighting/plain-text pipeline emits only element/text children for line spans. |
| `extendSyntaxTokens.ts` | Every helper parameter/return is typed, including the discriminated string/expression template stack, brace depth, children/target arrays and span mutation. All scanning, enhancement and structural branches remain Source bodies. |
| `search/engine.ts`, `search/types.ts`, `sitemap.ts`, `searchUtils.ts` | Real sitemap/page/section/API shapes, discriminated page/part/export/section/subsection results, literal Orama schema, supplied `Result`/`Orama`/search options, grouped elapsed/count state, flatten/format/slug callbacks and cache fields. The dummy document still omits `types`; actual declaration metadata still provides it. Source boosts/ranking/grouping/URLs and native lifecycle are unchanged. |
| `CodeContent.svelte`, `NativeSearch.svelte` | Native snippets/rendering/effect cleanup and dialog/query/timer/focus ownership stay unchanged. Import paths select the typed source; shared real result types replace the earlier partial inline result shape. |
| `test/highlight.test.ts`, `test/search.test.ts` | Node 24 native type erasure runs actual typed source, actual Starry Night filesystem WASM and actual Orama/QPS. A narrow docs-relative `.js` to `.ts` resolver preserves canonical bundler import spelling. The source WASM URL packaging hook is unchanged; all four tests and their behavior assertions remain, with an additional real frame/fallback existence assertion. |

There are no maintained `.js`/`.mjs` files in `apps/docs/src`, `apps/docs/test` or
the docs app configuration. The evidence checker remains portable `.mjs`, like
the existing root API extraction/SSR/build tools and `scripts/tests/docs.test.mjs`.
No new dependency or version change was needed. This correction does not claim
the incomplete docs widgets, inherited Collapsible audit or exact visual parity.
Focused checks executed: docs and fixtures type checks each zero errors/warnings,
docs ESLint clean, parser 3/3 and actual QPS query 1/1, canonical metadata/API
checks 3/3, and runtime AST equivalence 13/13. Development port5178 remains live.
Static build, hosted three browser witnesses and independent final-head review
must be refreshed for this successor before acceptance.
