<script lang="ts">
  // Original MenuRadioGroup controlled/cancellation/label/context composition (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { useControlled } from '../utils/useControlled.svelte.js';
  import { useStableCallback } from '../utils/useStableCallback.js';
  import { provideMenuRadioGroupContext } from './radio-group/MenuRadioGroupContext.js';
  import { provideMenuGroupContext, type MenuGroupContext } from './group/MenuGroupContext.js';
  import type { MenuRadioGroupProps, MenuRadioGroup } from './types.js';
  let { render, class: className, value: valueProp, defaultValue, onValueChange: onValueChangeProp, disabled = false, style, 'aria-labelledby': ariaLabelledByProp, children, ref = $bindable(null), ...elementProps }: MenuRadioGroupProps = $props();
  let labelId = $state<string | undefined>(undefined);
  const [getValue, setValueUnwrapped] = useControlled(() => ({ controlled: valueProp, default: defaultValue, name: 'MenuRadioGroup' }));
  const value = $derived(getValue());
  const setValue = useStableCallback((newValue: unknown, eventDetails: MenuRadioGroup.ChangeEventDetails) => {
    onValueChangeProp?.(newValue, eventDetails);
    if (eventDetails.isCanceled) return;
    setValueUnwrapped(newValue);
  });
  const componentState = $derived({ disabled });
  const setLabelId: MenuGroupContext = value => { labelId = typeof value === 'function' ? value(labelId) : value; };
  provideMenuGroupContext(setLabelId);
  provideMenuRadioGroupContext({ get value() { return value; }, setValue, get disabled() { return disabled; } });
</script>
<RenderElement tag="div" componentProps={{ render, class: className, style }} params={{ state: componentState, props: { role: 'group', 'aria-labelledby': ariaLabelledByProp ?? labelId, 'aria-disabled': disabled || undefined, ...elementProps } }} bind:element={ref} {children} />
