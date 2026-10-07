# Documentation source shell correspondence

Original: Base UI commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`.
Published infrastructure: `@mui/internal-docs-infra@0.12.1-canary.42`.
The historical first-shell file/hash manifest is `receipts/docs/source-shell-files.json`; full MIT notice
is retained in `apps/docs/THIRD_PARTY_NOTICES.md`.

| Original selected bodies                                                          | Native target and boundary                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/(docs)/layout.tsx`, `layout.css`                                             | `DocsLayout.svelte`, `layout.css`: identical named container/content/sidebar composition; Kit route metadata replaces Next layout.                                                                                                                                                                     |
| Header, SkipNav                                                                   | `Header.svelte`: native links and Sveltery identity; selected Source dimensions/CSS remain.                                                                                                                                                                                                            |
| SideNav, SideNavItem                                                              | `SideNav.svelte`, `SideNavItem.svelte`: current-page nearest-scroll callback, boundary, offset and margin bodies retained; native reactive lifecycle and URL normalization replace React effects.                                                                                                      |
| QuickNav, ScrollArea                                                              | `QuickNav.svelte`, `ScrollArea.svelte`: actual accepted library ScrollArea primitives; source wrapper classes/parts retained.                                                                                                                                                                          |
| CodeBlock, CopyButton                                                             | `CodeBlock.svelte`: DOM-source copying, timeout feedback, Ctrl/Cmd+A selection scope and source Root/Panel/Content composition; clipboard-copy remains actual dependency.                                                                                                                              |
| Demo, DemoCodeBlock                                                               | `Demo.svelte`, `DemoCodeBlock.svelte`: actual Collapsible primitives, source retained-mounted panel and closed cutoff, before/after collapse viewport preservation; tick replaces React flushSync, native Svelte boundary replaces React ErrorBoundary.                                                |
| ReferenceAccordion, Accordion, DescriptionList, TableCode, observeScrollableInner | `ReferenceTable.svelte`, `ReferenceItem.svelte`, `observeScrollableInner.ts`: native details/summary, hash opening, selection/double-mousedown guard, source description wrapper/overscroll gradient and ResizeObserver/RAF lifecycle. Actual local declaration data replaces React useTypes metadata. |
| Subtitle, ViewSourceLink, MDX headings                                            | `DocsPage.svelte`: native markup and canonical authored IDs/prose; component-only source-directory mapping targets actual Sveltery main directories. No invented Markdown twins.                                                                                                                       |
| `useSearch.mjs` schema/flatten/format/index/search/ranking/buildResultUrl         | `search/engine.ts`: published pure bodies retained; React hook ownership becomes initialized service. Actual schema, sitemap, result variants, callbacks and Orama options are typed in the maintained implementation. The frozen untyped checkpoint is retained in Git and historical receipts.       |
| useDeferredSearchSitemap                                                          | `search/loader.ts`, NativeSearch warmup: lazy cached import, failed promise reset, next activation retries failed engine initialization.                                                                                                                                                               |
| SearchControls/SearchDialog/MobileNav                                             | `NativeSearch.svelte`: source query/loading ownership, pending suppression and IME guard exposed through bounded native dialog/input/list. This is interim; Autocomplete keyboard selection, Drawer gestures, detached handle and Tooltip business remain absent.                                      |
| docs CSS/token/reset/helper closure                                               | `css`, `components/*.css`, `styles.css`: Original CSS bodies; aliases become relative imports, Tailwind/PostCSS expands Original retained theme/utilities/custom media. Original React-demo scan removed; native adapters explicitly isolated in styles.css.                                           |

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

