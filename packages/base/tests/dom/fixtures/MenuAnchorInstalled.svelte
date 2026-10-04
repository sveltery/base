<!-- Authored actual Source/native regression; zero Original declaration credit. -->
<script>
  import { untrack } from 'svelte';
  import { useAnchorPositioning } from '../../../src/lib/internals/anchor-positioning/useAnchorPositioning.svelte.js';
  import { positioningAttachments } from '../../../src/lib/internals/anchor-positioning/attachments.js';
  let { ready = () => {} } = $props();
  let open = $state(false), mounted = $state(false);
  const position = useAnchorPositioning(() => ({ open, mounted, keepMounted: true, collisionAvoidance: {} }));
  const attach = positioningAttachments(position);
  untrack(() => ready(position));
  export function present(nextOpen, nextMounted) { open = nextOpen; mounted = nextMounted; }
</script>
<button {@attach attach.reference}>Anchor</button>
<div data-testid="floating" {@attach attach.floating} data-positioned={position.isPositioned}>Popup</div>
