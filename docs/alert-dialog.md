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

Style the parts through native props, state-dependent class/style, CSS variables and state attributes. The shared Dialog parts are actual component aliases. Trigger is the actual generic Dialog Trigger with a narrower erased handle type and native generic constructor metadata, so implicit markup infers payloads from its handle. Every aliased part retains its native render snippet, ref binding, element props and state contracts. `Root` renders no HTML; its payload snippet receives `{ payload: Payload | undefined }`.

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

The native API uses snippets, attachments/bindable refs, `bind:actions`, class/style and native event props. Root retains exported `close()`/`unmount()` methods. Each public Root calls the same `useRenderDialogRoot` helper once and owns its store, generated ID, actions publication and exported methods. The private shared native view preserves context → attachment → interactions → children composition. Reassigning the writable actions binding does not redirect the Root instance methods. Public IDs stay in their original public Root lifetime. Runtime imports remain React/Kit-free; the actual Base UI/React dependencies belong to reference fixtures only.

The shared Portal now uses the existing canonical window fallback for its native host-ID observer. This restores Source host/child mounting for valid `document.implementation.createHTMLDocument()` containers whose document has no window; observer and mount cleanup remain shared. The missed inherited defect reopens the historical Source review, with fresh exact-head acceptance still required. Authored browser harness repairs distinguish completed close cycles from physically interrupted exits and verify both Dialog catalog destinations without adding ordinary Source credit; the verification record preserves the failed predecessors.

The [implementation plan](../parity/alert-dialog/implementation-plan.md), [Source correspondence](../parity/alert-dialog/source-correspondence.md), [complete graphs](../parity/alert-dialog/source-graph.json), [immutable tests/types](../parity/alert-dialog/upstream-inventory.json), [generated API](../parity/alert-dialog/api.json) and [verification record](../parity/alert-dialog/verification.md) distinguish whole runtime scope from executed assertions and acceptance. Source StrictMode replay counts remain immutable Source evidence; native once-only lifecycle witnesses earn zero unchanged Source credit where different. This work does not implement other popup families or claim whole-library parity.

## Current main migration candidate

The local integration candidate normally merges main `aa4daff54ec82b96e34e1601648d1b3926ef08cf`, including the development Dialog/runtime bodies delivered by native snippet PR77. This is development integration, not acceptance of PR42. The eventual final candidate must include accepted PR42 main and its exact post-merge CI after the lead lands it.

All eight element parts remain the actual Dialog component objects, including Trigger's erased narrower handle contract. Custom render snippets spread the supplied native attachment onto their chosen host and use `bind:ref`; styles are native CSS strings or state callbacks returning strings. No React ref pipeline, style custody or alternate Dialog state owner is introduced. Main's Portal relocation and completion owners are retained; the historical observer repair and failed receipts remain provenance of their recorded heads. The closure recorder now follows workspace `@sveltery/utils` exports through actual source modules rather than declaring shared business imports external.

Fresh candidate validation and independent full-closure source/native/maintainability review are recorded in the [migration handoff](../parity/alert-dialog/main-integration.md). Historical passing checks do not establish candidate readiness. Supplements and native differences earn zero unchanged upstream assertion credit.

The packed AlertDialog supplement installs real Base and Utils archives and checks library declarations with explicit `skipLibCheck: false`, strict optional/indexed contracts, six payload rejections and four nominal-handle rejections. Its SSR runtime imports installed packages; SSR compilation uses the repository's identically pinned Svelte compiler. Hydration uses the installed peer compiler/runtime in jsdom, disables recovery, and verifies reuse of server nodes, handle identity, payload, Portal, close/reopen and cleanup. This executed supplement does not establish secured-browser or unchanged Source assertion acceptance.

The reached canonical `nativeProps.ts` currently drops public empty CSS strings instead of retaining bare Svelte's empty style attribute. PR73 solely owns the measured native-default repair and its witness/provenance. AlertDialog has no local workaround; final acceptance also requires normally integrating that accepted main repair and fresh exact-head review/CI. This newly reported inherited limitation reopens earlier native review and earns no Source assertion credit.
