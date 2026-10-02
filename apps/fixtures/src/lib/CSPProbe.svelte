<script lang="ts">
  import { getCSPContext } from '../../../../packages/base/dist/csp-provider/context.js';
  let { name }: { name: string } = $props();
  const context = getCSPContext();
</script>
<output data-testid={name} data-nonce={context.nonce ?? 'undefined'} data-disable={String(context.disableStyleElements)}>{context.nonce ?? 'undefined'}|{String(context.disableStyleElements)}</output>
