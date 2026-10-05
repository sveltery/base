<script lang="ts" generics="Payload = unknown">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Original DialogTrigger composition, shared popup registration/click/button/rendering (MIT).
  import { useButton } from '../internals/use-button/useButton.svelte.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { CLICK_TRIGGER_IDENTIFIER } from '../internals/constants.js';
  import { useDialogRootContext } from './context.js';
  import { usePopupHandleStore } from '../utils/popups/usePopupHandleStore.svelte.js';
  import { useTriggerDataForwarding } from '../utils/popups/popupStoreUtils.svelte.js';
  import { useClick } from '../floating-ui/hooks/useClick.svelte.js';
  import { useOpenMethodTriggerProps } from '../utils/useOpenInteractionType.svelte.js';
  import { triggerOpenStateMapping } from '../utils/popupStateMapping.js';
  import type { DialogHandleStore } from './store/DialogStore.svelte.js';
  import type { TriggerProps } from './types.js';
  let {
    children,
    render,
    class: className,
    style,
    disabled = false,
    nativeButton = true,
    id: idProp,
    handle,
    payload,
    ref = $bindable(),
    ...elementProps
  }: TriggerProps<Payload> = $props();
  const generatedId = $props.id();
  const contained = useDialogRootContext(true);
  const handleStore = usePopupHandleStore(() => handle);
  const store: DialogHandleStore<unknown> = $derived.by(() => {
    const value = handleStore.store ?? contained;
    if (!value)
      throw new Error(
        'Base UI: <Dialog.Trigger> must be used within <Dialog.Root> or provided with a handle.',
      );
    return value;
  });
  const thisTriggerId = $derived(useBaseUiId(idProp ?? undefined, generatedId));
  const triggerElementRef: { current: HTMLElement | null } = { current: null };
  const forwarding = useTriggerDataForwarding(
    () => thisTriggerId,
    triggerElementRef,
    () => store,
    () => ({ payload }),
  );
  const { getButtonProps, buttonRef } = useButton(() => ({
    disabled,
    native: nativeButton,
  }));
  const click = useClick(() => store.select('floatingRootContext'));
  const interactionTypeProps = useOpenMethodTriggerProps(
    () => store.select('open'),
    (interactionType) => store.set('openMethod', interactionType),
  );
  const state = $derived({
    disabled,
    open: store.select('isOpenedByTrigger', thisTriggerId),
  });
  const popupId = $derived(store.select('triggerPopupId', thisTriggerId));
  const rootTriggerProps = $derived(
    store.select('triggerProps', forwarding.isMountedByThisTrigger),
  );

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      buttonRef?.(host);
      forwarding.registerTrigger?.(host);
      triggerElementRef.current = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          buttonRef?.(null);
          forwarding.registerTrigger?.(null);
          if (triggerElementRef.current === host)
            triggerElementRef.current = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      state,
      { class: className, style: style },
      [
        click.reference,
        rootTriggerProps,
        interactionTypeProps,
        {
          [CLICK_TRIGGER_IDENTIFIER]: '',
          id: thisTriggerId,
          'aria-haspopup': 'dialog',
          'aria-expanded': state.open,
          'aria-controls': popupId,
        },
        elementProps,
        getButtonProps,
      ],
      triggerOpenStateMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <button {...mergedProps}>{@render children?.()}</button>
{/if}
