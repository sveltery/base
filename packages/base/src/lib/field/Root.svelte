<script lang="ts">
  // Base UI v1.8.0 FieldRoot; MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import { resolveFieldProps } from './props.js';
  import { getFieldsetContext } from '../fieldset/context.js';
  import { getFormContext } from '../form/context.js';
  import { setFieldContext } from './context.js';
  import { createFieldController } from './controller.svelte.js';
  import { createLabelableContext } from './labelable.svelte.js';
  import { stateAttributes } from './state.js';
  import type { FieldRootActions, FieldRootProps } from './types.js';
  let { children, render, name, validate, disabled: disabledProp = false, invalid, dirty, touched, validationMode, validationDebounceTime = 0, actionsRef, ref = $bindable(), ...props }: FieldRootProps = $props();
  const fieldset = getFieldsetContext(true);
  const form = getFormContext();
  const instanceId = $props.id();
  createLabelableContext(`base-ui-${instanceId}`);
  const controller = createFieldController(() => ({ name, validate, disabled: Boolean(fieldset?.disabled || disabledProp), invalid, dirty, touched, validationMode, validationDebounceTime }), form);
  setFieldContext(controller);
  const actions: FieldRootActions = { validate: controller.validate };
  $effect(() => {
    const target = actionsRef;
    if (!target) return;
    target.current = actions;
    return () => { if (target.current === actions) target.current = null; };
  });
</script>
<Element tag="div" internal={stateAttributes(controller.state)} props={resolveFieldProps(props, controller.state)} state={controller.state} {render} {children} bind:ref />
