# Native API representation and current evidence

The [9ed64b87 packed strict-type red receipt](strict-types-predecessor/receipt.json) preserves the complete negative type preimage and four actual errors. Mandatory formatting moved style/event diagnostics to property lines; the successor places both existing `@ts-expect-error` comments on those exact property lines. Their native negative contracts and all runtime bodies remain unchanged. Corrected execution, exact-head review and CI are separate gates.

## Current native successor

The historical table below describes the c160/7448 checkpoint. Current integration follows accepted main's direct native branch directive: ListboxSeparator renders `render(mergedProps, state, children)` or its own div. It reuses unchanged `mergeComponentProps` and shared prop/state/class/style bodies. Native attachment publication sets the actual bindable ref through `untrack` at the imperative boundary; captured-host cleanup clears only its own current ref. Consumer attachments retain independent Svelte lifetimes. No generic renderer or React ref fanout remains in this closure.

Public `style` is Svelte's native string attribute or a callback returning it; old record-style fixture inputs migrate to strings. Horizontal/presentation defaults, later consumer overrides and omission of ordinary Separator ARIA stay literal. Label tokens retain native authored Snippets/scalars and ordered comma-space separators. Native snippet/ref/style/false-text behavior grants zero unchanged upstream renderer credit. Existing scalar dirty/nullish/signed-zero/grouping/label branches remain unchanged business, including source malformed-entry failure.

The [16-module current graph](current-main-native-graph.json), [receipt](current-main-read-receipt.json) and [correspondence](current-main-correspondence.md) supersede renderer/count claims below without altering historical originals. Proposed PR73 remains private prerequisite preparation. Actual Select consumers, complete Select behavior, final exact-head independent acceptance and CI are explicitly incomplete until executed evidence and lead disposition are recorded.

Original: immutable MIT Base UI 1.8.0
`47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`;
`internals/itemEquality.ts`, `internals/resolveValueLabel.tsx`,
`utils/listbox-separator/ListboxSeparator.tsx`.

| Boundary | Original behavior | Native behavior and decision | Evidence / remaining acceptance |
| --- | --- | --- | --- |
| Native value labels | ReactNode label; multiple labels are keyed React Fragment entries separated by `', '`. | `ValueLabel` is scalar or authored Svelte Snippet. Multiple labels are ordered scalar/Snippet values and separator tokens; eventual callers render these using native markup/snippets. No authored Snippet is stringified. Broad React elements/arrays/promises use an authored Snippet instead. Root approved this precise design; user native-Svelte directive applies. | Identity/order helper supplement and literal Svelte DOM/SSR comparators pass. Native `false` text renders `false`, matching literal Svelte; no React false/null text kernel. Zero unchanged renderer credit. Actual production Select.Value integration is missing. |
| Internal ListboxSeparator renderer | React forwardRef, className, React children/render elements, native div role presentation and horizontal orientation default. | Native `$props`, `$derived`, `class`, scalar/record CSS style, children/render Snippets and bindable actual HTMLElement ref reuse accepted canonical RenderElement. Consumer native props remain later than role defaults. It does not add ordinary Separator's ARIA orientation. Root approved the direct-renderer design and existing native directive/accepted five substitutions apply. | Four new DOM and two SSR supplements pass. Strict native component props pass positive orientation/state/event/render/ref and negative orientation/style-state/children/event checks. No Original ListboxSeparator ordinary test exists. Browser/installed private consumer/current full closure independent review remain pending. |
| Source business quirks | Scalar dirty uses `!==`; nullish compare bypasses custom comparer; default matcher uses Object.is identity and signed-zero guard; first-item grouping, inherited `'null' in` versus own-map lookup; primitive array search does not guard holes. | Literal Source business is retained. No new owner/cache/renderer business or Source bug fix. | 33 copied Original helper executions and seven supplements pass. Source archives and body hashes are immutable. This does not alter Select's historical inventory or ordinary-zero accounting. |

The private component types preserve accepted canonical Svelte ClassValue. An
attempted negative assertion for a class callback with another state shape did
not fail TypeScript: native ClassValue's broad object representation admits that
function. The first focused strict run reported an **unused `@ts-expect-error`**
at `tests/select-canonical-leaves.types.ts:22`. That failed diagnostic is
preserved in [validation](validation.json). The invalid assertion was removed;
the real negative style-state contract is checked instead. Shared canonical
types remain unchanged. This is an observed inherited type boundary, not a
Source-ported assertion or a fixed product defect.

The branch is a temporarily unconsumed prerequisite. Design/implementation
authorization is recorded, final independent Source/native/maintainability
review, installed package acceptance, required CI and PM merge approval are
not yet recorded. PR70's complete Select work remains separate and frozen.

## Measured empty native style boundary (authorized repair, acceptance pending)

The [bounded witness](empty-style-witness/receipt.json) measures exact public head `74c437a9a337a26fd808f44f6fa36f7d7542385b`, integrated main `aa4daff5`, immutable Original pin `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, Svelte 5.57.1 and React 19.2.8. In jsdom, public ListboxSeparator `style:''` omits the style attribute, whereas literal, dynamic and spread Svelte controls retain `style=""` and match `[style]`. SSR Listbox omits it; literal and spread Svelte controls retain it, while Svelte's dynamic attribute compiler omits it. Undefined and nonempty string controls distinguish this empty boundary.

The inherited unchanged shared `internals/nativeProps.ts:10` normalizes falsy values before string handling; `mergeNativeStyles` and `mergeComponentProps` carry that result to Listbox's spread. Executing the complete archived Original Listbox/style closure shows that valid empty CSS object `{}` omits the attribute in SSR/client; out-of-contract Original empty string also omits it. The native public string API therefore exposes a measurable difference from Svelte's corresponding spread default, rather than a repaired Original business bug. General string-style substitution and preserved serializer history do not establish a specific empty-string normalization decision. Lead explicitly identified this native-default discrepancy as a blocker and authorized PR73 sole canonical ownership of the narrow repair. The successor moves the existing string return before the existing falsy guard, preserving all non-string handling and shared reuse. The [successor receipt](empty-style-successor/receipt.json) records actual SSR and jsdom runs: empty Listbox style now preserves the attribute and `[style]`, matching the bare spread; undefined and nonempty strings retain their earlier observations. Complete predecessor helper/projections and Original/native measurements remain immutable. This is a native representation repair, with final exact-head independent/configured review and all mandatory hosted gates pending. These SSR/jsdom observations supply zero unchanged Original credit and no secured-browser result.
