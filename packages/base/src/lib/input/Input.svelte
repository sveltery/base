<script lang="ts">
  // Mechanically ported from Base UI v1.8.0 input/Input.tsx.
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import FieldControl from '../field/Control.svelte';
  import type { InputProps } from './types.js';
  let { ref = $bindable(), ...props }: InputProps = $props();
</script>
<FieldControl {...props} bind:ref />
