<script lang="ts">
  import { createAnchorPositioning } from '../../../../packages/base/src/lib/internals/anchor-positioning/controller.svelte.js';
  import { positioningAttachments } from '../../../../packages/base/src/lib/internals/anchor-positioning/attachments.js';
  import { adaptiveOrigin } from '../../../../packages/base/src/lib/internals/anchor-positioning/adaptive-origin.js';
  import { inline } from '../../../../packages/base/src/lib/internals/anchor-positioning/policy.js';
  import type { Reference } from '../../../../packages/base/src/lib/internals/anchor-positioning/types.js';
  let {
    scenario,
    open,
    mounted,
    domDirection,
    sideOffset,
    replacement,
    wide,
    realArrow,
  }: {
    scenario: string;
    open: boolean;
    mounted: boolean;
    domDirection: 'ltr' | 'rtl';
    sideOffset: number;
    replacement: boolean;
    wide: boolean;
    realArrow: boolean;
  } = $props();
  let anchor = $state<HTMLButtonElement>();
  const virtual = $derived(
    anchor
      ? ({
          contextElement: anchor,
          getBoundingClientRect: () => anchor!.getBoundingClientRect(),
          getClientRects: () =>
            Array.from(anchor!.children, (node) => node.getBoundingClientRect()),
        } satisfies Reference)
      : null,
  );
  const positioning = createAnchorPositioning(() => ({
    open,
    mounted,
    keepMounted: true,
    anchor: ['virtual', 'inline'].includes(scenario) ? virtual : undefined,
    side:
      scenario === 'logical' ? 'inline-start' : scenario === 'adaptive-left' ? 'left' : 'bottom',
    align: ['start', 'rtl', 'mismatch'].includes(scenario) ? 'start' : 'center',
    sideOffset:
      scenario === 'function' ? (data) => data.anchor.height / 2 + sideOffset : sideOffset,
    collisionBoundary: 'clipping-ancestors',
    collisionAvoidance: { fallbackAxisSide: 'none' },
    disableAnchorTracking: scenario === 'disabled',
    shift:
      scenario === 'layout'
        ? { rootBoundary: 'layoutViewport' }
        : scenario === 'cross-axis'
          ? { rootBoundary: 'layoutViewport', crossAxis: true }
          : undefined,
    transform: scenario !== 'top-left',
    inline: scenario === 'inline' ? inline() : undefined,
    adaptiveOrigin: scenario.startsWith('adaptive') ? adaptiveOrigin : undefined,
    lazyFlip: scenario === 'lazy',
  }));
  const attach = positioningAttachments(positioning);
</script>

<div class="board" data-testid="board"
  ><div class="stage">
    {#key replacement}<button
        class={[
          'anchor',
          {
            replacement,
            collision:
              ['collision', 'adaptive-top'].includes(scenario) ||
              (scenario === 'lazy' && !replacement),
          },
        ]}
        style:width={wide ? '110px' : '80px'}
        bind:this={anchor}
        {@attach attach.reference}
        data-testid="anchor"
        >{#if scenario === 'inline'}<span style="display:block;width:80px;height:15px"
            >First line</span
          ><span style="display:block;width:40px;height:15px">Last line</span
          >{:else}Anchor{/if}</button
      >{/key}
    <div
      class={['floating', { adaptive: scenario.startsWith('adaptive') }]}
      style="position: fixed; top: 0; left: 0; opacity: 0"
      dir={domDirection}
      data-testid="floating"
      data-closed={!mounted}
      data-open={open}
      data-mounted={mounted}
      data-positioned={positioning.isPositioned}
      data-side={positioning.side}
      data-align={positioning.align}
      data-hidden={positioning.anchorHidden}
      data-arrow-uncentered={positioning.arrowUncentered}
      {@attach attach.floating}
    >
      {#if realArrow}<div class="arrow" data-testid="arrow" {@attach attach.arrow}></div>{/if}
      Private foundation
    </div>
  </div></div
>
<output data-testid="error">{positioning.error ? String(positioning.error) : ''}</output>
