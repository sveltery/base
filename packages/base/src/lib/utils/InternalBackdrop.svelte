<script lang="ts">
  // Original InternalBackdrop cutout/props/style body; shared native ref attachment (MIT).
  import type { HTMLAttributes } from 'svelte/elements';
  import { MergedRefs, type MergedRef } from '@sveltery/utils/useMergedRefs';
  import { createRefAttachment } from '../internals/nativeRefAttachment.js';
  import { toNativeStyle } from '../internals/nativeProps.js';
  let {
    cutout,
    ref,
    ...props
  }: HTMLAttributes<HTMLDivElement> & { cutout?: Element | null; ref?: MergedRef<HTMLDivElement> } =
    $props();
  const refs = new MergedRefs<HTMLDivElement>();
  const resolveAttachment = createRefAttachment<HTMLDivElement>(() => {});
  const attachment = $derived(resolveAttachment(refs.merge(ref, null)));
  const clipPath = $derived.by(() => {
    if (!cutout) return undefined;
    const rect = cutout.getBoundingClientRect();
    return `polygon(0% 0%,100% 0%,100% 100%,0% 100%,0% 0%,${rect.left}px ${rect.top}px,${rect.left}px ${rect.bottom}px,${rect.right}px ${rect.bottom}px,${rect.right}px ${rect.top}px,${rect.left}px ${rect.top}px)`;
  });
</script>

<div
  role="presentation"
  data-base-ui-inert=""
  {...props}
  style={toNativeStyle({
    position: 'fixed',
    inset: 0,
    userSelect: 'none',
    WebkitUserSelect: 'none',
    clipPath,
  })}
  {@attach attachment}
></div>
