<script lang="ts">
  import { Button } from '../lib/index.js';

  let clicks = $state(0);
</script>

<svelte:head>
  <title>Sveltery library preview</title>
  <meta
    name="description"
    content="Local preview of the public Sveltery component library."
  />
</svelte:head>

<main>
  <h1>Sveltery library preview</h1>
  <p>The public Button uses native Svelte state and events.</p>
  <Button onclick={() => clicks++}>Activate button</Button>
  <p aria-live="polite">Activations: {clicks}</p>
  <p>
    <a href="https://github.com/sveltery/base"
      >Source and compatibility documentation</a
    >
  </p>
</main>
