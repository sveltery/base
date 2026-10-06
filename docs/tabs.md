# Tabs

The five Source parts are available through `Tabs` from the package root or `@sveltery/base/tabs`: Root, List, Tab, Panel and Indicator. Individual Source names such as `TabsRoot` and every public state/props/value/change-event type are exported too. This is a source-first port under verification, not a claim of complete assertion parity or final acceptance.

```svelte
<script>
  import { Tabs } from '@sveltery/base/tabs';
</script>

<Tabs.Root defaultValue="overview">
  <Tabs.List aria-label="Project details">
    <Tabs.Tab value="overview">Overview</Tabs.Tab>
    <Tabs.Tab value="history">History</Tabs.Tab>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Panel value="overview">Project overview</Tabs.Panel>
  <Tabs.Panel value="history">Project history</Tabs.Panel>
</Tabs.Root>
```

Root defaults to value `0`. A defined `value` controls selection; `null` selects no tab. List defaults to manual activation: arrows move focus, Enter/Space select. `activateOnFocus` selects during eligible focus, and `loopFocus={false}` stops focus at either end. Disabled tabs remain focusable through navigation, but do not activate. An explicit disabled default is honored; an implicit uncontrolled default skips disabled or missing selections. Uncontrolled automatic changes report `initial`, `disabled` or `missing`, cannot be canceled, and reset activation direction to `none`. User changes report `none` and can be canceled through event details.

Panels mount while active and through exit animations; `keepMounted` retains hidden inactive content with native inert semantics. Actual mounted panel registration supplies tab controls IDs; corresponding tab metadata supplies panel labels. Generated IDs keep the Source `base-ui-` namespace around Svelte's native `$props.id()` stable SSR/hydration suffix. Tab IDs accept native HTML `null`, which falls back to the same generated ID; authored strings and empty strings retain precedence and update panel labels reactively. Class functions, native CSS-string style functions, direct per-part render snippets and actual element bindings/attachments use canonical shared business helpers.

Indicator exposes the six `--active-tab-*` CSS variables for active tab dimensions and offsets. Its Source geometry accounts for scale, rotation/flip distortion, border/scroll offsets, nested scrollers, own tab translations and subpixel rounding. Resize observers track the List and actual Tab hosts, including render-host replacement. Position/size state is null when a non-null selected value has no matching tab; a null selected value omits Indicator.

`renderBeforeHydration` emits the exact pinned Source script and consumes the real CSPProvider nonce. The canonical native wrapper uses a trusted full raw script tag so Svelte's markers remain outside its body. SSR's HTML parser executes it; fresh native client insertion is inert; native mounting removes it. SSR/client payload identity keeps Svelte's hydration hash consistent. This narrow renderer boundary follows the user's native-Svelte directive and earns zero unchanged renderer assertion credit. The wrapper and hydration helper are Tabs-owned canonical deliveries absent from actual main; their earlier public Slider development provenance remains historical.

[Actual Source correspondence](../parity/tabs/actual-source-correspondence.md), [actual runtime/type closure](../parity/tabs/actual-local-graph.json), [historical pre-code plan](../parity/tabs/source-correspondence.md), [all-part public inventory](../parity/tabs/public-inventory.json), [typed API snapshot](../parity/tabs/api.json) and [test provenance](../parity/tabs/original-assertions.json) retain distinct evidence. Library build, local type/SSR/DOM checks, official secured browser/CSP/hydration/geometry execution, strict isolated packed consumers, full Standards/Verification, independent exact-head source/native/maintainability review and PM acceptance are recorded separately. Source business bugs remain preserved and require reproducible issue tracking; native framework differences require actual paired evidence. The selected shared animation helpers reuse exact public Dialogad19 development bytes: Source individual flush and batch queue/abort order use native Svelte flushSync. Actual-main dependency integration, affected lifecycle probes and final independent approval remain pending. No final acceptance is recorded here.

Historical normally merged main74 added the canonical shared event/platform closure through Composite navigation. That historical Tabs graph had80 modules/220 runtime/type edges; whole resulting-head review and gates remain pending. The historical3d459 Source review remains NOT CLEAR for the internal nullable-ID caller check, now repaired by normalizing only the caller. Public native HTML id types and the one shared helper are unchanged. The verified Source Panel quirk is also preserved: authored Panel IDs, including explicit undefined, may override the DOM ID while registration still supplies the generated controls ID.

## Historical accepted-main integration checkpoint

Tabs normally integrates accepted main `95d3d2ae473dc18a2b9a48112284383a2c392315`, retaining Button, ToggleGroup/Toolbar and Avatar histories and exports. All80 used runtime/type bodies,220 imports, imported members/kinds and reachability remain identical to independent Source/native/maintainability CLEAR checkpoint `05f5aa93af0ff8c7af964a69bd64fba86b191637`. That carries precise body-specific assessments only; resulting-head independent review, actual package/export/public seam checks, secured browser, Standards/Verification and PM approval remain separate gates. No new or changed used body is hidden by the merge.

The single canonical animation pair is now exact accepted Avatar/main bytes: useAnimationsFinished SHA256 `0ae8873174969326a7ac09377ab019af5cd575bbdfde7df9118317d0ec1c1e30` and useOpenChangeComplete SHA256 `5e966dd1b10cbc1ed448d3583ca948a384d812f9e71afc1e128395485575931f`. No whole Dialog/Menu or private useClick prerequisite is introduced: actual local runtime/type reachability never imports useClick; only the broad immutable Original floating barrel exports that unselected helper.

