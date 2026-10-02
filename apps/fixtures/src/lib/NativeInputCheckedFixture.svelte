<script lang="ts">
  // Direct native Svelte props: characterization only, with no binding or consumer adapter.
  import { untrack } from 'svelte';
  let { initial = false }: { initial?: boolean } = $props();
  let checked = $state(untrack(() => initial));
  let events = $state<string[]>([]);
</script>
<form><input type="checkbox" {checked} defaultChecked={false} oninput={event => events.push(event.type)} /></form>
<output>{JSON.stringify(events)}</output>
