<!-- Adapted Base UI docs/src/components/Accordion.tsx Item/Trigger at47b40521; MIT2019 Material-UI SAS. Native details/summary remain source primitives. -->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  let {
    id,
    label,
    trigger,
    children,
  }: { id: string; label: string; trigger?: Snippet; children?: Snippet } =
    $props();
  let detailsRef: HTMLDetailsElement;
  let open = $state(false);
  onMount(() => {
    const checkHash = () => {
      const triggerId = detailsRef.querySelector('summary')?.getAttribute('id');
      const hash = window.location.hash.slice(1);
      if (triggerId && hash && triggerId === hash) open = true;
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  });
</script>

<details
  bind:this={detailsRef}
  open={open || undefined}
  class="AccordionItem"
  ontoggle={(event) => (open = event.currentTarget.open)}
>
  <summary
    {id}
    aria-label={label}
    class="AccordionTrigger ReferenceTrigger"
    onclick={(event) => {
      if (!window.getSelection()?.isCollapsed) event.preventDefault();
    }}
    onmousedown={(event) => {
      if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
    }}>{@render trigger?.()}</summary
  >
  <div class="AccordionPanel">
    <div class="AccordionContent">{@render children?.()}</div>
  </div>
</details>