The authored/explicit-undefined Panel association business quirk remains preserved. No public Tabs issue exists: automatic approval review rejected issue publication, and the explicit user issue question is pending. The current reviewable issue material is `/workspace/sveltery-pm-evidence/tabs-panel-id-issue-ready.md`, backed by the tracked `packages/base/tests/dom/tabs-id-association.test.ts` and `TabsIdAssociationFixture.svelte`; the older unpublished proposal's obsolete paths remain historical. All ordinary declaration credit remains zero.

Current issue-tracking correction (2026-10-06): the earlier unpublished/approval-blocked issue statements above describe their historical checkpoints. [Issue #80](https://github.com/sveltery/base/issues/80) now tracks the authored-string and explicit-undefined Panel DOM/registration ID mismatch, verified against immutable MIT Base UI 1.8.0 `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c` with the actual paired reproducer. Tabs preserves this shared Source business quirk; no local correction or unchanged ordinary assertion credit is claimed. Historical rejected-publication, failed review and red execution receipts remain intact.

## Current native-main successor (2026-10-06)

Tabs normally integrates actual main `aa4daff54ec82b96e34e1601648d1b3926ef08cf`. The current used runtime/type closure is **73 modules and 196 import edges**, recorded in [the actual graph](../parity/tabs/actual-local-graph.json). The earlier 80-module/220-edge unchanged-body record belongs to the historical `95d3d2ae473dc18a2b9a48112284383a2c392315` integration and `05f5aa93af0ff8c7af964a69bd64fba86b191637` review checkpoint; it does not describe or independently clear this native successor.

All five Tabs parts now use native Svelte runes/context and direct per-part snippets or intrinsic fallback markup. Root uses the canonical small `Controlled` owner with initial mode and live controlled reads. Direct `$effect` and captured actual attachment publication/cleanup replace React lifecycle/ref transport; shared business helpers reuse canonical main and `@sveltery/utils`. Native public styles are CSS strings, including state callbacks returning native style values. Source selection/fallback/cancellation, Panel registration and Indicator geometry remain the business contracts; no renderer or state-snapshot engine is introduced.

`PrehydrationScript` and `useIsHydrating` are Tabs-owned canonical helpers newly delivered by this PR and absent from that actual main. The public Slider development provenance above is historical reuse evidence, not a current Slider dependency or acceptance requirement. The wrapper retains immutable payload identity, real CSP nonce escaping, SSR parser execution, inert fresh native CSR insertion and native mount removal. [Issue #80](https://github.com/sveltery/base/issues/80) currently tracks the exact-pin-reproduced Panel ID association quirk, which remains preserved.

All ordinary assertion credit remains zero. Historical source/assertion provenance, failed reviews and red receipts remain intact. Exact final-head mandatory checks, packed strict types/SSR/hydration/consumer evidence, secured browser gates, hosted CI and fresh independent entire-closure source/native/maintainability review remain pending; this section records the successor scope and grants no acceptance.

### Shared Source dependency blocker

Current full-closure integration remains blocked by the shared visibility helper reached through `TabsList → CompositeRoot → useCompositeRoot → navigation.isListIndexDisabled → isElementVisible`. The current helper reads `ownerDocument.defaultView.getComputedStyle`; immutable MIT Base UI 1.8.0 `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c` uses the canonical `@floating-ui/utils/dom` window fallback. This shared Source finding affects initial/highlight fallback, map replacement, min/max selection and non-disabled keyboard navigation. [PR #42](https://github.com/sveltery/base/pull/42) is the sole owner of the shared correction; Tabs does not repair or duplicate that body here, and current main membership establishes no Source acceptance for it.

Final entire-closure review remains pending the corrected shared body and accepted-main successor. Hosted diagnostic validation continues under the user's explicit coordination instruction; execution receipts will record actual outcomes separately and cannot clear this Source blocker or grant acceptance. Ordinary assertion credit remains zero.

### Reached canonical owner seams and bounded execution

The preliminary whole-closure review is **SOURCE/NATIVE NOT CLEAR**: alongside the confirmed PR #42 visibility Source finding, Tabs actually reaches `TabsTab → useButton` and `TabsPanel → useTransitionStatus`. The existing canonical Button and Transition owners retain their class-representation handoffs under the native directive; these remain pending owner/lead acceptance. This records native dependency acceptance blockers, not additional confirmed Source business findings. Tabs makes no shared-helper fix here. The actual closure imports neither `useFieldValidation` nor `useFieldControl`; no Field dependency is claimed.

Bounded local receipts at candidate `753c` record focused DOM **4 files / 41 tests passing**, extra Utils **9 tests passing**, and scoped ESLint **41 files passing**. This documentation update leaves those runtime bodies unchanged. These receipts do not complete full Standards/Verification: the earlier full ESLint process was killed with exit 137, fixture verification exhausted the 1536 MiB limit, full DOM was interrupted with exit 130, and local secured Chrome failed. Earlier red receipts and source hashes remain intact. Hosted diagnostic validation continues; final hosted CI/browser gates, stable-head configured and independent full-closure review, corrected-main integration and canonical owner acceptance remain incomplete. Zero ordinary assertion credit and no final acceptance remain the status.
