<script lang="ts">
  // Derived from Base UI CSPProvider at 47b40521; MIT: ../../../THIRD_PARTY_NOTICES.md.
  import { setCSPContext } from './context.js';
  import type { CSPProviderProps } from './types.js';
  let { children, nonce, disableStyleElements }: CSPProviderProps = $props();
  // Initialization context stays stable while getters track the provider's live props.
  setCSPContext({ get nonce() { return nonce; }, get disableStyleElements() { return disableStyleElements; } });
</script>
{@render children?.()}
