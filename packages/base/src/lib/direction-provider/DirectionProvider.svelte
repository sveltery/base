<script lang="ts">
  // Derived from pinned Base UI DirectionProvider; MIT: THIRD_PARTY_NOTICES.md.
  import { setDirectionContext } from './context.js';
  import type { DirectionProviderProps } from './types.js';

  let { direction = 'ltr', children }: DirectionProviderProps = $props();
  setDirectionContext({ get direction() { return direction; } });
</script>

{@render children?.()}
