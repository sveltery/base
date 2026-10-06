<script lang="ts">
  import Demo from '../src/lib/docs/Demo.svelte';
  let mounted = $state(true);
</script>

<div
  role="none"
  onclick={(event) => {
    if (
      (event.target as HTMLElement)
        .closest('.DemoCollapseButton')
        ?.textContent?.includes('Hide code')
    ) {
      mounted = false;
    }
  }}
>
  {#if mounted}<Demo code={'line\n'.repeat(10)}>Example</Demo>{/if}
</div>