Fresh independent review found the initial audit tool recorded template cooked
text without its raw spelling: escaped `\\n` and a literal linefeed inside a
tagged template compared equal even though `strings.raw[0]` differs. The evidence
tool now retains `rawText` (or the actual source token spelling), and that exact
counterexample correctly differs. All 13 maintained bodies still match and all
12 independent normalization-sensitivity probes now pass through the owner tool.
`receipts/docs/typescript-proof-sensitivity.json` preserves the original false
positive and correction. An earlier speculative optional-chain/directive concern
was not reproduced by the exact checker and is recorded as corrected. These
checks support this selected source audit; final independent closure review is
still required.

| Maintained typed owner                                                                           | Actual types and preserved boundary                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `highlight/types.ts`                                                                             | HAST node/element/root types derive from Starry Night's supplied HAST API; recursive frame fallbacks, line/frame metadata, parser function, grammar singleton and Source frame-kind/truncation unions remain explicit. Starry Night 3.10.0 and its installed `@types/hast` 3.0.5 declare MIT. All these imports erase before runtime.                                                                        |
| `parseSource.ts`, `grammarCache.ts`                                                              | Typed shared global property, instance creation promise, grammar arrays, registration task/mutex and readiness slice. The facade still has only a dynamic runtime parser import; the engine remains deferred.                                                                                                                                                                                                |
| `grammarMaps.ts`, `grammarLoaders.ts`, `grammars.ts`, `languageCapabilities.ts`                  | Unknown map keys return `undefined`; supplied `Grammar` types describe real dynamic/static payloads; Source language capability branches stay unchanged. JSON payload stays absent and unsupported; Svelte grammar and local Vite WASM remain unchanged.                                                                                                                                                     |
| `plainText.ts`, `addLineGutters.ts`, `createFrame.ts`, `isFrameSpan.ts`, `getHastTextContent.ts` | Actual HAST trees, frame/line metadata, class arrays, recursive/shallow text and native parser result APIs. One documented cast acknowledges generic HAST Root can contain a document doctype while this real highlighting/plain-text pipeline emits only element/text children for line spans.                                                                                                              |
| `extendSyntaxTokens.ts`                                                                          | Every helper parameter/return is typed, including the discriminated string/expression template stack, brace depth, children/target arrays and span mutation. All scanning, enhancement and structural branches remain Source bodies.                                                                                                                                                                         |
| `search/engine.ts`, `search/types.ts`, `sitemap.ts`, `searchUtils.ts`                            | Real sitemap/page/section/API shapes, discriminated page/part/export/section/subsection results, literal Orama schema, supplied `Result`/`Orama`/search options, grouped elapsed/count state, flatten/format/slug callbacks and cache fields. The dummy document still omits `types`; actual declaration metadata still provides it. Source boosts/ranking/grouping/URLs and native lifecycle are unchanged. |
| `CodeContent.svelte`, `NativeSearch.svelte`                                                      | Native snippets/rendering/effect cleanup and dialog/query/timer/focus ownership stay unchanged. Import paths select the typed source; shared real result types replace the earlier partial inline result shape.                                                                                                                                                                                              |
| `test/highlight.test.ts`, `test/search.test.ts`                                                  | Node 24 native type erasure runs actual typed source, actual Starry Night filesystem WASM and actual Orama/QPS. A narrow docs-relative `.js` to `.ts` resolver preserves canonical bundler import spelling. The source WASM URL packaging hook is unchanged; all four tests and their behavior assertions remain, with an additional real frame/fallback existence assertion.                                |

There are no maintained `.js`/`.mjs` files in `apps/docs/src`, `apps/docs/test` or
the docs app configuration. The evidence checker remains portable `.mjs`, like
the existing root API extraction/SSR/build tools and `scripts/tests/docs.test.mjs`.
No new dependency or version change was needed. This correction does not claim
the incomplete docs widgets, inherited Collapsible audit or exact visual parity.
Focused checks executed: docs and fixtures type checks each zero errors/warnings,
docs ESLint clean, parser 3/3 and actual QPS query 1/1, canonical metadata/API
checks 3/3, and runtime AST equivalence 13/13. Development port5178 remains live.
The capped 2 GiB static build now passes: 19 authored docs pages, 125 distinct
local HTML href/src targets with real fragment IDs, one 473151-byte local WASM,
and 22 live HTTP probes. Source/copied/build/HTTP notice bytes match exactly.
`receipts/docs/typescript-build-validation.json` and its actual compressed build
log record that execution. Hosted three browser witnesses and independent
final-head review still need refresh before acceptance.

