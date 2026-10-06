<script lang="ts">
  import { onMount } from 'svelte';
  import { Progress } from '../../../../packages/base/src/lib/progress/index.js';
  let hydrated = $state(false);
  onMount(() => {
    hydrated = true;
  });
</script>

<main data-hydrated={hydrated}
  ><Progress.Root value={30} id="ssr-progress"
    ><Progress.Label>SSR label</Progress.Label><Progress.Value
      data-testid="ssr-value"
    /><Progress.Track><Progress.Indicator /></Progress.Track></Progress.Root
  ></main
>
