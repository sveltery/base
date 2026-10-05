<script lang="ts" generics="Payload = unknown">
  // Original DialogTrigger composition, shared popup registration/click/button/rendering (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
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
  const { getButtonProps, buttonRef } = useButton(() => ({ disabled, native: nativeButton }));
  const click = useClick(() => store.select('floatingRootContext'));
  const interactionTypeProps = useOpenMethodTriggerProps(
    () => store.select('open'),
    (interactionType) => store.set('openMethod', interactionType),
  );
  const state = $derived({ disabled, open: store.select('isOpenedByTrigger', thisTriggerId) });
  const popupId = $derived(store.select('triggerPopupId', thisTriggerId));
  const rootTriggerProps = $derived(
    store.select('triggerProps', forwarding.isMountedByThisTrigger),
  );
</script>

<RenderElement
  tag="button"
  componentProps={{ render, class: className, style }}
  params={{
    state,
    ref: [buttonRef, forwarding.registerTrigger, triggerElementRef],
    props: [
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
    stateAttributesMapping: triggerOpenStateMapping,
  }}
  {children}
  bind:element={ref}
/>
