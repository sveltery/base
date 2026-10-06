# Bounded basic Toast source repair

This work restores the basic Toast store, manager, Provider, label registration and shared focus composition from Base UI 1.8.0, immutable pin `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c` (MIT). It starts from native renderer checkpoint `f0dbb89a05f032af1e9aac99461c6eccfa09e0d9`. It does not establish complete Toast business or API parity.

The pre-implementation review read the full pinned Store/ReactStore, ToastStore, createToastManager, useToastManager, Provider/context, Root/context, Viewport, Title, Description, label/content/promise/focus helpers and their invoked shared Timeout, AnimationFrame, shadow DOM, owner, listener, cleanup, platform, FocusGuard and animation-completion bodies. Imports were followed to their source owners, including `@base-ui/utils` and Floating DOM dependencies. The earlier implementation record cited a 403-module renderer review at an external absolute path, with SHA-256 `bc75dd8c33947c6810f8ab904d26c83ee06244955b7dbf2a738283bd19895795`. That report is unavailable in this checkout and supplies no current closure-review credit. The repository-contained [native renderer graph](../native-snippets/native-graph.json) and Source correspondence retain the renderer dependency evidence; fresh entire-closure review at the final integrated head is required.

## Concrete lease

Runtime edits belong to `packages/base/src/lib/toast/**`, plus the exact pure `packages/utils/src/lib/generateId.ts` business helper and its package export. This branch owns its separate worktree; it does not edit the Utils extraction or native class integration worktrees. Tests and current evidence are scoped to these contracts. Original archives, assertion bodies/credits and historical receipts remain immutable.

| Original source role | Native destination / substitution | Business review check |
| --- | --- | --- |
| `utils/store/Store.ts`, `ReactStore.ts` | Canonical `@sveltery/utils/store` SvelteStore | Same-reference/no-change snapshot suppression; synchronous snapshot arguments; reentrant update tick interrupts obsolete notification delivery. Native selected reads replace React subscriptions. |
| `utils/generateId.ts` | Canonical `@sveltery/utils/generateId` | Module-global counter, fresh random four-character fragment on each allocation, truthy explicit-ID bypass. Imperative manager/store IDs are distinct from native `$props.id()` label IDs. |
| `toast/store.ts` metadata/limit/add/update/remove/close/promise/timers | Native ToastStore extends canonical SvelteStore, using Original bodies | Ending replacement publishes removal then addition; add/update publish before timer work; onRemove precedes removal and retains Original index/reentrant behavior; cleanup clears timers without terminal state guards. |
| `toast/provider/ToastProvider.tsx` | Native Provider context, initialization and `$effect` subscription with captured cleanup | Route manager promise/update/close/add in Source order; no replay or suppressed promise rejection; timeout/limit synchronize through native effect inputs. |
| `toast/useToastManager.ts` | Stable native facade getter calls canonical selected read | Live `toasts` and bound methods, native context; no React memo adapter. Public functional factory API and generic inference retained. |
| `toast/utils/useToastLabelPart.ts` | Native Title/Description content resolution, label effect and Root ID setters | Nullish content fallback; empty/boolean content gate; explicit/generated IDs; cleanup clears the current ID when equal to captured ID, including duplicate-ID overlap. |
| `toast/store.ts` focus/touch and `toast/utils/focusVisible.ts` | Store-owned focus/touch methods using canonical shadow DOM/owner and shared matchesFocusVisible | Source close callback loop precedes focus scan; next then previous non-ending toast; previous-element fallback; outside touch resumes then clears interaction. |
| `toast/viewport/ToastViewport.tsx` | Native Viewport effects/events, canonical Timeout/listeners/cleanup/FocusGuard | F6, Shift+Tab, focus inside/outside, touch, delayed mouseleave and window focus order. Native removal focusout is handled directly; React commit suppression is retired. |
| `internals/useOpenChangeComplete.tsx`, `useAnimationsFinished.ts` | Used canonical native completion helper with effect-owned cancellation | Captured host watcher aborts on host/open lifetime changes. No store lifecycle tokens, custom renderer cache or private animation scheduler. |

## Business repairs and native boundaries

The inherited private snapshot, per-instance ID, atomic ending-ID replacement, timer-before-publication, terminal disposal, reentrant removal guard, timer clearing during physical removal and orphan rejection observer differ from pure Source business. They are restored here; they are not classified as React transport.

Native context, effects, bindings/attachments, snippets, content union and `$props.id()` replace framework APIs. Native label content/render snippets cannot be inspected as React element trees. Direct native events also retain removal focusout instead of emulating React commit suppression. These native expectations earn zero divergent unchanged upstream assertion credit and need executed browser/SSR/type evidence. Native cancellation captures the actual host/resource; it does not change store business to reject stale token writes.

## Validation status

Pre-edit reading, clean seed/worktree verification and the bounded implementation are complete. The [current body record](native-source-contracts.json) records actual independent Source/native hashes and 20 significant-token-identical Store business bodies; [the recorder](../../scripts/record-toast-native-source.mjs) regenerates those comparisons from the pinned checkout. These comparisons establish source preservation for the listed bodies, not executed equivalence or acceptance of their native callers.

Meaningful Store publication/ID/reentrant/timer, actual label overlap/removal/renderability, focus/touch and paired public Native/Original browser witnesses are prepared. Independent exact-head review, native types/SSR/runtime, installed dual-package consumer and secure browser execution remain pending. No install, build, test or browser work has used the heavy lane. Historical core/rendering proofs and counts do not become fresh acceptance through this record.

## Next feature lease

Anchored and swipe Toast remain incomplete. The next concrete feature lease must implement `ToastPositioner`/context and Root gesture business with the invoked `useSwipeDismiss`, `getElementAtPoint`, `scrollable` and used transform helper: anchor/reference ownership, geometry, scroll locking/arbitration, axis locking, thresholds, velocity/damping, pointer/touch cancellation, style publication and teardown. These missing business capabilities are outside this first repair and block full Toast/API completion.