## Clean standalone startup repair

The actual hosted frozen `fd4928c` run37362408379/job111939919714 failed all three
browser tests. Vite reported `[TSCONFIG_ERROR]` for the missing generated fixture
`../fixtures/.svelte-kit/tsconfig.json`; Show code/Search/Navigation clicks never
reached the expected interactive controls. This failure is retained in
`receipts/docs/clean-startup-validation.json`, including exact decoded log and
artifact hashes. It is no browser acceptance credit, and the observed startup
error does not by itself attribute every failed interaction.

An isolated clean archive of the typed source, with no generated fixture config,
reproduced that same actual Vite 8 scan error. The docs-owned Vite configuration
now invokes the installed fixture Kit 2 `svelte-kit.js sync` before dependency
scan, because the canonical imported authored TypeScript retains that real
nearest tsconfig. No source data copy, fake generated config, dependency scan
disablement or canonical fixture/library runtime change was introduced.
A second isolated cold start with the fixture generated config initially absent
and a separate Vite cache generated the real prerequisite and returned HTTP200
for the docs route, actual NativeSearch module and actual authored metadata.
The source config, cold log and observations are recorded in the new receipt.
The original three browser assertions and focused modifier/IME/existence probes
remain unchanged; fresh secured hosted execution remains pending.

The original development process stopped between the pre-build and post-build
availability checks. Both Root and the docs developer found its terminal session
unavailable, so its cause is undiagnosed. The authorized live development service
was restored at port5178 (session52036, PID1168484) and returns HTTP200. That
availability observation is separate from browser interaction acceptance.

## Current native-main integration

The preceding sections are historical checkpoints at their named heads; their
execution counts and pending dispositions are retained. The current successor
normally integrates actual main `aa4daff54ec82b96e34e1601648d1b3926ef08cf`.
No shared library business owner is edited. Current public native snippets,
CSS-string style types and package tooling replace the retired UseRender API;
the authored native-rendering page survives and UseRender is removed from the
current navigation. There are now 18 authored documentation pages.

DemoCodeBlock retains the exact pinned threshold, Root/Viewport/Panel composition,
keepMounted/hidden=false, two-axis scrollbar branches and Trigger ownership.
The Original closed branch removes merged overflow through a native Viewport
render snippet and ordinary `style:overflow`, with supplied attachments spread
onto the actual div. Closed markup removes overflow; open markup uses the shared
Viewport's scroll value. This is a native style substitution, not an object-style
adapter, snapshot/replay engine or new unchanged assertion credit.

Exact pinned Demo.tsx captures the trigger before its layout commit. The predecessor
native close callback instead reread the bindable ref after tick, allowing native
same-click teardown to clear it. The successor captures the same host before tick
and retains the Source before/after measurement, delta and offscreen scroll branch.
The exact-function synthetic ownership reproduction and actual mounted native
regression retain their red receipts beside the green successor. The mounted test
also asserts two measurements of that actual captured host after its Demo unmounts.
This is a fidelity repair; the tick/lifecycle representation remains native and all
supplements earn zero unchanged upstream assertion credit.

The [current import/hash graph](receipts/docs/current-source-closure.json) records
actual local source owners, runtime/type-only edges and external boundaries,
including the used canonical Dialog, ScrollArea, Collapsible, Floating and Utils
owners outside this PR's diff. Historical module counts and retired renderer paths
are not current closure counts. The published parser/helper authority remains the
exact `@mui/internal-docs-infra@0.12.1-canary.42` archive; 12 typed runtime bodies
remain unchanged after type erasure; the engine matches one precise, whole-file
expected class-ownership transform of the frozen Source-derived body.
Formatter-only changes are required by main's standards. The predecessor manifest
is archived; the current checker updates actual hashes without changing Original
source hashes or algorithm comparison. Its emitted canonical JSON is checked by
the generator, rather than reformatted by Prettier.

