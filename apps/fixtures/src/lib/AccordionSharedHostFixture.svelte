<script lang="ts">
  // Supplemental shared-host registration repair; no ordinary declaration credit.
  import { onMount, type Snippet } from 'svelte';
  import { Accordion, type AccordionItemProps, type AccordionItemState } from '@sveltery/base';
  let hydrated = $state(false);
  const indexes = { outer: -1, inner: -1, sibling: -1 };
  function record(part: keyof typeof indexes, state: AccordionItemState) {
    indexes[part] = state.index;
    return `${part}-${state.index}`;
  }
  onMount(() => {
    hydrated = true;
    (window as Window & { accordionSharedIndexes?: typeof indexes }).accordionSharedIndexes =
      indexes;
    return () => {
      delete (window as Window & { accordionSharedIndexes?: typeof indexes })
        .accordionSharedIndexes;
    };
  });
</script>

{#snippet shared(
  props: Record<string | symbol, unknown>,
  _state: AccordionItemState,
  _children: Snippet | undefined,
)}
  <Accordion.Item
    {...props as AccordionItemProps}
    value="inner"
    class={(state) => record('inner', state)}
    data-testid="shared-host"
    ><Accordion.Trigger>Shared trigger</Accordion.Trigger><Accordion.Panel
      >Shared panel</Accordion.Panel
    ></Accordion.Item
  >
{/snippet}
<main data-hydrated={hydrated}
  ><Accordion.Root
    ><Accordion.Item
      value="outer"
      class={(state) => record('outer', state)}
      render={shared}
    /><Accordion.Item
      value="sibling"
      class={(state) => record('sibling', state)}
      data-testid="sibling-host"
    /></Accordion.Root
  ></main
>
