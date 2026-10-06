<script lang="ts">
  let { overrideHidden = false }: { overrideHidden?: boolean } = $props();
  let alternate = $state(false);
  const attributes = { hidden: 'until-found' as const, 'data-testid': 'bare-hidden-panel' };
  export function replace() {
    alternate = true;
  }
</script>

{#if alternate}
  <section {...attributes} {...overrideHidden ? { hidden: false } : {}}>Native panel</section>
{:else}
  <div {...attributes} {...overrideHidden ? { hidden: false } : {}}>Native panel</div>
{/if}
