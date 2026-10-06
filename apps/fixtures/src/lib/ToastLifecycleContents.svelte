<script lang="ts">
  import { flushSync } from 'svelte';
  import { Toast } from '@sveltery/base';
  import type { ToastManager } from '@sveltery/base/toast';
  let {
    external,
    indexKeys = false,
    narrowRoots = false,
  }: { external: ToastManager; indexKeys?: boolean; narrowRoots?: boolean } = $props();
  const facade = Toast.getToastManager();
  let closed = $state<{ id: string; active: string | null; count: number }[]>([]);
  let removed = $state<{ id: string; present: boolean; title: string | null }[]>([]);
  let synchronousFocus = $state<string | null>(null);
  let main: HTMLElement;
  let closeSuccessorOnFocus = false;
  let immediateFocusedExit = $state(false);
  let showViewport = $state(true);
  let viewportKey = $state(0);
  let noExitAnimation = $state(false);
  function addNestedClose(mode: 'focused' | 'immediate' | 'unfocused' | 'all') {
    immediateFocusedExit = mode === 'immediate';
    add('a', 'Oldest');
    add('b', 'Focused');
    add('c', 'Middle');
    add('d', 'Newest', 0, false, () => {
      if (mode === 'all') {
        facade.close();
        add('temporary', 'Temporary');
        facade.close('temporary');
        add('fresh', 'Fresh');
      } else {
        facade.close(mode === 'unfocused' ? 'a' : 'b');
        if (mode === 'immediate') flushSync();
      }
    });
  }
  function addConsumerBlur(replace: boolean) {
    if (replace) {
      add('callback', 'Old', 0, false, () => {
        add('callback', 'Fresh', 50);
        flushSync();
        const root = main.querySelector<HTMLElement>('#root-callback');
        root?.focus();
        root?.blur();
      });
    } else {
      facade.add({
        id: 'a',
        title: 'Oldest',
        timeout: 0,
        onRemove: () => (main.ownerDocument.activeElement as HTMLElement)?.blur(),
      });
      add('c', 'Middle');
      add('d', 'Newest', 0, false, () => {
        facade.close('a');
        (main.ownerDocument.activeElement as HTMLElement)?.blur();
      });
    }
  }
  function addDescendantReplacement(withSibling = false) {
    if (withSibling)
      facade.add({ id: 'sibling', title: 'Sibling', timeout: 0, onRemove: () => {} });
    facade.add({
      id: 'callback',
      title: 'Old',
      timeout: 0,
      actionProps: { children: 'Act' },
      onClose: () => {
        if (withSibling) facade.close('sibling');
        facade.add({ id: 'callback', title: 'Fresh', timeout: 50, priority: 'high' });
        flushSync();
      },
    });
  }
  function addFocusCascade(replace: boolean) {
    closeSuccessorOnFocus = true;
    add('a', 'Oldest');
    add('b', 'Next', 0, false, replace ? () => add('b', 'Fresh', 50) : undefined);
    add('c', 'Closing');
  }
  function add(
    id: string,
    title: string,
    timeout = 0,
    focusInCallback = false,
    callback?: () => void,
  ) {
    facade.add({
      id,
      title,
      timeout,
      onClose() {
        if (focusInCallback) main.querySelector<HTMLElement>(`[data-toast-id="${id}"]`)?.focus();
        callback?.();
        closed.push({
          id,
          active: main.ownerDocument.activeElement?.id ?? null,
          count: facade.toasts.length,
        });
      },
      onRemove() {
        const root = main.querySelector<HTMLElement>(`[data-toast-id="${id}"]`);
        removed.push({
          id,
          present: !!root,
          title: root?.querySelector('h2')?.textContent ?? null,
        });
      },
    });
  }
  function attach(node: HTMLElement) {
    main = node;
    const host = node as HTMLElement & {
      closeToastNow?: (channel: string, id?: string) => void;
      closeAndReplace?: () => void;
    };
    host.closeToastNow = (channel, id) => {
      (channel === 'manager' ? external : facade).close(id);
      synchronousFocus = node.ownerDocument.activeElement?.id ?? null;
    };
    return () => {
      delete host.closeToastNow;
      delete host.closeAndReplace;
    };
  }
</script>

<section
  class="lifecycle"
  data-testid="lifecycle"
  data-no-exit-animation={noExitAnimation ? '' : undefined}
  {@attach attach}
