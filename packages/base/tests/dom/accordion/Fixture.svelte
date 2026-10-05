<script lang="ts">
  // Assertions derived from Base UI v1.8.0 (MIT); parity/accordion/UPSTREAM_LICENSE.
  import { untrack } from 'svelte';
  import {
    Accordion,
    type AccordionRootChangeEventDetails,
    type AccordionItemState,
  } from '../../../src/lib/accordion/index.js';
  let { scenario = 'default' }: { scenario?: string } = $props();
  type Value = string | number;
  const initiallyOpen = untrack(() =>
    [
      'aria',
      'manual-panel',
      'manual-trigger',
      'changing-id',
      'removing-id',
      'parts',
      'disabled-root',
      'disabled-item',
      'cancel-close',
      'cancel-multiple-close',
    ].includes(scenario),
  );
  const custom = untrack(() => scenario === 'custom-default' || scenario === 'custom-controlled');
  let ownerValue = $state<Value[] | undefined>(
    untrack(() => (scenario.includes('controlled') ? (custom ? ['one'] : []) : undefined)),
  );
  let triggerId = $state<string | undefined>(
    untrack(() =>
      scenario === 'manual-trigger' || scenario === 'removing-id' ? 'custom-trigger-id' : undefined,
    ),
  );
  let parts = $state<'both' | 'trigger' | 'panel'>('both');
  const values: { value: Value[]; details: AccordionRootChangeEventDetails }[] = [];
  const opens: { open: boolean; details: AccordionRootChangeEventDetails }[] = [];
  const order: string[] = [];
  const states: AccordionItemState[] = [];
  const defaultValue: Value[] = custom ? ['first'] : initiallyOpen ? [0] : [];
  function changed(value: Value[], details: AccordionRootChangeEventDetails) {
    order.push('root');
    values.push({ value, details });
    if (
      scenario.startsWith('cancel-root') ||
      scenario === 'cancel-close' ||
      scenario.startsWith('cancel-multiple') ||
      scenario === 'cancel-controlled'
    )
      details.cancel();
    if (scenario === 'cancel-controlled' && !details.isCanceled) ownerValue = value;
  }
  function opened(open: boolean, details: AccordionRootChangeEventDetails) {
    order.push('item');
    opens.push({ open, details });
    if (scenario === 'cancel-item' || scenario === 'cancel-item-controlled') details.cancel();
  }
  function record(state: AccordionItemState) {
    states.push({ ...state });
    return '';
  }
  export function setTriggerId(value: string | undefined) {
    triggerId = value;
  }
  export function setParts(value: 'both' | 'trigger' | 'panel') {
    parts = value;
  }
  export function setValue(value: Value[] | undefined) {
    ownerValue = value;
  }
  export function snapshot() {
    return { values, opens, order, states };
  }
</script>

<Accordion.Root
  id="tested-root"
  value={ownerValue}
  {defaultValue}
  multiple={scenario === 'multiple' || scenario.startsWith('cancel-multiple')}
  disabled={scenario === 'disabled-root' || scenario === 'disabled-root-closed'}
  onValueChange={changed}
  keepMounted={scenario === 'root-keep' || scenario === 'root-hidden'
    ? true
    : scenario === 'root-warning'
      ? false
      : undefined}
  hiddenUntilFound={scenario === 'root-hidden' || scenario === 'root-warning'}
>
  <Accordion.Item
    data-testid="item1"
    value={custom ? (scenario === 'custom-default' ? 'first' : 'one') : 0}
    disabled={scenario === 'disabled-item' || scenario === 'disabled-item-closed'}
    onOpenChange={opened}
    class={record}
  >
    <Accordion.Header data-testid="header1">
      {#if parts !== 'panel'}
        <Accordion.Trigger
          id={triggerId}
          data-testid="trigger1"
          disabled={scenario.startsWith('disabled') ? false : undefined}
          onmouseup={scenario === 'mouseup' ? (event) => event.preventBaseUIHandler() : undefined}
          >Trigger 1</Accordion.Trigger
        >
      {/if}
    </Accordion.Header>
    {#if parts !== 'trigger'}
      <Accordion.Panel
        data-testid="panel1"
        id={scenario === 'manual-panel' ? 'custom-panel-id' : undefined}
        keepMounted={scenario === 'panel-warning' ? false : undefined}
        hiddenUntilFound={scenario === 'panel-warning' ? true : undefined}
        >Panel contents 1</Accordion.Panel
      >
    {/if}
  </Accordion.Item>
  <Accordion.Item data-testid="item2" value={custom ? 'second' : 1} onOpenChange={opened}>
    <Accordion.Header data-testid="header2"
      ><Accordion.Trigger data-testid="trigger2">Trigger 2</Accordion.Trigger></Accordion.Header
    >
    <Accordion.Panel
      data-testid="panel2"
      keepMounted={scenario === 'root-hidden' ? false : undefined}
      hiddenUntilFound={scenario === 'root-hidden' ? false : undefined}
      >Panel contents 2</Accordion.Panel
    >
  </Accordion.Item>
</Accordion.Root>