The dedicated HTTP browser witness now also checks server-rendered Demo host reuse
through hydration, actual installed-export Dialog interaction and the closed/open
native overflow branch. Browser installation in this host failed with a truncated
official Chromium archive. No sandbox was disabled; local browser gates remain
unexecuted and require secured hosted evidence. Static/type/DOM checks do not grant
browser acceptance. Final source review, consumers and hosted exact-head CI remain
separate gates; their actual disposition belongs in the final PR handoff.

SourceFull Autocomplete selection, Drawer gestures, Tooltip/detached handle, full
API formatter, code emphasis/focus/variants, JSON grammar and exact licensed visual
fidelity remain incomplete. No deployment, publishing, release or project Page edit
is part of this successor.

SearchEngine is now the actual reusable class owner required by current repository
native guidance. Instance fields own the existing index/defaultResults/results and
ready promise; bound search/buildResultUrl callbacks retain the original complete
option, creation, dummy document, flattening, insertion, ranking, grouping and URL
bodies. NativeSearch constructs this owner lazily and preserves failed-owner retry,
query identity, pending suppression and native timer/teardown cancellation. No React
state/lifecycle model or duplicate algorithm was added. The full previous source,
callers, checker and 13/13 manifest are preserved in
[search-class-predecessor.json](receipts/docs/search-class-predecessor.json).
The maintained audit verifies the exact frozen engine hash before applying an
explicit, occurrence-counted class substitution, then compares complete erased
ASTs. It never generally ignores class, initialization, fields or method bodies.
Separate constructor/default-state/ranking mutation probes are rejected; this
structural evidence earns zero unchanged upstream assertion credit for the native
owner substitution and does not replace independent review or runtime gates.

The lead's strict declaration gate exposed inherited skipLibCheck bypasses in the
docs app, Collapsible installed consumer and private useClick installed diagnostic.
Those scoped configurations now explicitly check declarations; meaningful native
negative type assertions remain enabled. New strict diagnostics are preserved
rather than waived. Actual graph reach includes useButton through Dialog.Trigger
and Close, and useTransitionStatus through Dialog.Popup/popups; these canonical
owners remain separate dependencies. The graph does not reach useFieldValidation
or Field, and this PR does not duplicate that owner's bodies.

Current main still represents the reached reusable useButton/useTransitionStatus
owners as stateful factories. The separately assigned canonical Button/Transition
owner must close that representation dependency; this docs PR does not duplicate
their bodies. Scoped docs fidelity clearance does not imply entire-closure native
maintainability acceptance while that dependency remains outstanding.

The historical sitemap red log remains at its original
[source-sitemap-gap-reproduction.log](receipts/docs/source-sitemap-gap-reproduction.log)
path with all 7,844 bytes unchanged. Its
[additive gzip copy](receipts/docs/source-sitemap-gap-reproduction.log.gz) decompresses
to identical bytes; [hashes and immutable Git blob provenance](receipts/docs/source-sitemap-gap-retained-bytes.json)
verify both. An exact-path `whitespace=-blank-at-eol` attribute preserves the
historical line 3 terminal spaces; all other whitespace checks remain enabled.
This receipt disposition changes no Source, runtime, CI or parity claim.
Hosted docs install and launch now share explicit PLAYWRIGHT_BROWSERS_PATH under
`/tmp/sveltery-docs-playwright`, independent of toolchain XDG_CACHE_HOME; the official browser, sandbox,
one worker and zero retries are retained. This harness correction grants zero
executed browser assertions until the final-head hosted run reports them.

