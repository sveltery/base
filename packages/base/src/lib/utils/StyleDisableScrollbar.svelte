<script lang="ts">
  // Base UI v1.8.0 styleDisableScrollbar.getElement native markup boundary; MIT.
  import { styleDisableScrollbar } from './styles.js';
  let { nonce }: { nonce?: string | undefined } = $props();
</script>

<!-- A native style element remains within its owning Root; the constant CSS is text. -->
<svelte:element this={"style"} {nonce}>{styleDisableScrollbar.css}</svelte:element>
