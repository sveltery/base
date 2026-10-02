# Collapsible compatibility record

Source: pinned Root/useCollapsibleRoot, Trigger, Panel/useCollapsiblePanel and private transition/animation behavior in [upstream-inventory.json](upstream-inventory.json), immutable Base UI v1.8.0 commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. Proposed implementation: [PR #29](https://github.com/sveltery/base/pull/29). No landed status is claimed here.

## C-01: framework substitutions

React context, rendered closures/layout effects, className/CSS objects, render/children, forwarded refs and synthetic events are expressed with initialization context, Svelte runes/pre-effects, class/CSS strings, snippets, bindings/attachments and native events. Accepted baseline is limited to the five substitutions recorded in T-01, plus initially undefined refs in A-01. Ordinary names, defaults and semantics remain the reference. The private lifecycle retains idle and starting-style waiting instead of reusing incomplete Dialog/Toast helpers. Callback/open snapshots refresh after commit; controlled mode and default are fixed at initialization. Observable evidence is in component-local DOM/SSR/types and paired browser candidates. React namespace type aliases are represented as named exported props/state/reason/detail types with Svelte ComponentProps equality. The ten adapted assertions are separate type evidence; namespace type identity and complete conformance are not claimed. Partial conformance evidence covers actual host props/ref/composition and native defaults through supplemental tests; the three shared conformance invocations remain unported as helper suites. These adaptations create no additional ordinary declaration sites. Specific acceptance of other timing or API substitutions is not recorded.

## C-02: inherited disabled mouse default

The unchanged Button helper inherits D-03: local disabled mousedown prevents native default focus, while the pin suppresses the callback without canceling that default. This earns no ordinary declaration credit. Rationale and trusted paired evidence belong to central [D-03](../../docs/upstream-differences.md#d-03-disabled-chorded-mousedown-default-focus); specific deviation acceptance is unrecorded. The Collapsible slice introduces no shared helper change.

## C-03: explicitly unimplemented Activity scope

Panel ordinary declarations 869/932/1003/1063/1130/1413 require external React.Activity retaining state while disconnecting effects. No equivalent API exists in this slice. They remain deferred and uncredited. Four guarded beforematch cases 1205/1287/1349/1474 are independent of Activity and are in portable scope. CSS hide/remount probes do not satisfy the deferred contract.

## Shared upstream quirks awaiting reproduction

Authored alignment `!important` priority restoration and replacement-host beforematch listener ownership are unverified at this documentation checkpoint. Preserve the pinned source behavior first; paired exact-pin browser reproduction must distinguish an observed shared bug from an intentional local difference. No correction, issue confirmation or parity credit is claimed without that reproduction. Parent browser owner will replace this pending record with source and run evidence if a quirk is verified.

The paired stale-completion fixtures adapt React post-DOM layout effects to Svelte pre effects so animation resolution precedes observer cleanup. Private lifecycle cancellation uses native AbortController signals, allowing the same source abort stub to leave watched continuations active. This test scheduling substitution remains distinct from observed browser parity and earns no extra declarations. Component-local per-property style preservation emulates React style diffing while Element retains CSS strings for snippets; host replacement remeasures and cancels observations for the replaced host, a bounded framework ownership adaptation whose native characterization is still pending.
