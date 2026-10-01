# Foundation architecture and handoff

The foundation checkpoint now has a [contained Dialog draft](dialog-first-slice.md); the complete Dialog milestone remains pending. The runtime package lives in `packages/base`; `apps/fixtures` is a small SvelteKit app. Runtime imports must not depend on SvelteKit or React. `@sveltejs/package` emits the distribution and declaration files. Publication is disabled (`private: true`) while the API remains under review. Original Sveltery code is MIT licensed; upstream-derived materials retain their original MIT notices.

Reference upstream: mui/base-ui v1.8.0, tag object `5af893738de5c4513f8a315ffc54b979c165d1b5`, commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. See [the source inventory](upstream-contracts.md).

The first implementation step is composition plus state and overlay ownership, then a complete Dialog vertical slice. Use Svelte runes and per-Root context for reactive state; isolate stable imperative callbacks and DOM references. Effective controlled Dialog state follows the pinned popup store contract. Separate logical open, mounted presence, transition status, trigger ownership, and focus return. Resolve IDs using SSR-stable Svelte facilities, then verify hydration rather than relying on a process counter.

Portal and focus logic must support nested roots, cleanup, explicit containers, and shadow roots. Use owner document/window and composed event paths. Focus trap, nonmodal tab order, outside press ownership, scroll lock, and presence completion belong in reusable DOM primitives. Do not transplant React hooks or a SvelteKit-specific portal into the package.

## Current implementation

Event detail creation and reason constants are derived from upstream with MIT notices. Native prop/event merging is a draft behavioral adaptation. Ten new local regression tests cover selected behavior; they are **not** upstream test ports. Three upstream event-detail type assertions and one reused-getter runtime regression are ported with unchanged assertions and an exact equality helper. Native merge callbacks use an Event brand check rather than trusting custom payload fields; mutable and frozen custom callback objects retain ordinary callback chaining. Full public typing, browser validation, and composition remain pending.

## Svelte adaptations proposed for review

These are proposals, not approved exceptions: lowercase DOM event props (`onclick`) and `class` alongside Base UI's callback/name concepts; native DOM events gain the same `preventBaseUIHandler()` cancellation channel; render snippets receive merged native props and state; attachments provide actual DOM references; actions use a Svelte-compatible reference mechanism. Preserve event/default/control/focus/ARIA behavior. Decide each API separately before claiming parity. CSS string merging, class objects/arrays, state-dependent class/style, ref merging, and render composition require their own inventories and tests.

## Test-first continuation

1. Port the complete merge/state regression scenarios first. Keep upstream assertion semantics and preserve exact test identifiers/source lines in `parity/manifest.json`. Adapters may change mounting and event representations, not weaken expectations.
2. Add shared React-reference/Svelte scenario fixtures for observable state, callback payloads/order/cancellation, IDs/attributes, keyboard focus, and transitions where practical. Keep React dependencies in reference fixtures only.
3. Add Dialog parts in dependency order: Root/store/context, composition/Trigger, Portal/presence, Popup/focus/dismissal, Backdrop/Viewport, Title/Description registration, Close, handles/actions.
4. Run actual Chromium hydration/focus/tab/escape/outside-press/nesting/removal/animation tests plus SSR, typecheck, build and tarball consumers. Compile success alone cannot prove these behaviors.
5. Use Drawer snap/cancellation/swipe and Toast timer/pause/focus/presence probes from the upstream inventory before broad catalog work.

Keep foundation checks green. Report failing, unported, and approved-deviation cases separately. Do not hide pending parity behind skipped tests or assert complete compatibility from local regressions. The contained Dialog draft has Svelte parts and supplemental DOM/SSR execution, with browser acceptance blocked. Drawer and Toast remain unimplemented.
