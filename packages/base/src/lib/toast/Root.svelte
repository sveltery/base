<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  // Derived from Base UI v1.8.0 ToastRoot; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import { flushSync, untrack } from 'svelte';
  import { provider } from './context.js';
  import { setRootContext, type ToastRootContext } from './root-context.js';
  import { useOpenChangeComplete } from '../internals/useOpenChangeComplete.svelte.js';
  import { activeElement, contains } from '@sveltery/utils/shadowDom';
  import type { ToastRootProps } from './types.js';

  let {
    render,
    toast,
    swipeDirection,
    children,
    ref = $bindable(),
    ...props
  }: ToastRootProps = $props();
  const store = provider().store;
  let node = $state<HTMLElement | null>(null);
  let titleId = $state<string>();
  let descriptionId = $state<string>();
  let lastToastId: string | undefined;
  let lastHost: HTMLElement | null = null;
  const expanded = $derived(store.useState('expanded'));
  const focused = $derived(store.useState('focused'));
  const visibleIndex = $derived(store.useState('toastVisibleIndex', toast.id));
  const domIndex = $derived(store.useState('toastIndex', toast.id));
  const offsetY = $derived(store.useState('toastOffsetY', toast.id));

  useOpenChangeComplete({
    get open() {
      return toast.transitionStatus !== 'ending';
    },
    ref: {
      get current() {
        return node;
      },
    },
    onComplete() {
      if (toast.transitionStatus === 'ending') store.removeToast(toast.id);
    },
  });

  function recalculateHeight(flush = false) {
    if (!node) return;
    const previousHeight = node.style.height;
    node.style.height = 'auto';
    const height = node.offsetHeight;
    node.style.height = previousHeight;
    const update = () =>
      store.updateToastInternal(toast.id, {
        ref: node,
        height,
        transitionStatus: undefined,
      });
    if (flush) flushSync(update);
    else update();
  }
  const context: ToastRootContext = {
    get toast() {
      return toast;
    },
    get expanded() {
      return expanded;
    },
    get visibleIndex() {
      return visibleIndex;
    },
    get titleId() {
      return titleId;
    },
    get descriptionId() {
      return descriptionId;
    },
    setTitleId(id) {
      titleId = id;
      return () => {
        if (titleId === id) titleId = undefined;
      };
    },
    setDescriptionId(id) {
      descriptionId = id;
      return () => {
        if (descriptionId === id) descriptionId = undefined;
      };
    },
    recalculateHeight,
  };
  setRootContext(context);
  function attach(element: HTMLElement) {
    node = element;
    return () => {
      if (node === element) node = null;
    };
  }
  $effect(() => {
    if (swipeDirection.length)
      throw new Error('Base UI: this Toast.Root slice requires swipeDirection={[]}.');
  });
  // Capture the actual native host/ID pair for binding cleanup.
  $effect(() => {
    const element = node;
    const id = toast.id;
    if (!element) return;
    return () => untrack(() => store.clearToastRef(id, element));
  });
  $effect(() => {
    const element = node;
    const id = toast.id;
    const status = toast.transitionStatus;
    if (!element) return;
    if (status !== 'starting' && lastToastId === id && lastHost === element) return;
    lastToastId = id;
    lastHost = element;
    untrack(recalculateHeight);
  });
  const rootState = $derived({
    transitionStatus: toast.transitionStatus,
    expanded,
    limited: !!toast.limited,
    type: toast.type,
    swiping: false as const,
    swipeDirection: undefined,
  });
  const internal = $derived({
    role: toast.priority === 'high' ? 'alertdialog' : 'dialog',
    tabindex: 0,
    'aria-modal': false,
    'aria-labelledby': titleId,
    'aria-describedby': descriptionId,
    'aria-hidden': toast.priority === 'high' && !focused ? true : undefined,
    inert: toast.limited ? true : undefined,
    'data-starting-style': toast.transitionStatus === 'starting' ? '' : undefined,
    'data-ending-style': toast.transitionStatus === 'ending' ? '' : undefined,
    'data-expanded': expanded ? '' : undefined,
    'data-limited': toast.limited ? '' : undefined,
    'data-type': toast.type,
    style: {
      '--toast-index': toast.transitionStatus === 'ending' ? domIndex : visibleIndex,
      '--toast-offset-y': `${offsetY}px`,
      '--toast-height': toast.height ? `${toast.height}px` : undefined,
      '--toast-swipe-movement-x': '0px',
      '--toast-swipe-movement-y': '0px',
    },
    onkeydown: (event: KeyboardEvent) => {
      if (event.key === 'Escape' && node && contains(node, activeElement(node.ownerDocument)))
        store.closeToast(toast.id);
    },
  });

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      const disposeHost = attach(host);
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          disposeHost?.();
        });
    });
  }
  const mergedProps = $derived.by(() => {
    const { class: className, style, ...attributes } = props;
    return {
      ...mergeComponentProps(rootState, { class: className, style }, [internal, attributes], false),
      [hostAttachmentKey]: attachHost,
    };
  });
</script>

{#if render}
  {@render render(mergedProps, rootState, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
