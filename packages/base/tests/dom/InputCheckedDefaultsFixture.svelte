<script lang="ts">
  import { Input } from '../../src/lib/input/index.js';
  import type { InputProps } from '../../src/lib/input/types.js';
  // checked=null is a raw runtime characterization outside the native boolean declaration.
  let { inputProps }: { inputProps: Record<string, unknown> } = $props();
</script>

<form><Input {...inputProps as InputProps} /></form>
