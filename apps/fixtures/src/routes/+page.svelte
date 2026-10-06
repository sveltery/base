<script>
  import { resolve } from '$app/paths';
</script>

<svelte:head><title>Sveltery Base fixtures</title></svelte:head>
<main>
  <h1>Sveltery Base fixtures</h1>
  <p>Unofficial Svelte 5 port of Base UI. Contained Dialog draft; browser acceptance is pending.</p>
  <p>Reference: Base UI v1.8.0. No component compatibility is claimed yet.</p>
  <a href={resolve('/dialog')}>Svelte Dialog</a> ·
  <a href={resolve('/reference')}>Pinned React reference</a>
  · <a href={resolve('/dialog-ssr')}>SSR ID fixture</a>
</main>
