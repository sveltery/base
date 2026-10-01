# Toast rendering assertion ports

Authority: Base UI v1.8.0 `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. MIT attribution: [UPSTREAM_LICENSE](UPSTREAM_LICENSE). Baseline main: `ed9a00305c9c000625127c5122bec0499a2ed8d8`.

The [browser suite](../../tests/browser/toast.spec.ts) contains thirteen complete source declaration candidates, each executed against real React 1.8.0 and the actual Svelte Toast parts. [rendering-ports.json](rendering-ports.json) records immutable source callback hashes, every source assertion line, fixture variants and exact execution names. At initial implementation these candidates are **pending hosted execution and earn zero passing credit**. Promotion requires successful secured Chromium on a recorded commit; the parent owns shared [manifest.json](../manifest.json) reconciliation. The [upstream inventory](upstream-inventory.json) is an immutable source trace whose placeholders remain unchanged. Existing core execution is separate evidence, not thirteen additional browser declarations or automatic credit for all 196 Toast declarations.

| Source leaf | Complete ordered assertions retained |
| --- | --- |
| M:15 | Title absent; manager add; title present; advance 5000ms; title absent. |
| M:63 | Add save; Saving… text and one Root; advance 900ms; upsert; first ID save, second equal first, Saved text and one Root; advance 200ms, still present; advance 800ms, absent. |
| U:21 | Facade add; Root present; advance 5000ms; Root absent. |
| U:56 | Add in two independent Providers; both titles present; update first; first updated present, second updated absent, original second present. |
| U:1697 | Add; Root present; close that ID; Root absent. |
| U:1743 | Five consecutive adds; five Roots; close without ID; Root absent. |
| U:1794 | Change Provider timeout 5000 to 1000 before add; advance 999ms, Root present; advance 2ms, Root absent. |
| U:1853 | Limit 2; add first, first unlimited; add second, second unlimited; add third, third unlimited and first limited. |
| U:1878 | Limit 2; first, second, third each unlimited after its add; close third; first unlimited. |
| U:1907 | Limit 1; save unlimited; add other; save limited, other unlimited; upsert save; Saved limited, other unlimited. |
| U:1965 | Limit 1; add two; newest unlimited, oldest limited; raise limit 2, oldest unlimited; lower limit 1, oldest limited. |
| R:97 | Add through facade; Root's inline --toast-offset-y is nonempty. |
| R:112 | Static Root fallback title/description IDs match ARIA relationships; explicit content retains matching relationships and both explicit text assertions; unmount labels removes both attributes; remount restores both relationships and both fallback text assertions. |

M means `packages/react/src/toast/createToastManager.test.tsx`, U means `packages/react/src/toast/useToastManager.test.tsx`, and R means `packages/react/src/toast/root/ToastRoot.test.tsx`. All selected leaves have one source variant; 13 declarations produce 26 paired runs. Native part declarations are owned by the separate parts evidence. Supplements earn zero declaration credit.

The adapters preserve the source List's native Title/Description/Close/Action order, the title-only CustomList for close cases, close-only TestList for limit cases, title-only limited upsert roots, keyed ID lists and independent Provider topology. `getToastManager` is the Svelte initialization-context adaptation of `useToastManager`; the facade getter is read live instead of destructuring a copied snapshot. Conditional text uses the Svelte scalar `children` prop so undefined means fallback content; an explicitly supplied snippet would remain a function even if it renders undefined. Both framework fixtures opt out of gestures explicitly with `swipeDirection=[]`. This is an upstream-supported setting; gesture defaults, swipe attributes, Positioner, Arrow, Portal, shadow DOM, custom render/ref conformance, announcements inside Dialog and modal coexistence receive no credit here.

Source `fireEvent.click` is retained as native button.click through the browser DOM. It neither moves the pointer nor focuses the Viewport, so timer tests do not acquire unrelated hover/focus pauses. Source `user.click` in R:97/R:112 is adapted to Playwright user input where applicable. Provider `setProps` becomes a synthetic fixture option control; its reactive update commits before a later add, and the original 999/2ms and limit observations are retained. Callback return IDs are serialized in nonfocusable output nodes. Source fake clocks become Playwright's browser timer and Date clock, installed after actual hydration and paused at a fixed instant so intermediate assertions cannot consume deadline time. Exact source clock steps are retained; after a timer or explicit close has already committed ending state, the adapter advances 32ms solely to flush the browser exit observer's animation frame. Upstream JSdom has no getAnimations/requestAnimationFrame exit observation. Framework mounting remains real. Intermediate assertions poll Svelte/React commits, adapting source render/act/flushMicrotasks without removing any observation. No exit CSS is applied to source ports, matching the source immediate removal case.

Nine additional browser supplements exercise actual SSR markup/hydration ID stability and independent empty requests, manager/facade close-all callback-before-focus ordering, timer closure whose onClose changes focus, and real CSS exit animation replacement/removal. The lifecycle fixture captures actual browser Animation objects, completes a stale exit after replacing the ending ID, and confirms the replacement survives. Completing the replacement exit checks onRemove sees its Root still physically present and reads Saved before removal. Both close-all channels call the public close method directly through an attachment-managed fixture host, read document focus synchronously after it returns, and verify every onClose saw the originally focused toast. Paired native F6/Tab/Shift+Tab/Escape traversal verifies real browser focus and prior-focus restoration; paired hover/window blur/focus verifies timer remainder across two pauses. These are implementation regressions; they confer no upstream leaf credit.

Run with the repository's pinned toolchain:

```sh
source scripts/toolchain.sh
pnpm --filter @sveltery/base build
pnpm --filter @sveltery/fixtures check
pnpm exec playwright test tests/browser/toast.spec.ts
```

The existing hosted browser job discovers the Toast spec automatically. Its secured Chromium, retries=0 and actual React reference remain required. Local or hosted launch failure is a blocker, not passing evidence. Exact final-head independent review, all CI checks and the latest automatic Codex review remain parent merge gates.
