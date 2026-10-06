# Native API representation and current evidence

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
