# Accordion compatibility record

Reference: immutable Base UI v1.8.0 `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, with source hashes in [upstream-inventory.json](upstream-inventory.json). Proposed PR: this feature branch; no PR number or landed decision is recorded yet. Passing a check or landing code does not approve a behavioral difference.

## A-01: accepted framework baseline

React className/CSS objects, children/render elements, forwarded refs and synthetic events become Svelte class/CSS strings, snippets, bindings/attachments and native events. These are the five accepted substitutions recorded in central T-01; initially undefined refs follow central A-01. Ordinary prop names, defaults and semantics remain pinned. Stable context facades, runes/pre-effects, committed callback snapshots, DOM-order registration and generated ID bytes adapt framework ownership. ID relationships and registration cleanup remain contractual. These implementation mechanisms are bounded adaptations, with no additional acceptance inferred for changed observable timing.

Root retains generic value inference and the pin's permissive default any. Named generic props/state/value and non-generic part/change types replace React namespace aliases. Seven source generic assertions and one expected error are separately mapped; supplemental exact root/subpath identity and Svelte component typing checks add no type assertion or ordinary declaration credit. Complete shared conformance is not claimed. Evidence is pending until the relevant check executes, as recorded in [verification](verification.md).

## A-02: inherited Button D-03

The unchanged Button helper cancels disabled mousedown default focus, while the pin suppresses the callback without canceling that default. The rationale and trusted paired witness belong to central [D-03](../../docs/upstream-differences.md#d-03-disabled-chorded-mousedown-default-focus). Specific deviation approval is unrecorded. No helper correction is introduced here and this difference earns no Accordion parity credit.

## A-03: deferred Activity contract

Panel:201 depends on React.Activity retaining state while suspending effects. This slice has no equivalent API. The declaration remains unimplemented and uncredited; hiding/remounting cannot replace it. Other ordinary assertions remain in portable scope. No actions, completion callback or keyboard roving API is invented.

## Preserved source behavior and exact applicability

Item callbacks precede Root callbacks, share details and stop the request when canceled. Root single mode compares value[0]; multiple mode appends or filters by strict equality. Item/Trigger disabled combine with ancestor disabled using logical OR. Deprecated orientation is state only; orientation/loopFocus do not affect keyboard focus behavior. Registration indexes follow DOM order. These are fidelity requirements, not deviations.

The Panel uses the pinned Collapsible measurement/beforematch/transition algorithms. Existing shared source reproducers are tracked in [#30](https://github.com/sveltery/base/issues/30) (alignment value restored without !important priority), [#31](https://github.com/sveltery/base/issues/31) (beforematch retained on the original replacement host), [#33](https://github.com/sveltery/base/issues/33) (idle retained after no-motion close) and [#34](https://github.com/sveltery/base/issues/34) (ending retained after a rendered host disappears). Their existing actual React/Svelte and secured Collapsible evidence is linked in [Collapsible compatibility](../collapsible/compatibility.md). It is not Accordion execution credit. The source mechanisms are preserved; Accordion-specific witnesses require their own recorded execution.

Accordion Panel exposes transitionStatus and can inherit #33. Accordion Root/Item/Header/Trigger state does not expose transitionStatus. Therefore #34's Collapsible public Root/Trigger ending-state claims do not directly apply; only the shared private lifecycle/Panel render state is relevant here. No blanket claim of Accordion ending attributes on those parts is made. Any intentional correction of these shared behaviors remains deferred to a separate decision.
