# Documentation source shell correspondence

Original: Base UI commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`.
Published infrastructure: `@mui/internal-docs-infra@0.12.1-canary.42`.
The file/hash manifest is `receipts/docs/source-shell-files.json`; full MIT notice
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
| `useSearch.mjs` schema/flatten/format/index/search/ranking/buildResultUrl | `search/engine.js`: published pure bodies retained; React hook ownership becomes initialized service. JSDoc describes native call boundary; published untyped body retains scoped ts-nocheck. |
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
