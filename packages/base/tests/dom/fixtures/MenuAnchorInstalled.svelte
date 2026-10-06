<!-- Authored actual Source/native regression; zero Original declaration credit. -->
<script lang="ts">
  import { untrack } from 'svelte';
  import { useAnchorPositioning } from '../../../src/lib/internals/anchor-positioning/useAnchorPositioning.svelte.js';
  import { positioningAttachments } from '../../../src/lib/internals/anchor-positioning/attachments.js';
  import type { AnchorPositioningController } from '../../../src/lib/internals/anchor-positioning/controller.svelte.js';
  let { ready = () => {} }: { ready?: (position: AnchorPositioningController) => void } = $props();
  let open = $state(false),
    mounted = $state(false);
  const position = useAnchorPositioning(() => ({
    open,
    mounted,
    keepMounted: true,
    collisionAvoidance: {},
  }));
  const attach = positioningAttachments(position);
  untrack(() => ready(position));
  export function present(nextOpen: boolean, nextMounted: boolean) {
    open = nextOpen;
    mounted = nextMounted;
  }
</script>

<button {@attach attach.reference}>Anchor</button>
<div data-testid="floating" {@attach attach.floating} data-positioned={position.isPositioned}
  >Popup</div
>
