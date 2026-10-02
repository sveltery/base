<script lang="ts">
  // Derived from pinned AvatarImage/useImageLoadingStatus/useTransitionStatus.
  // Base UI 1.8.0, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: parity/avatar/UPSTREAM_LICENSE.
  import { untrack } from 'svelte';
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { getAvatarContext } from './context.js';
  import { finishExit } from './animations.js';
  import type { AvatarImageProps, AvatarImageState, ImageLoadingStatus } from './types.js';
  let { children, render, keepMounted = false, onLoadingStatusChange, class: classProp,
    ref = $bindable(), sizes, srcset, src, ...props }: AvatarImageProps = $props();
  const root = getAvatarContext();
  let imageLoadingStatus = $state<ImageLoadingStatus>('idle');
  let mounted = $state(false);
  let phase = $state<AvatarImageState['transitionStatus']>();
  let initialCommit = true;
  const visible = $derived(imageLoadingStatus === 'loaded');
  function setMounted(value: boolean) { untrack(() => { mounted = value; if (!value && !visible && phase === 'ending') phase = undefined; }); }
  function setStatus(status: ImageLoadingStatus) { imageLoadingStatus = status; }
  const partState = $derived({ imageLoadingStatus, transitionStatus: keepMounted && phase === 'ending' ? undefined : phase });
  const internal = $derived({
    ...(phase === 'starting' ? { 'data-starting-style': '' } : !keepMounted && phase === 'ending' ? { 'data-ending-style': '' } : {}),
    ...(keepMounted ? {
      'data-loading': imageLoadingStatus === 'loading' ? '' : undefined,
      'data-error': imageLoadingStatus === 'error' ? '' : undefined,
      'aria-hidden': imageLoadingStatus !== 'loaded' || undefined,
      onload: () => setStatus('loaded'), onerror: () => setStatus('error'),
    } : {}),
  });
  const resolved = $derived.by(() => {
    const source: Record<string, unknown> = {};
    if (sizes !== undefined) source.sizes = sizes;
    if (srcset !== undefined) source.srcset = srcset;
    if (src !== undefined) source.src = src;
    return { ...(!render ? { alt: '' } : {}), ...props,
      class: resolveClassValue(typeof classProp === 'function' ? classProp(partState) : classProp), ...source };
  });
  // A detached probe owns its completion handlers until its source/options change or disposal.
  $effect.pre(() => {
    if (keepMounted) return;
    if (!src && !srcset) { setStatus('error'); return; }
    let active = true;
    const image = new window.Image();
    setStatus('loading');
    image.onload = () => { if (active) setStatus('loaded'); };
    image.onerror = () => { if (active) setStatus('error'); };
    if (props.referrerpolicy) image.referrerPolicy = props.referrerpolicy;
    image.crossOrigin = props.crossorigin ?? null;
    if (sizes) image.sizes = sizes;
    if (srcset) image.srcset = srcset;
    if (src) image.src = src;
    if (image.complete) setStatus(image.naturalWidth > 0 ? 'loaded' : 'error');
    return () => { active = false; };
  });
  // Rendered loading reads the actual replacement host after DOM updates. Ref-less
  // render snippets retain the status reported by their own forwarded events.
  $effect(() => {
    if (!keepMounted) return;
    void src; void srcset; void sizes; void props.crossorigin; void props.referrerpolicy; void render;
    const isInitialCommit = initialCommit;
    initialCommit = false;
    const image = ref as HTMLImageElement | null | undefined;
    if (!image) return;
    function resolve(initial: boolean) {
      if (!image) return;
      if (!image.complete) { setStatus('loading'); return; }
      const status = image.naturalWidth > 0 ? 'loaded' : 'error';
      // The pre-hydration image was already painted; suppress a new starting phase.
      if (initial && status === 'loaded') setMounted(true);
      setStatus(status);
    }
    untrack(() => resolve(isInitialCommit));
    // A Svelte snippet's identity stays stable as its own source expressions change.
    // Observe only source/options so that this follows React render-element invalidation.
    const Observer = image.ownerDocument.defaultView?.MutationObserver;
    if (!Observer) return;
    const observer = new Observer(() => resolve(false));
    observer.observe(image, { attributes: true, attributeFilter: ['src', 'srcset', 'sizes', 'crossorigin', 'referrerpolicy'] });
    return () => observer.disconnect();
  });
  $effect.pre(() => {
    const status = imageLoadingStatus;
    if (status !== 'idle') untrack(() => { onLoadingStatusChange?.(status); root.setImageLoadingStatus(status); });
  });
  // Reconcile presence from the final committed status, not intermediate probe writes.
  // A cached source replacement batches loading -> loaded without an exit phase.
  $effect.pre(() => {
    const open = visible;
    untrack(() => {
      if (open && !mounted) { mounted = true; phase = 'starting'; }
      if (!open && mounted && phase !== 'ending') phase = 'ending';
      if (!open && !mounted && phase === 'ending') phase = undefined;
    });
  });
  $effect.pre(() => {
    if (!visible) return;
    const frame = window.requestAnimationFrame(() => { phase = undefined; });
    return () => window.cancelAnimationFrame(frame);
  });
  $effect(() => {
    if (visible) return;
    return untrack(() => finishExit(ref, () => { if (!visible) setMounted(false); }));
  });
  $effect(() => () => root.setImageLoadingStatus('idle'));
</script>
{#if keepMounted || mounted}<Element tag="img" {internal} props={resolved} state={partState} {render} {children} bind:ref />{/if}
