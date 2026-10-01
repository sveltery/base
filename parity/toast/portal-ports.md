# Standalone Toast.Portal

Authority: Base UI **1.8.0**, immutable commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. Derived code and assertions retain [MIT attribution](UPSTREAM_LICENSE). Starting main is `cdd1c4f3bef7d329b890de42c05aeb9d4402e656`, after Toast PR #16 and green post-merge [CI 36935149221](https://github.com/sveltery/base/actions/runs/36935149221).

This implements only standalone `Toast.Portal`, exported through both package entry points. It is a lightweight native div with empty state and native props, state class/style, replacement render and actual-element ref composition. It needs neither Toast.Provider nor Dialog.Root. Provider context survives portalling. It adds no Dialog backdrop, presence, focus manager, isolation owner or focus guards; existing Toast.Viewport guards remain its own behavior.

## Source and lifecycle

Inspected actual [ToastPortal.tsx](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/toast/portal/ToastPortal.tsx), [FloatingPortalLite.tsx](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/utils/FloatingPortalLite.tsx) and [useFloatingPortalNode in FloatingPortal.tsx](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/floating-ui-react/components/FloatingPortal.tsx). Toast delegates to Lite, which consumes inherited FloatingPortal context but does not provide it. Thus an inherited Dialog.Portal is the default parent, otherwise body; nesting another Toast.Portal alone does not change the fallback parent.

An explicit HTMLElement or ShadowRoot is a destination. Explicit `container=null` waits and removes existing content. A ref with `current=null` falls back to parent/body. The hook effect depends on container object identity and parent node, not mutable `ref.current`: mutating the same object and rerendering does not move the portal; replacing the object resolves it again. Resolving a new prop to the same destination preserves the wrapper/children. Changing the resolved destination remounts the portal subtree; null and unmount clean it up. Generated ID/data-base-ui-portal are ordinary merged props; an explicit ID overrides, and explicit undefined can remove the ID.

The Svelte implementation mounts the entire replacement subtree at that destination, then mounts children into its actual attached element, corresponding to the source's two createPortal calls. This preserves wrapped replacement structure and children even when the render snippet ignores its children argument. Live getters update native props, classes, styles, snippets and children without remounting the destination. Both mounts carry the original logical context; owned cleanup unmounts them and clears bindings/attachments. Effects never run during SSR, which emits neither wrapper nor children and accesses no document. Dialog.Portal is not aliased or changed.

## Applicable conformance assertions

[ToastPortal.test.tsx](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/toast/portal/ToastPortal.test.tsx) is a **conformance invocation**, not an ordinary leaf. Its options enable all four helpers, no skips, HTMLDivElement refs, div replacements, wrappingAllowed=true and button=false. [portal-ports.json](portal-ports.json) separately records nine full source-file hashes, fifteen helper callback hashes, source declaration/assertion lines, active guards and fixture scenarios. The immutable Toast source inventory and shared manifest are unchanged. This adds **zero ordinary declaration credit**; current shared totals remain 28 passing / 605 unported, Toast 13 complete / 183 unported.

The fifteen complete applicable helper cases cover six native/custom prop/style cases, one default ref case, seven render/ref/class cases and one string-class case. [Browser assertions](../../tests/browser/toast-portal.spec.ts) execute each against real pinned React and actual packaged Svelte. Framework adapters use snippets for function/element replacement variants; snippets spread provided props/attachments and use mergeProps for render-owned class/event composition. React's JSX class/ref merges are represented by explicit Svelte mergeProps, a bound ref and replacement-element binding. The full wrapper/element/value and both ref/class observations remain; no source assertion is intentionally weakened. RandomStringValue becomes a fixed nonempty opaque fixture value; source render/act/flushMicrotasks becomes browser polling for committed observations. Browser output exposes the actual current refs, avoiding stale captured callback values. These mounting/observation adapters earn no extra credit.

Supplements cover body, parent, element, ShadowRoot, explicit null versus null ref, identity-gated ref resolution, target remounts, prop/ID changes, cleanup, Provider context, independent nested Lite placement, replacement event composition, and Dialog modal coexistence. The body-sibling modal probe checks live-region exposure, existing isolation markers, focus trap/scroll ownership and restoration after Dialog closes while Toast remains. Parent probes check inheritance including null refs, no extra portal machinery, and teardown with Dialog. They do not redesign shared isolation or establish exhaustive accessibility/VoiceOver, dynamic isolation, cross-document or focus timing parity.

## Differences and incomplete scope

Only the five accepted framework substitutions apply: className→class; React render elements/functions→Svelte snippets; React refs→Svelte bindings/attachments; synthetic→native event props; CSS objects→CSS strings. Ordinary `container`, `id`, native props, defaults and semantics retain their names. State remains empty. Generated ID bytes follow Svelte's SSR-stable ID generator rather than React's bytes, within the existing framework ID relationship contract. The compatibility register [T-03](../../docs/upstream-differences.md#t-03-standalone-toast-portal-framework-substitutions) records this scope and its decision status. No intentional behavioral fix is introduced. Independent source review reproduced one local fidelity gap: an HTMLElement with a custom current property was misclassified as a ref. A failing DOM regression and paired element-current probe now cover it; owner-document Node recognition restores pinned isNode behavior. This is a fidelity repair, not a shared upstream defect or intentional difference.

This is a prerequisite, not a pinned shadcn Base Toaster implementation. Swipe/default gesture behavior, anchored Positioner/Arrow geometry, remaining Toast parts' replacement rendering and complete Toast/native accessibility conformance remain incomplete. Deferred issues [#18](https://github.com/sveltery/base/issues/18), [#19](https://github.com/sveltery/base/issues/19) and [#21](https://github.com/sveltery/base/issues/21) remain unchanged. Existing Dialog/Button/Toast behavior is retained.

## Execution

Tests-first commits `60098dd` / `369b233` precede implementation; the SSR export assertion failed with undefined Portal before the export existed. Six focused DOM supplements and one SSR case pass locally. Existing package-consumer checks now exercise root/subpath Portal identity and SSR omission. Local system Chromium aborts before component interaction with an unconfigured SUID sandbox helper. That startup failure is not passing browser evidence; no sandbox or system policy was changed. Secured browser evidence and final-head review remain pending until recorded in the PR and ledger.

Reproduction uses the frozen repository toolchain:

```sh
bash scripts/bootstrap.sh
bash scripts/verify.sh
bash .github/standards/check.sh
node parity/toast/inventory.mjs /path/to/base-ui --check
node parity/dialog/inventory.mjs /path/to/base-ui --check
node scripts/parity-inventory.mjs --upstream /path/to/base-ui --check
pnpm exec playwright test tests/browser/toast-portal.spec.ts
```

The existing hosted CI discovers this browser spec with secured Chromium and zero retries. Exact final-head independent GPT6.1Sol high review, configured automatic review and all three CI checks are required. [Draft PR #22](https://github.com/sveltery/base/pull/22); parent owns merge.
