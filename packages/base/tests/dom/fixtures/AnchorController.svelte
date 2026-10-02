<script lang="ts">
  import { untrack } from 'svelte';
  import { createAnchorPositioning, type AnchorPositioningController } from '../../../src/lib/internals/anchor-positioning/controller.svelte.js';
  import { positioningAttachments } from '../../../src/lib/internals/anchor-positioning/attachments.js';
  import type { AnchorPositioningOptions } from '../../../src/lib/internals/anchor-positioning/types.js';
  let { initial, onReady }: { initial: AnchorPositioningOptions; onReady: (value: AnchorPositioningController) => void } = $props();
  let options = $state.raw(untrack(() => initial));
  const controller = createAnchorPositioning(() => options);
  const attach = positioningAttachments(controller);
  untrack(() => onReady(controller));
  export function setOptions(next: AnchorPositioningOptions) { options = next; }
</script>
<button data-testid="dom-reference" {@attach attach.reference}>Anchor</button>
<div data-testid="floating" {@attach attach.floating}></div>
