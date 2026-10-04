# AlertDialog

AlertDialog provides the complete pinned public runtime surface: Root, Trigger, Backdrop, Close, Description, Popup, Portal, Title, Viewport, Handle and createHandle. It is a Source-first implementation over the canonical Dialog store, interaction, focus, Portal, scroll and lifecycle ports. Final acceptance is pending the actual Dialog prerequisite deliveries, fresh exact-head source/native/maintainability review and secured browser gates; ordinary assertion credit remains zero.

```svelte
<script lang="ts">
  import { AlertDialog } from '@sveltery/base';
</script>

<AlertDialog.Root>
  <AlertDialog.Trigger>Delete project</AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Backdrop />
    <AlertDialog.Popup>
      <AlertDialog.Title>Delete this project?</AlertDialog.Title>
      <AlertDialog.Description>This action removes its saved work.</AlertDialog.Description>
      <AlertDialog.Close>Cancel</AlertDialog.Close>
      <AlertDialog.Close onclick={() => console.log('delete')}>Delete</AlertDialog.Close>
    </AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

Style the parts through native props, state-dependent class/style, CSS variables and state attributes. The shared Dialog parts are actual component aliases. Trigger is the actual generic Dialog Trigger with a narrower erased handle type. Every aliased part retains its native render snippet, ref binding, element props and state contracts. `Root` renders no HTML; its payload snippet receives `{ payload: Payload | undefined }`.

Alert mode always uses modal=true, disables pointer dismissal and sets role=alertdialog. Backdrop/outside presses leave it open. Escape, Close and imperative actions retain the canonical cancellable open-change contract, reason/owning trigger, completion, focus restoration and retained-close lifecycle. `onOpenChange` requests controlled updates; the owner decides whether to update `open`. `details.cancel()` vetoes the state change. `details.preventUnmountOnClose()` retains presence until `actions.unmount()`.

```svelte
<script lang="ts">
  import { AlertDialog } from '@sveltery/base';
  const handle = AlertDialog.createHandle<{ id: string }>();
  let actions = $state<AlertDialog.Root.Actions | null>(null);
</script>

<AlertDialog.Trigger {handle} payload={{ id: 'draft' }}>Delete draft</AlertDialog.Trigger>
<AlertDialog.Root {handle} bind:actions>
  {#snippet children({ payload })}
    <AlertDialog.Portal>
      <AlertDialog.Popup>
        <AlertDialog.Title>Delete {payload?.id}?</AlertDialog.Title>
        <AlertDialog.Close>Cancel</AlertDialog.Close>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  {/snippet}
</AlertDialog.Root>
```

The handle owns association, while each mounted Root owns its store and defaults. Handle replacement reattaches to the existing Root; Root removal detaches; a fresh Root gets fresh defaults. `open(triggerId|null)`, `openWithPayload(payload)`, `close()` and `isOpen` preserve the canonical Source behavior, including ignored calls before/after attachment and the cancellable payload-before-open write. An AlertDialog handle extends Dialog's class with a type-only private brand; ordinary Dialog handles cannot be passed into AlertDialog, while the inherited Source subtype direction remains allowed.

The native API uses snippets, attachments/bindable refs, `bind:actions`, class/style and native event props. Root retains exported `close()`/`unmount()` methods. Its private shared native view calls the SAME `useRenderDialogRoot` helper once and preserves context → attachment → interactions → children composition. Public IDs stay in their original public Root lifetime. Runtime imports remain React/Kit-free; the actual Base UI/React dependencies belong to reference fixtures only.

The [implementation plan](../parity/alert-dialog/implementation-plan.md), [Source correspondence](../parity/alert-dialog/source-correspondence.md), [complete graphs](../parity/alert-dialog/source-graph.json), [immutable tests/types](../parity/alert-dialog/upstream-inventory.json), [generated API](../parity/alert-dialog/api.json) and [verification record](../parity/alert-dialog/verification.md) distinguish whole runtime scope from executed assertions and acceptance. Source StrictMode replay counts remain immutable Source evidence; native once-only lifecycle witnesses earn zero unchanged Source credit where different. This work does not implement other popup families or claim whole-library parity.
