<script lang="ts">
  import { onMount } from 'svelte';
  import { Meter } from '../../../../packages/base/src/lib/meter/index.js';
  let hydrated = $state(false);
  onMount(() => {
    hydrated = true;
  });
</script>

<main data-hydrated={hydrated}
  ><Meter.Root value={30} id="ssr-meter"
    ><Meter.Label>SSR label</Meter.Label><Meter.Value data-testid="ssr-value" /><Meter.Track
      ><Meter.Indicator /></Meter.Track
    ></Meter.Root
  ></main
>
