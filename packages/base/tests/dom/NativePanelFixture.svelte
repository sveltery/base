<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Collapsible, type CollapsiblePanelState } from '../../src/lib/collapsible/index.js';
  import { Accordion, type AccordionPanelState } from '../../src/lib/accordion/index.js';
  import type { HTMLProps } from '../../src/lib/internals/types.js';
  let {
    family = 'collapsible',
    cancel = false,
  }: { family?: 'collapsible' | 'accordion'; cancel?: boolean } = $props();
  let disabled = $state(false);
  let replacement = $state(false);
  let panel = $state<HTMLElement | null>();
  let ownedHeight = $state<string | undefined>();
  const bareStyle = 'height:73px';
  const requests: { open: boolean; reason: string }[] = [];
  function change(open: boolean, details: { reason: string; cancel: () => void }) {
    requests.push({ open, reason: details.reason });
    if (cancel && details.reason === 'none') details.cancel();
  }
  export function replaceHost() {
    replacement = !replacement;
  }
  export function setDisabled(value: boolean) {
    disabled = value;
  }
  export function setHeight(value: string | undefined) {
    ownedHeight = value;
  }
  export function snapshot() {
    return { panel, requests };
  }
</script>

{#snippet sectionHost(
  props: HTMLProps,
  _state: CollapsiblePanelState | AccordionPanelState,
  children: Snippet | undefined,
)}
  <section {...props} style:height={ownedHeight}>
    {@render children?.()}
  </section>
{/snippet}
{#snippet articleHost(
  props: HTMLProps,
  _state: CollapsiblePanelState | AccordionPanelState,
  children: Snippet | undefined,
)}
  <article {...props} style:height={ownedHeight}>
    {@render children?.()}
  </article>
{/snippet}
<section data-bare style={bareStyle} style:height={ownedHeight}> Bare Svelte host </section>
{#if family === 'collapsible'}
  <Collapsible.Root {disabled} onOpenChange={change}>
    <Collapsible.Trigger id="native-panel-trigger">Toggle panel</Collapsible.Trigger>
    <Collapsible.Panel
      id="native-panel"
      hiddenUntilFound
      style="height:73px"
      bind:ref={panel}
      render={replacement ? articleHost : sectionHost}>Panel children</Collapsible.Panel
    >
  </Collapsible.Root>
{:else}
  <Accordion.Root
    {disabled}
    hiddenUntilFound
    onValueChange={(value, details) => change(value.includes('item'), details)}
  >
    <Accordion.Item value="item">
      <Accordion.Header
        ><Accordion.Trigger id="native-panel-trigger">Toggle panel</Accordion.Trigger
        ></Accordion.Header
      >
      <Accordion.Panel
        id="native-panel"
        style="height:73px"
        bind:ref={panel}
        render={replacement ? articleHost : sectionHost}>Panel children</Accordion.Panel
      >
    </Accordion.Item>
  </Accordion.Root>
{/if}