>
  <button id="outside">outside</button>
  <button onclick={() => (noExitAnimation = true)}>disable exit animation</button>
  <button
    onclick={() => {
      add('a', 'A');
      add('b', 'B');
      add('c', 'C');
    }}>add three</button
  >
  <button onclick={() => add('save', 'Saving…')}>add save</button>
  <button onclick={() => add('save', 'Saved')}>replace save</button>
  <button
    onclick={() =>
      facade.update('save', {
        title:
          'A notification with updated text that wraps across several lines in a narrow toast Root. '.repeat(
            3,
          ),
      })}>update save layout</button
  >
  <button onclick={() => add('timer', 'Timer', 50, true)}>add timer</button>
  <button onclick={() => main.querySelector<HTMLElement>('[data-testid="viewport"]')?.blur()}
    >blur viewport</button
  >
  <button
    onclick={() => {
      main.querySelector<HTMLElement>('[data-testid="viewport"]')?.blur();
      showViewport = false;
    }}>blur and hide viewport</button
  >
  <button
    onclick={() => {
      const node = main.querySelector<HTMLElement>('[data-testid="viewport"]');
      node?.blur();
      flushSync();
      node?.querySelector<HTMLElement>('[data-testid="root"]')?.focus();
    }}>blur then focus root</button
  >
  <button
    onclick={() => {
      main.querySelector<HTMLElement>('[data-testid="viewport"]')?.blur();
      viewportKey += 1;
      flushSync();
      main.querySelector<HTMLElement>('[data-testid="viewport"]')?.focus();
    }}>blur and replace viewport</button
  >
  <button onclick={() => (showViewport = false)}>hide viewport</button>
  <button onclick={() => (showViewport = true)}>show viewport</button>
  <button
    onclick={() =>
      facade.add({
        id: 'classes',
        title: 'Classes',
        timeout: 0,
        actionProps: { children: 'Act', class: { selected: true, hidden: false } },
      })}>add class action</button
  >
  <button
    onclick={() =>
      facade.update('classes', {
        actionProps: {
          children: 'Act',
          class: ['manager', ['selected', false], { hidden: false }],
        },
      })}>array action class</button
  >
  <button onclick={() => add('old', 'Old', 0, false, () => add('fresh', 'Fresh', 50))}
    >add exiting prior target</button
  >
  <button onclick={() => addNestedClose('focused')}>add nested focused close</button>
  <button onclick={() => addNestedClose('immediate')}>add nested immediate close</button>
  <button onclick={() => addNestedClose('unfocused')}>add nested unfocused close</button>
  <button onclick={() => addNestedClose('all')}>add nested close all</button>
  <button onclick={() => addConsumerBlur(false)}>add callback blur</button>
  <button onclick={() => addConsumerBlur(true)}>add replacement blur</button>
  <button onclick={() => addDescendantReplacement()}>add descendant replacement</button>
  <button onclick={() => addDescendantReplacement(true)}
    >add descendant replacement with sibling</button
  >
  <button
    onclick={() => {
      immediateFocusedExit = true;
      add('a', 'Older');
      facade.add({
        id: 'b',
        title: 'Closing',
        timeout: 0,
        onRemove: () => (main.ownerDocument.activeElement as HTMLElement).blur(),
      });
    }}>add removal blur</button
  >
  <button onclick={() => addFocusCascade(false)}>add focus cascade</button>
  <button onclick={() => addFocusCascade(true)}>add focus replacement</button>
  <button onclick={() => add('callback', 'Closing', 0, false, () => add('fresh', 'Fresh'))}
    >add callback sibling</button
  >
  <button onclick={() => add('callback', 'Old', 0, false, () => add('callback', 'Fresh', 50))}
    >add callback replacement</button
  >
  {#key viewportKey}{#if showViewport}<Toast.Viewport data-testid="viewport">
        {#each facade.toasts as toast, index (indexKeys ? index : toast.id)}
          <Toast.Root
            {toast}
            swipeDirection={[]}
            id={`root-${toast.id}`}
            data-testid="root"
            data-toast-id={toast.id}
            style={narrowRoots ? 'width:180px' : undefined}
            data-immediate-exit={immediateFocusedExit && toast.id === 'b' ? '' : undefined}
            onfocus={() => {
              if (closeSuccessorOnFocus && toast.id === 'b') {
                closeSuccessorOnFocus = false;
                facade.close('b');
              }
            }}
          >
            <Toast.Title />
            <Toast.Action class="own" data-testid="action" />
            <Toast.Close aria-label={`close ${toast.id}`} />
          </Toast.Root>
        {/each}
      </Toast.Viewport>{/if}{/key}
  <output data-testid="close-observations">{JSON.stringify(closed)}</output>
  <output data-testid="remove-observations">{JSON.stringify(removed)}</output>
  <output data-testid="synchronous-focus">{synchronousFocus}</output>
</section>

<style>
  :global(.lifecycle [data-ending-style]) {
    animation: toast-exit 10s linear;
  }
  :global(.lifecycle [data-ending-style][data-immediate-exit]) {
    animation: none;
  }
  :global(.lifecycle[data-no-exit-animation] [data-ending-style]) {
    animation: none;
  }
  @keyframes -global-toast-exit {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
</style>
