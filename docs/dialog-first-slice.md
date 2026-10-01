# Dialog contained-first draft

This implements `Dialog.Root`, `Trigger`, `Portal`, `Backdrop`, `Popup`, `Title`, `Description`, and `Close` for a bounded, contained Svelte 5 slice. Import the namespace from `@sveltery/base` or parts from `@sveltery/base/dialog`. The package remains private and experimental. **Browser acceptance is blocked; complete Dialog compatibility is not claimed.**

Reference: [Base UI v1.8.0](https://github.com/mui/base-ui/tree/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/dialog), commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. The unchanged [scenario contracts](../parity/dialog/scenarios.md) and [175 declarations / 371 variant records](../parity/dialog/upstream-inventory.json) remain **unported**. Tests in this draft are separately identified source-derived supplements and local wiring regressions; no upstream leaf earns credit from a narrower contained fixture. No approved deviations are introduced.

## Proposed Svelte API adaptations

These mappings are proposals for parent review. They preserve the exercised observable behavior but do not promise React syntax or complete shared composition conformance.

| React interface | Svelte draft interface |
| --- | --- |
| `children` | Svelte `children` snippet. Payload-function children and detached handles are unimplemented. |
| `render(props, state)` / replacement element | `render(props, state, children)` snippet. Spread all provided native props onto the actual replacement node, including symbol attachment props; render the third argument to retain supplied child content. Replacement snippets cannot be introspected: merge additional consumer props with `mergeProps(props, extra)` before spreading to retain callback composition. Automatic replacement-element prop inspection is not supported. |
| DOM forwarded ref | `bind:ref={element}` resolves the actual DOM node, including snippet replacements that spread attachment props. Svelte attachments drive cleanup. React ref arrays/callback ref merging are unimplemented. |
| `actionsRef` | `bind:actions={actions}`, or Root component `bind:this` methods `close()` / `unmount()`. Use `unmount()` after a deferred close. Forced removal while logically open is unimplemented. |
| `className` / state-resolved class | `class` string or state callback. React class objects/arrays are unsupported. |
| CSS style object | CSS string or object, optionally a state callback. Object numeric values serialize literally; include units in strings for dimensional properties (`width: '20px'`). Internal object keys merge with object consumer keys; consumer CSS strings append after internal styles. Full React numeric CSS conversion is unimplemented. |
| Synthetic event props | Lowercase native Svelte props, e.g. `onclick`. The actual native event gains `preventBaseUIHandler()`. Native `preventDefault()` remains a distinct channel; custom keyboard activation composes through a generated click carrying modifier keys, as upstream does. |
| Focus ref | `{ current: element }`, or callback returning an element/boolean/null/undefined. Use Svelte reactive state for refs which resolve or change later. Callback `undefined` means no focus movement; null means default. |
| Portal container ref | Element, ShadowRoot, `{ current: node }`, undefined fallback or explicit null wait. Reactive reference changes require Svelte reactive state. Relocation and shadow fixtures still need browser acceptance. |
| Generated IDs | `base-ui-` + `$props.id()`, using pinned Svelte 5.57.1 ([official ID documentation](https://svelte.dev/docs/svelte/$props#props.id)). Relationships are preserved rather than React's ID bytes. |

```svelte
<script lang="ts">
  import { Dialog } from '@sveltery/base';
  import type { Actions } from '@sveltery/base/dialog';
  let actions = $state<Actions | null>(null);
  let trigger = $state<HTMLElement | null>(null);
</script>

<Dialog.Root bind:actions>
  <Dialog.Trigger bind:ref={trigger}>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

Replacement snippet with child forwarding:

```svelte
<Dialog.Trigger nativeButton={false}>
  {#snippet render(props, state, children)}
    <span {...props} data-example-open={state.open}>{@render children?.()}</span>
  {/snippet}
  Open
</Dialog.Trigger>
```

Root `open` is a controlled input; use `onOpenChange` to update the owner. `open ?? internalOpen` chooses effective state; a request never forces a held owner input to change. `onInternalOpenChange` is a draft observation seam for the callback → cancellation check → internal dispatch contract. It receives the same live details/native event and is suppressed on cancellation. It is not a substitute for a native DOM openchange event.

Each Root owns its controller. Derived open, IDs, labels, trigger ownership and nested counts use getters/runes, with lifecycle registrations rather than copy effects. Effects are limited to external DOM association, portaling, native listeners, focus, scroll-lock ownership and animation completion. Logical open, retained presence and externally deferred removal are separate; generation checks prevent stale completions after reopening/destroying.

Portal emits no SSR DOM; body/parent-container relocation happens after mount. The package root now includes Svelte components and requires a Svelte compiler/bundler. The tarball test uses a test-only SSR loader with the declared Svelte peer, rather than pretending plain Node understands `.svelte`. `@sveltery/base/merge-props` remains directly importable JavaScript.

## Evidence and gates

Executed commands, exact environment blockers and independent review are recorded in [implementation verification](../parity/dialog/implementation-verification.md).

| Area | Runnable evidence | Current result / limitation |
| --- | --- | --- |
| State, cancellation, native identity, composition | [actual Svelte DOM regressions](../packages/base/tests/dom/dialog.test.ts), [public type assertions](../packages/base/tests/dialog.types.ts) | Supplemental jsdom execution; not browser parity. Includes held controlled updates/reopen, callback pre-change DOM observations, canceled open/close with zero internal dispatch, actual Trigger/Close prevention and custom keyboard click composition. |
| SSR and consumer package | [tarball consumer](../scripts/check-package.sh), [test-only SSR compiler loader](../scripts/svelte-ssr-loader.mjs) | Actual packed root/subpath parts render server-side without document access; generated IDs are unique across two Roots; portals absent on server. Real hydration needs Chromium. |
| Focus, trusted input, nested dismissal, transitions and hydration | [31 browser probes](../tests/browser/dialog.spec.ts), [secured Playwright config](../playwright.config.ts) | Authored and collected, **blocked before browser startup**. Shared probes run real pinned React Base UI and real Svelte parts; no surrogate Dialog. Focus/Tab/trusted pointer/transition/hydration results are not certified. |
| Nesting, labels, cleanup, scroll styles | Actual Svelte DOM regressions | Tests execute contained nested parts, one-Escape ownership, descendant count cleanup, label ID updates/removal, deferred completion/unmount, lock reference counts and restoration of prior shorthand/longhands. Layout-dependent claims remain blocked. |

Fixture routes: `/dialog` (Svelte), `/reference` (real `@base-ui/react@1.8.0`), `/dialog-ssr` (two Roots with server-rendered IDs). React/reference dependencies are fixture-only; none enter the library runtime. Official `@playwright/test`, `playwright`, and `playwright-core` resolve to exact **1.63.0** through the committed lockfile. `chromiumSandbox: true` is explicit; retries are zero and no blanket skips exist.

## Unimplemented or unverified behavior

Before a complete Dialog milestone, retain all original assertions/variants and implement: Viewport; detached handles/payloads/remount/reparent/overlap; full eight-part ref/render/class conformance; nonmodal body-portal logical Tab order/focus guards; full modal screen-reader isolation and outside interaction routing; deep shadow-root tabbable traversal; touch movement/multitouch dismissal; cross-type Menu/Select/AlertDialog/Drawer/ScrollArea/NumberField cases; scrollbar/third-party lock resilience under asynchronous unlock; all animation replacement/count cases; suspended detached hydration; explicit/late portal target relocation acceptance; forced unmount while open. Single-popup-per-Root and object CSS dimensional values requiring explicit units are current draft restrictions.

The document-wide stack is a contained-first ownership mechanism, not certified sibling/cross-type Floating UI equivalence. Composed paths and owner-document access are used, but full shadow DOM fixture parity remains unported. No behavior in this list should be hidden by weakening an upstream assertion or replacing its real dependency.

## Browser environment blocker

On the saved Linux environment, official install action:

```sh
PLAYWRIGHT_BROWSERS_PATH=/workspace/playwright-browsers pnpm exec playwright install chromium
```

attempted `https://cdn.playwright.dev/builds/cft/153.0.8010.12/linux64/chrome-linux64.zip` and returned **HTTP 403: Domain forbidden**. No network policy changed, no alternate-host bypass attempted.

A secured launch using `DIALOG_CHROMIUM_PATH=/usr/bin/chromium pnpm test:browser` fails before the fixture interaction with **SIGABRT**, `setuid_sandbox_host.cc:166`: `/usr/lib/chromium/chrome-sandbox` must be owned by root and mode 4755. The existing helper is mode 4755, owned by nobody. No sandbox-disabling flags or security changes were made. Read-only managed browser lookup also reported the Orbit launcher requires `ORBIT_OS=true` and `BROWSER_HEADLESS=false`; no managed browser was available.

Parent/environment owner must provision a browser with its sandbox working or authorize the exact official CDN host and provide a supported sandbox route. Then run `pnpm test:browser` and fix any runtime/test failures before accepting this slice's browser gates.
