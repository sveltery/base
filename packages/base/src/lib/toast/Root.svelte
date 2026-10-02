<script lang="ts">
  // Derived from Base UI v1.8.0 ToastRoot; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import { flushSync, untrack } from 'svelte';
  import Element from '../dialog/Element.svelte';
  import { provider } from './context.js';
  import { setRootContext, type ToastRootContext } from './root-context.js';
  import { selectors } from './store.js';
  import { afterAnimations } from './animations.js';
  import { activeElement, contains } from './viewport-focus.js';
  import type { ToastRootProps } from './types.js';

  let { toast, swipeDirection, children, ref = $bindable(), ...props }: ToastRootProps = $props();
  const store = provider().store;
  let node = $state<HTMLElement | null>(null);
  let title = $state.raw<{ id: string | undefined }>();
  let description = $state.raw<{ id: string | undefined }>();
  let registeredId: string | undefined;
  let registeredLifecycle: object | undefined;
  const snapshot = $derived(store.getSnapshot());
  const expanded = $derived(selectors.expanded(snapshot));
  const focused = $derived(snapshot.focused);
  const visibleIndex = $derived(selectors.toastVisibleIndex(snapshot, toast.id));
  const domIndex = $derived(selectors.toastIndex(snapshot, toast.id));
  const offsetY = $derived(selectors.toastOffsetY(snapshot, toast.id));
  const lifecycle = $derived.by(() => { void snapshot.toasts; return store.getLifecycle(toast.id); });

  function recalculateHeight(flush = false) {
    if (!node) return;
    if (registeredId !== undefined && registeredId !== toast.id) {
      store.clearToastRef(registeredId, node, registeredLifecycle);
    }
    registeredId = toast.id;
    registeredLifecycle = store.getLifecycle(toast.id);
    const previousHeight = node.style.height;
    node.style.height = 'auto';
    const height = node.offsetHeight;
    node.style.height = previousHeight;
    const update = () => store.updateToastInternal(toast.id, { ref: node, height, transitionStatus: undefined });
    if (flush) flushSync(update); else update();
  }
  const context: ToastRootContext = {
    get toast() { return toast; },
    get expanded() { return expanded; },
    get visibleIndex() { return visibleIndex; },
    get titleId() { return title?.id; },
    get descriptionId() { return description?.id; },
    setTitleId(id) {
      const registration = { id }; title = registration;
      return () => { if (title === registration) title = undefined; };
    },
    setDescriptionId(id) {
      const registration = { id }; description = registration;
      return () => { if (description === registration) description = undefined; };
    },
    recalculateHeight,
  };
  setRootContext(context);
  function attach(element: HTMLElement) {
    node = element;
    return () => {
      if (node === element) node = null;
      if (registeredId !== undefined) store.clearToastRef(registeredId, element, registeredLifecycle);
    };
  }
  $effect(() => {
    if (swipeDirection.length) throw new Error('Base UI: this Toast.Root slice requires swipeDirection={[]}.');
  });
  // Prop clones and index-keyed roots rebind to the store lifecycle, rather than object identity.
  $effect(() => {
    const element = node;
    const id = toast.id;
    const status = toast.transitionStatus;
    const token = lifecycle;
    if (!element || !token) return;
    if (status === 'ending') {
      return untrack(() => afterAnimations(element, () => store.removeToast(id, false, token)));
    }
    if (status === 'starting' || untrack(() => selectors.toast(store.getSnapshot(), id)?.ref) !== element) {
      untrack(recalculateHeight);
    }
  });
  const rootState = $derived({ transitionStatus: toast.transitionStatus, expanded, limited: !!toast.limited,
    type: toast.type, swiping: false as const, swipeDirection: undefined });
  const internal = $derived({ role: toast.priority === 'high' ? 'alertdialog' : 'dialog', tabindex: 0,
    'aria-modal': false, 'aria-labelledby': title?.id, 'aria-describedby': description?.id,
    'aria-hidden': toast.priority === 'high' && !focused ? true : undefined, inert: toast.limited ? true : undefined,
    'data-starting-style': toast.transitionStatus === 'starting' ? '' : undefined,
    'data-ending-style': toast.transitionStatus === 'ending' ? '' : undefined,
    'data-expanded': expanded ? '' : undefined, 'data-limited': toast.limited ? '' : undefined,
    'data-type': toast.type,
    style: { '--toast-index': toast.transitionStatus === 'ending' ? domIndex : visibleIndex,
      '--toast-offset-y': `${offsetY}px`, '--toast-height': toast.height ? `${toast.height}px` : undefined,
      '--toast-swipe-movement-x': '0px', '--toast-swipe-movement-y': '0px' },
    onkeydown: (event: KeyboardEvent) => {
      if (event.key === 'Escape' && node && contains(node, activeElement(node.ownerDocument))) store.closeToast(toast.id);
    },
  });
</script>
<Element {internal} {props} state={rootState} {children} bind:ref {attach}/>
