<script lang="ts">
  import { useDirection } from '../../../../packages/base/src/lib/direction-provider/context.js';
  import { createAnchorPositioning } from '../../../../packages/base/src/lib/internals/anchor-positioning/controller.svelte.js';
  import { positioningAttachments } from '../../../../packages/base/src/lib/internals/anchor-positioning/attachments.js';
  import type { Reference } from '../../../../packages/base/src/lib/internals/anchor-positioning/types.js';
  let { scenario, open, domDirection, sideOffset, replacement, wide, realArrow }: {
    scenario: string; open: boolean; domDirection: 'ltr' | 'rtl'; sideOffset: number;
    replacement: boolean; wide: boolean; realArrow: boolean;
  } = $props();
  const direction = useDirection();
  let anchor = $state<HTMLButtonElement>();
  const virtual = $derived(anchor ? {
    contextElement: anchor,
    getBoundingClientRect: () => anchor!.getBoundingClientRect(),
  } satisfies Reference : null);
  const positioning = createAnchorPositioning(() => ({
    open, mounted: open, keepMounted: true,
    direction: direction(),
    anchor: scenario === 'virtual' ? virtual : undefined,
    side: scenario === 'logical' ? 'inline-start' : 'bottom',
    align: ['start', 'rtl', 'mismatch'].includes(scenario) ? 'start' : 'center',
    sideOffset: scenario === 'function' ? data => data.anchor.height / 2 + sideOffset : sideOffset,
    collisionBoundary: 'clipping-ancestors',
    collisionAvoidance: { fallbackAxisSide: 'none' },
    disableAnchorTracking: scenario === 'disabled',
    shift: scenario === 'layout' ? { rootBoundary: 'layoutViewport' } : scenario === 'cross-axis' ? { rootBoundary: 'layoutViewport', crossAxis: true } : undefined,
    transform: scenario !== 'top-left',
  }));
  const attach = positioningAttachments(positioning);
</script>

<div class="board" data-testid="board"><div class="stage">
  {#key replacement}<button class={['anchor', { replacement, collision: scenario === 'collision' }]} style:width={wide ? '110px' : '80px'} bind:this={anchor} {@attach attach.reference} data-testid="anchor">Anchor</button>{/key}
  <div class="floating" style="position: fixed; top: 0; left: 0; opacity: 0" dir={domDirection} data-testid="floating" data-closed={!open}
    data-positioned={positioning.isPositioned} data-side={positioning.side} data-align={positioning.align}
    data-hidden={positioning.anchorHidden} data-arrow-uncentered={positioning.arrowUncentered}
    {@attach attach.floating}>
    {#if realArrow}<div class="arrow" data-testid="arrow" {@attach attach.arrow}></div>{/if}
    Private foundation
  </div>
</div></div>
<output data-testid="error">{positioning.error ? String(positioning.error) : ''}</output>
