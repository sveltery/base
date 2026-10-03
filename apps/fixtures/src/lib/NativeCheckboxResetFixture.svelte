<script lang="ts">
  import { onMount } from 'svelte';
  let checked = $state(false);
  let hydrated = $state(false);
  onMount(() => {
    hydrated = true;
  });
</script>
<main data-hydrated={hydrated} data-framework="native-svelte">
  <form id="form">
    <input data-control type="checkbox" name="enabled" value="yes" defaultChecked={false} bind:checked />
    <button id="reset" type="reset">Reset</button>
  </form>
  <output id="owner">{String(checked)}</output>
</main>