At the `cac2839f` predecessor, the actual import graph reached the canonical
`internals/nativeProps.ts` empty-style transport defect owned by PR73. The normal
integration of actual main `abe8aa9b66ab8cd8d83dfdac28ebee94a0655f79` now consumes
PR73's delivered string-before-falsy-guard repair and its shared lossless graph
storage producer/readers. No docs helper body or per-part workaround is added.
The actual docs closure remains 250 modules, 725 edges and zero unresolved edges;
before the authored-copy corrections, only that helper hash changed. The
current projection also refreshes the corrected authored content hash. Main's
private Select leaves are not forward
invocations from the docs closure. This integration does not claim post-merge main
verification, whole Select/runtime acceptance or final docs acceptance. The
reached Button/Transition class prerequisite and fresh exact-public-head independent
Source/native/maintainability, secured browser and CI gates remain required.

The published `71d52131` docs workflow failed before job creation: run
[37548813180](https://github.com/sveltery/base/actions/runs/37548813180) returned
zero jobs and zero check runs. Its job-level environment used `runner.temp`, which
GitHub's [context availability table](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#context-availability)
does not permit at `jobs.<job_id>.env`. This corroborates an unsupported-context
cause, but no actual failure annotation was retrieved, so causality remains an
inference. The focused successor uses the same literal `/tmp/sveltery-docs-playwright`
cache for official installation and both launchers. No assertion or gate changes;
the original failed run and all receipt bytes remain retained. See the
[zero-job record](receipts/docs/workflow-job-env-context-predecessor.json).
Local execution was disconnected; this successor has remote byte/delta review,
not a claimed local YAML, browser or consumer pass. Fresh hosted checks are required.

The integration Standards check found only formatting in the hosted zero-job
JSON receipt. Its exact `cac2839f` bytes are retained in an additive gzip
[predecessor archive](receipts/docs/workflow-job-env-context-predecessor-cac2839f.json.gz)
with [hash provenance](receipts/docs/workflow-job-env-format-predecessor.json);
current JSON formatting changes no parsed observation or execution credit.

Fresh integration read-only review distinguishes genuine forward calls from
conservative barrel/type/reverse fanout. Demo's Collapsible.Trigger still invokes
`button/props.ts:getButtonProps`, while Dialog invokes canonical `useButton`;
this inherited parallel button business needs the canonical owner's disposition.
Dialog also invokes retained `useClick`, popup handle/registration/open-sync and
Floating focus-resource owners. Their Source/native class and shared-reuse
acceptance belongs to the assigned canonical Floating/Popup owners, alongside
Button/Transition. This docs integration does not copy or repair those bodies,
claim every canonical owner integrated, or convert type/barrel reachability into
runtime invocation or acceptance. Fresh exact-head entire-closure review remains
incomplete until those genuine reached dependencies receive disposition.

Independent review also found stale authored compatibility/credits prose and an
obsolete object-style ScrollArea example. Current copy names all nine Dialog
parts plus Handle/createHandle, keeps feature acceptance separate from API
presence, accurately credits retained upstream shell/CSS/helpers and uses native
CSS strings. The exact previous authored content and pre-content closure are
[retained losslessly](receipts/docs/pr71-main-integration-content-predecessor.json).
These corrections change no library business body or Original assertion and earn
zero unchanged upstream credit; docs checks and actual route validation are
rerun for the resulting content.

Entire-candidate independent examination also confirms Demo reaches
`collapsible/animations.ts:afterAnimations`, retaining a private completion/frame/
replacement-observer business algorithm alongside canonical `useAnimationsFinished`.
Canonical reuse disposition is required, just as for Collapsible's legacy button
helper; this docs PR does not replace either body. Historical inherited mapping
rows describing omitted Store.observe, popup open/deferral/open-method helpers or
merged-ref transport are not current acceptance evidence: those Source business
helpers exist today, while actual hosts use native bindings/attachments. Current
feature-owner correspondence and class/shared-reuse acceptance remain dependencies.
