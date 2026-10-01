# Upstream differences

Behavior reference: [Base UI v1.8.0](upstream-contracts.md), immutable commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. This register records verified landed differences present on Base main `4dd04e495fc9f5bb6a0bb872fe103563d49535b1`. Landed does not establish a specific acceptance decision. The cited evidence does not record specific user approval of these deviations. Divergent assertions earn no parity credit; complete Dialog, Button and whole-library parity remain unclaimed.

## D-01: request-local close deferral

Source: pinned [DialogStore.setOpen](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/dialog/store/DialogStore.ts). React's `preventUnmountOnClose()` sets retained store state before checking cancellation. In the canceled and controlled-close fixtures, a canceled deferred close leaves that flag active: a later accepted ordinary close remains mounted until imperative `unmount()`.

Svelte isolates the deferral decision per request and commits it only after cancellation is checked; retained callback details cannot mutate later requests. A later ordinary close unmounts normally, while an accepted deferred close still waits for imperative unmount. Rationale: avoid one canceled request poisoning later lifecycle work. This is an intentional correction of behavior reproduced in React, rather than a fidelity repair.

Landed in [PR #13](https://github.com/sveltery/base/pull/13), merge `08d2790571eb54440b9e61d13917bc433aa92de8`. Evidence: paired `cancel`/`controlled` and accepted-deferral tests in [dialog-regressions.spec.ts](../tests/browser/dialog-regressions.spec.ts), DOM/SSR regressions linked in that PR, [baseline run](https://github.com/sveltery/base/actions/runs/36872699239) and [passing implementation-head run](https://github.com/sveltery/base/actions/runs/36874113105) at `2446dec3089bfe1ed65f2afaab95aad7e4dd70cd`. Decision status: landed; specific deviation approval is not recorded in the cited evidence.

## D-02: nonmodal ShadowRoot Portal exit

Source: pinned [FloatingPortal focus guards](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/floating-ui-react/components/FloatingPortal.tsx). In the paired nonmodal ShadowRoot/slot fixtures, React's outside guard sees a retargeted host and loops focus back into the Popup. Reverse exit returns to its first control; forward exit returns to its last control and leaves the Dialog visible.

Svelte uses composed containment and explicit guard handoffs. Reverse Tab exits to the trigger while the Dialog stays open; forward Tab exits to the following control and dismisses on focus-out. keepMounted close/teardown restores slotted tab indices and removes guards. Rationale: allow logical nonmodal Portal exit across shadow retargeting. This corrected exit behavior differs from the pin; shadow traversal by itself is not a claim of complete shadow parity.

Landed in [PR #13](https://github.com/sveltery/base/pull/13), merge `08d2790571eb54440b9e61d13917bc433aa92de8`. Evidence: paired `shadow-entry`, `shadow-initial` and `shadow-keep` tests in [dialog-regressions.spec.ts](../tests/browser/dialog-regressions.spec.ts), [baseline run](https://github.com/sveltery/base/actions/runs/36872699239) and [passing implementation-head run](https://github.com/sveltery/base/actions/runs/36874113105). Decision status: landed; specific deviation approval is not recorded in the cited evidence.

## D-03: disabled chorded-mousedown default focus

Source: pinned [useButton.onMouseDown](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/internals/use-button/useButton.ts). It suppresses the disabled consumer callback without preventing the mousedown default. Trusted chorded input can deliver an additional left mousedown without a new pointerdown. In the custom-disabled and native-focusable-disabled fixtures, unchanged React gains default focus; Svelte prevents that default and keeps prior focus. Enabled defaults and consumer behavior remain covered.

Rationale: extend the existing disabled click/pointerdown default-cancellation intent to this mouse fallback. Landed in [PR #17](https://github.com/sveltery/base/pull/17), merge `4dd04e495fc9f5bb6a0bb872fe103563d49535b1`. Evidence: [button.spec.ts](../tests/browser/button.spec.ts) trusted chorded probes, [red run](https://github.com/sveltery/base/actions/runs/36913390083) and [green run](https://github.com/sveltery/base/actions/runs/36914270095) at `2cb6d94159e3346e5555fb3a41bbcf14b3e84b41`. This earns no parity credit and does not certify complete mouse fallback equivalence. Decision status: landed; specific deviation approval is not recorded in the cited evidence.

## Adaptations and incomplete scope

Framework/API substitutions remain documented in [pinned contracts](upstream-contracts.md), [Dialog slice](dialog-first-slice.md) and [Button adaptations](../parity/button/README.md): native events and prevention channels, string CSS, snippets/attachments, bindable refs and Svelte state/ID relationships. These are distinct from the behavioral corrections above.

[Toast core's existing adaptations and pending compatibility](../parity/toast/core-interface.md) remain their own evidence record. Toast rendering/lifecycle classification is evolving in [PR #16](https://github.com/sveltery/base/pull/16); this register does not reclassify that work. The existing [SSR issue #18](https://github.com/sveltery/base/issues/18) tracks its own scope.

PR #13's disabled Close-anchor default prevention and [PR #15](https://github.com/sveltery/base/pull/15)'s native tabbable repairs restore observed upstream behavior. They are fidelity repairs, not additional upstream differences. Unimplemented contracts remain visible in the [parity inventory](../parity/README.md) and feature docs. Future shared bugs belong in this repository's issues before separate correction work; already-fixed entries above do not require duplicate issues.
