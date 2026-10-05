# Dialog source port

PR [#42](https://github.com/sveltery/base/pull/42) replaces the earlier contained Dialog implementation with the pinned Base UI business closure. Its delivery boundary is all nine public parts—Root, Trigger, Portal, Backdrop, Viewport, Popup, Title, Description and Close—plus handles, payload, actions, presence and their shared stores, focus, dismissal, portal and scroll helpers. Whole-source review and final hosted acceptance remain pending; earlier green runs do not certify this replacement.

The original reference is Base UI 1.8.0 at immutable [47b40521](https://github.com/mui/base-ui/tree/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/dialog), MIT. The [source correspondence](../parity/dialog/source-correspondence.md), [complete original graph](../parity/dialog/source-graph.json), [per-module decisions](../parity/dialog/source-correspondence.json) and [actual native graph](../parity/dialog/local-graph.json) include original shared dependencies and inherited local code outside the diff. The flat controller and independent overlay/focus/isolation/portal-focus/scroll-lock engines are removed. Root and public handles use the original popup store; one authoritative plain Store owns state, and Svelte subscriptions track its original notification bus.

## Native API

Import `Dialog` from `@sveltery/base` or parts from `@sveltery/base/dialog`.

| Pinned interface | Native Svelte interface |
| --- | --- |
| Children / payload render function | A children snippet. Root supplies `{ payload: Payload \| undefined }`; ordinary no-argument snippets may ignore it. |
| `className` / state callback | `class`, using native Svelte ClassValue (strings, arrays and objects) or a state callback. |
| Style / state callback | Native CSS strings or the canonical style object/callback, including CSS variables and numeric conversion. |
| Replacement element / render function | `render(props, state, children)` snippet. Spread supplied props, including attachment symbols, onto the actual host. Use `mergeProps` to compose extra handlers. Snippets remain opaque; no React element inspection or child replacement machinery is added. Portal separately mounts its children into the actual host even when the snippet ignores the children argument. |
| Forwarded DOM ref | `bind:ref={element}` accepts initially undefined or null refs. The canonical native attachment publishes the actual host and null on teardown. |
| `actionsRef` | `bind:actions={actions}`, or Root `bind:this` methods `close()` and `unmount()`. Use unmount after deferred closing animation. Forced unmount while logically open retains the original remount behavior. |
| Detached handles | `Dialog.createHandle<Payload>()` or `new Dialog.Handle<Payload>()`; pass the same handle to Root and detached Triggers. `open(triggerId)`, `openWithPayload(payload)`, `close()` and `isOpen` retain original store ownership. |
| Synthetic handlers | Native lowercase event props such as `onclick`. The same native event gains `preventBaseUIHandler()`; default prevention and change-detail cancellation stay separate. |
| Focus ref / callback | `{ current: element }` or the original interaction-type callback. Null requests default focus; false/undefined requests no movement. |
| Portal container | HTMLElement, ShadowRoot or `{ current: node }`. Undefined/empty refs fall back to parent Portal/body; explicit null waits. Changed container identity remounts the host, as in the pin. |
| Generated IDs | Native `$props.id()` for raw source IDs; the canonical useBaseUiId prefix for parts which originally use that helper. Relationships are preserved, while framework ID bytes differ. |
| Component namespace types | Erased `Dialog.Root.Props<Payload>`, `Trigger.Props<Payload>`, each part's Props/State and the existing named exports. Strict optional properties accept explicit undefined as in source. |

```svelte
<script lang="ts">
  import { Dialog } from '@sveltery/base';
  const handle = Dialog.createHandle<number>();
  let actions = $state<Dialog.Root.Actions | null>(null);
</script>

<Dialog.Trigger {handle} payload={7}>Open</Dialog.Trigger>
<Dialog.Root {handle} bind:actions>
  {#snippet children({ payload })}
    <Dialog.Portal>
      <Dialog.Backdrop />
      <Dialog.Viewport>
        <Dialog.Popup>
          <Dialog.Title>Title</Dialog.Title>
          <Dialog.Description>Payload {payload}</Dialog.Description>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Viewport>
    </Dialog.Portal>
  {/snippet}
</Dialog.Root>
```

Controlled `open` and `triggerId` remain owner inputs; requests do not force a held controlled input. `onInternalOpenChange` remains the existing supplemental observation seam after consumer cancellation and before floating dispatch. Logical open, retained mounted presence and deferred removal remain distinct. Deferred close retains focus until actual focus-manager teardown. A canceled `preventUnmountOnClose()` callback retains the original immediate state side effect; it can defer a later accepted close. Original ShadowRoot outside-guard loops, single-label cleanup, longhand CSS-priority loss, composition-event settlement and sole-trigger payload forwarding remain source behavior. [DS-01](upstream-differences.md#ds-01-dialog-whole-source-native-substitutions) records the native boundary and restoration of earlier local corrections.

## Evidence and limits

The [175-declaration / 371-candidate inventory](../parity/dialog/upstream-inventory.json) stays unchanged. Previously credited 11 declarations / 13 expansions remain historical execution evidence; this source replacement adds zero ordinary credits. The [complete handle assertion bodies](../parity/dialog/handle-candidates.json), conformance records and original guards remain separate from local supplements.

Current supplements include direct Store notification/recursive-write checks; actual React/native scroll, IME, completion, deferred-focus and payload comparisons; native handle/cleanup regressions; guard/backdrop/tree primitive probes; replacement-host/context/ID/Viewport tests; and the [real packed consumer](../scripts/check-dialog-handles-package.sh), which checks public root/subpath identity, no-browser SSR, strict types and actual installed mounting/focus/portal/deferred-presence/reopen/teardown. Synthetic jsdom input establishes wiring only. Secured hosted Chromium and fresh whole-closure source/native/maintainability review remain mandatory.

Exact `aa5c9aa` passed its 56 focused and 2,517 broad secured browser cases, all 21 hosted checks and owner full Verification/Standards. The successor normally integrates accepted main `74f667d`/PR55 without changing any reached native body, then restores the two original DEV warning explanations in canonical useButton from public PR59 `d00a8b0`. Earlier whole-source review missed this helper gap; its historical disposition is preserved rather than applied to the repair. Fresh owner affected checks, actual workspace Svelte checks and strict installed nine-part Dialog consumers pass; the [correspondence](../parity/dialog/source-correspondence.md) records their bounded scope. Fresh hosted checks and full-closure source/native/maintainability review remain required for the resulting head. The repair changes no button business handler and adds no ordinary assertion credit.

The runtime closure covers Dialog's used business dependencies. Public Drawer, AlertDialog and other popup families remain outside this PR; their dependent Dialog assertion bodies remain individually unimplemented. React Suspense/Activity/StrictMode replay machinery is not recreated; its affected assertions retain explicit framework-unimplemented status and zero unchanged-source credit. Unused Store methods and unselected floating barrel algorithms are recorded rather than copied as dead files. No complete Dialog assertion parity, whole-library parity or exhaustive assistive-technology certification is claimed.

Portal emits no SSR DOM and mounts with inherited native context after client setup. Browser verification uses the official Chromium 153 build on Ubuntu 22.04 with sandboxing enabled, one worker and zero retries. Local Chrome remains blocked by the saved environment; no sandbox-disabling workaround is used. Historical contained-browser and controller evidence remains in the linked parity records and does not substitute for final PR42 acceptance.
