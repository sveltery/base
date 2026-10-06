<script lang="ts">
  import { getCSPContext } from '../../src/lib/csp-provider/context.js';
  let { name }: { name: string } = $props();
  const context = getCSPContext();
</script>

<output data-testid={name}
  >{context.nonce ?? 'undefined'}|{String(context.disableStyleElements)}</output
>
