<script lang="ts">
  // Original NavigationMenuList branches and canonical Composite/hover/dismiss composition (MIT).
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import CompositeRoot from '../internals/composite/root/CompositeRoot.svelte';
  import { useHoverFloatingInteraction } from '../floating-ui/hooks/useHoverFloatingInteraction.svelte.js';
  import { useDismiss } from '../floating-ui/hooks/useDismiss.svelte.js';
  import { getTarget } from '../floating-ui/utils/element.js';
  import { getEmptyRootContext } from '../floating-ui/utils/getEmptyRootContext.js';
  import {
    useNavigationMenuRootContext,
    useNavigationMenuTreeContext,
  } from './root/NavigationMenuRootContext.js';
  import { provideNavigationMenuDismissContext } from './list/NavigationMenuDismissContext.js';
  import { NAVIGATION_MENU_TRIGGER_IDENTIFIER } from './utils/constants.js';
  import type { NavigationMenuListProps } from './types.js';
  import type { HTMLProps } from '../internals/types.js';
  let {
    ref = $bindable(null),
    render,
    class: classProp,
    style,
    children,
    ...elementProps
  }: NavigationMenuListProps = $props();
  const root = useNavigationMenuRootContext();
  const nodeId = useNavigationMenuTreeContext();
  const fallbackContext = getEmptyRootContext();
  const context = $derived(root.floatingRootContext || fallbackContext);
  const interactionsEnabled = $derived(root.positionerElement != null || root.value == null);
  const hoverInteractionsEnabled = $derived(
    root.positionerElement != null || root.viewportElement != null || root.value == null,
  );
  useHoverFloatingInteraction(
    () => context,
    () => ({
      enabled: Boolean(root.floatingRootContext) && hoverInteractionsEnabled,
      closeDelay: root.closeDelay,
      nodeId,
    }),
  );
  const dismiss = useDismiss(
    () => context,
    () => ({
      enabled: interactionsEnabled,
      outsidePressEvent: 'intentional',
      outsidePress(event) {
        const target = getTarget(event) as HTMLElement | null;
        const closest = target?.closest(`[${NAVIGATION_MENU_TRIGGER_IDENTIFIER}]`);
        return closest === null;
      },
    }),
  );
  const dismissProps = $derived(root.floatingRootContext ? dismiss : undefined);
  provideNavigationMenuDismissContext(() => dismissProps);
  const state = $derived({ open: root.open });
  const defaultProps = $derived<HTMLProps>(
    root.nested
      ? {}
      : {
          onkeydown(event: KeyboardEvent) {
            const shouldStop =
              (root.orientation === 'horizontal' &&
                (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) ||
              (root.orientation === 'vertical' &&
                (event.key === 'ArrowUp' || event.key === 'ArrowDown'));
            if (shouldStop) event.stopPropagation();
          },
        },
  );
  const renderProps = $derived([dismissProps?.floating || {}, defaultProps, elementProps]);
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;

      return () =>
        untrack(() => {
          if (ref === host) ref = null;
        });
    });
  }
  const params = $derived({ state, props: renderProps });
  const mergedProps = $derived({
    ...mergeComponentProps(state, { class: classProp, style }, params.props, undefined),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#snippet listRender(
  props: import('../internals/types.js').HTMLProps,
  state: { open: boolean },
  children: import('svelte').Snippet | undefined,
)}
  {#if render}{@render render(props, state, children)}{:else}<ul {...props}
      >{@render children?.()}</ul
    >{/if}
{/snippet}
{#if root.nested}
  {#if render}{@render render(mergedProps, state, children)}{:else}<ul {...mergedProps}
      >{@render children?.()}</ul
    >{/if}
{:else}
  <CompositeRoot
    render={listRender}
    class={classProp}
    {style}
    {state}
    props={[...renderProps, { [hostAttachmentKey]: attachHost }]}
    loopFocus={false}
    orientation={root.orientation}
    {children}
  />
{/if}
