<script lang="ts">
  import { useLabel } from '../../src/lib/internals/labelable-provider/useLabel.svelte.js';

  let { id }: { id: string } = $props();
  const nativeId = $props.id();
  const getLabelProps = useLabel(() => ({ id, native: true }), nativeId);
</script>

<label {...getLabelProps()}>Registered label</label>
