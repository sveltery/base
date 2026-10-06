<script lang="ts">
  import CollapsibleDimensionsFixture from '$lib/CollapsibleDimensionsFixture.svelte';
  let { data } = $props();
</script>

<CollapsibleDimensionsFixture {...data} />
