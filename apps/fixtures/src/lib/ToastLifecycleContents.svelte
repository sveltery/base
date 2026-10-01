<script lang="ts">
  import { Toast } from '@sveltery/base';
  import type { ToastManager } from '@sveltery/base/toast';
  let { external, indexKeys = false }: { external: ToastManager; indexKeys?: boolean } = $props();
  const facade = Toast.getToastManager();
  let closed = $state<{ id: string; active: string | null; count: number }[]>([]);
  let removed = $state<{ id: string; present: boolean; title: string | null }[]>([]);
  let synchronousFocus = $state<string | null>(null);
  let main: HTMLElement;
  let closeSuccessorOnFocus = false;
  function addFocusCascade(replace: boolean) {
    closeSuccessorOnFocus = true;
    add('a', 'Oldest');
    add('b', 'Next', 0, false, replace ? () => add('b', 'Fresh', 50) : undefined);
    add('c', 'Closing');
  }
  function add(id: string, title: string, timeout = 0, focusInCallback = false, callback?: () => void) {
    facade.add({ id, title, timeout, onClose() {
      if (focusInCallback) main.querySelector<HTMLElement>(`[data-toast-id="${id}"]`)?.focus();
      callback?.();
      closed.push({ id, active: main.ownerDocument.activeElement?.id ?? null, count: facade.toasts.length });
    }, onRemove() {
      const root = main.querySelector<HTMLElement>(`[data-toast-id="${id}"]`);
      removed.push({ id, present: !!root, title: root?.querySelector('h2')?.textContent ?? null });
    } });
  }
  function attach(node: HTMLElement) {
    main = node;
    const host = node as HTMLElement & { closeToastNow?: (channel: string, id?: string) => void; closeAndReplace?: () => void };
    host.closeToastNow = (channel, id) => {
      (channel === 'manager' ? external : facade).close(id);
      synchronousFocus = node.ownerDocument.activeElement?.id ?? null;
    };
    return () => { delete host.closeToastNow; delete host.closeAndReplace; };
  }
</script>
<section class="lifecycle" data-testid="lifecycle" {@attach attach}>
  <button id="outside">outside</button>
  <button onclick={() => { add('a', 'A'); add('b', 'B'); add('c', 'C'); }}>add three</button>
  <button onclick={() => add('save', 'Saving…')}>add save</button>
  <button onclick={() => add('save', 'Saved')}>replace save</button>
  <button onclick={() => add('timer', 'Timer', 50, true)}>add timer</button>
  <button onclick={() => facade.add({ id: 'classes', title: 'Classes', timeout: 0,
    actionProps: { children: 'Act', class: { selected: true, hidden: false } } })}>add class action</button>
  <button onclick={() => facade.update('classes', { actionProps: { children: 'Act', class: ['manager', ['selected', false], { hidden: false }] } })}>array action class</button>
  <button onclick={() => add('old', 'Old', 0, false, () => add('fresh', 'Fresh', 50))}>add exiting prior target</button>
  <button onclick={() => addFocusCascade(false)}>add focus cascade</button>
  <button onclick={() => addFocusCascade(true)}>add focus replacement</button>
  <button onclick={() => add('callback', 'Closing', 0, false, () => add('fresh', 'Fresh'))}>add callback sibling</button>
  <button onclick={() => add('callback', 'Old', 0, false, () => add('callback', 'Fresh', 50))}>add callback replacement</button>
  <Toast.Viewport data-testid="viewport">
    {#each facade.toasts as toast, index (indexKeys ? index : toast.id)}
      <Toast.Root {toast} swipeDirection={[]} id={`root-${toast.id}`} data-testid="root" data-toast-id={toast.id}
        onfocus={() => { if (closeSuccessorOnFocus && toast.id === 'b') { closeSuccessorOnFocus = false; facade.close('b'); } }}>
        <Toast.Title />
        <Toast.Action class="own" data-testid="action" />
        <Toast.Close aria-label={`close ${toast.id}`} />
      </Toast.Root>
    {/each}
  </Toast.Viewport>
  <output data-testid="close-observations">{JSON.stringify(closed)}</output>
  <output data-testid="remove-observations">{JSON.stringify(removed)}</output>
  <output data-testid="synchronous-focus">{synchronousFocus}</output>
</section>
<style>
  :global(.lifecycle [data-ending-style]) { animation: toast-exit 10s linear; }
  @keyframes -global-toast-exit { from { opacity: 1; } to { opacity: 0; } }
</style>
