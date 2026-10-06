<script lang="ts">
  // Original Base UI v1.8.0 ToastPortal delegates FloatingPortalLite.
  // MIT: THIRD_PARTY_NOTICES.md; pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
  import FloatingPortalLite from '../utils/FloatingPortalLite.svelte';
  import type { ToastPortalProps } from './types.js';
  let { ref = $bindable(), ...props }: ToastPortalProps = $props();
</script>

<FloatingPortalLite {...props} bind:ref />
