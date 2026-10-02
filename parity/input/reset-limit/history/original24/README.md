# Imperative reset association diagnostic

This scratch diagnostic imports the actual frozen Input source, paired with a native Svelte input. It uses direct `input.setAttribute('form', ...)` inside an `onreset` callback or after `form.reset()` returns. It does not update a reactive `form` prop. No production files, CI assertions, native methods, event methods, or Field integration were changed. Exact checkpoint and file hashes are in `evidence.json`; all observations are in `results.json`, with the test output in `vitest.log`.

Twenty-two of twenty-four executions pass. The two failures are Input with stopped propagation, no cancellation, and direct reassociation during reset:

- Moving out: native reset does not apply; native retains `edit`, while rejected controlled Input should settle to `owner` but retains `edit`.
- Moving in: native reset applies `seed`; Input overwrites it with `owner`.

All native comparisons, canceled cases, normal propagation cases, and successful-reset-then-direct-reassociation cases pass. These are supplementary native characterizations with zero ordinary Input or Field declaration credit.

The existing reactive observer cannot run because the `form` prop is unchanged. The late reset bubble observer cannot run because `stopImmediatePropagation()` hides that phase. Capture sees membership before the imperative mutation. A final association check would fix moving in/out while regressing a completed reset followed by reassociation, whose correct native value remains `seed`.

The passive MutationObserver probe confirms that the stopped moving-out and completed-reset-then-move native cases both deliver the same `form` mutation (`imperative-first` to `imperative-second`) when the saved reset event is already in phase 0. Their DOM values differ, but inferring whether a reset applied by comparing value/defaultValue is explicitly excluded and is not an exact native reset notification.

Under these constraints, a reset event plus association observations does not expose the missing default-action boundary for this imperative, propagation-stopped callback. The supported reactive prop path supplies that boundary while the handler is executing. Available product decisions are to require reactive form reassociation for propagation-stopped handlers, or authorize a broader integration that reports the association synchronously during that callback. Both require an explicit scope decision; neither is silently approved by these scratch tests. Native API/event-method patching, value/defaultValue guessing, placeholder controls, and assertion relaxation are not proposed.

Hosted browser acceptance of this new scratch case has not been run. The proof uses actual Svelte 5.57.1 and jsdom 30.1.1 native reset behavior; no ordinary parity credit is claimed.
