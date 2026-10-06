<script lang="ts">
  // Native markup/lifetime boundary for Base UI PrehydrationScript at 47b40521; MIT.
  import { useIsHydrating } from '../utils/useIsHydrating.svelte.js';
  import { getCSPContext } from '../csp-provider/context.js';
  let { script }: { script: string } = $props();
  const csp = getCSPContext();
  const isHydrating = useIsHydrating();
  function escapeNonce(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  // Whole-tag raw HTML leaves Svelte's hydration markers outside the script body.
  // Native HTML insertion is inert in CSR; the SSR HTML parser executes it once.
  const html = $derived(
    `<script${csp.nonce === undefined ? '' : ` nonce="${escapeNonce(csp.nonce)}"`}>${script}</` +
      'script>',
  );
</script>

{#if isHydrating()}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- Trusted immutable Source script; nonce is escaped. -->
  {@html html}
{/if}
