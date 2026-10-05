<script lang="ts">
  // Ported from Base UI v1.8.0 AvatarImage.tsx.
  // Pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: parity/avatar/UPSTREAM_LICENSE.
  import { untrack } from 'svelte';
  import RenderElement from '../internals/RenderElement.svelte';
  import { useTransitionStatus } from '../internals/useTransitionStatus.svelte.js';
  import { useOpenChangeComplete } from '../internals/useOpenChangeComplete.svelte.js';
  import { transitionStatusMapping } from '../internals/stateAttributesMapping.js';
  import { useStableCallback } from '../utils/useStableCallback.js';
  import { getAvatarContext } from './context.js';
  import { useImageLoadingStatus } from './useImageLoadingStatus.svelte.js';
  import { avatarStateAttributesMapping } from './stateAttributesMapping.js';
  import type { AvatarImageProps, AvatarImageState, ImageLoadingStatus } from './types.js';

  let { children, render, keepMounted = false, onLoadingStatusChange, class: classProp, style,
    ref = $bindable(), sizes, srcset, src, ...elementProps }: AvatarImageProps = $props();
  const root = getAvatarContext();
  const loading = useImageLoadingStatus(() => src, () => ({
    referrerpolicy: elementProps.referrerpolicy, crossorigin: elementProps.crossorigin, sizes, srcset,
  }), () => !keepMounted);
  const imageLoadingStatus = $derived(loading.loadingStatus);
  const isVisible = $derived(imageLoadingStatus === 'loaded');
  const transition = useTransitionStatus(() => isVisible);
  const imageRef = $state<{ current: HTMLElement | null }>({ current: null });
  let initialCommit = true;

  // Rendered loading reads the replacement host after DOM updates. Ref-less
  // snippets retain the status reported by their forwarded load/error events.
  $effect(() => {
    if (!keepMounted) return;
    void src; void srcset; void sizes; void elementProps.crossorigin; void elementProps.referrerpolicy; void render;
    const isInitialCommit = initialCommit;
    initialCommit = false;
    const image = imageRef.current as HTMLImageElement | null;
    if (!image) return;
    function resolve(initial: boolean) {
      if (!image) return;
      if (!image.complete) { loading.setLoadingStatus('loading'); return; }
      const status = image.naturalWidth > 0 ? 'loaded' : 'error';
      loading.setLoadingStatus(status);
      // The complete first-commit image was already painted before hydration.
      if (initial && status === 'loaded') transition.setMounted(true);
    }
    untrack(() => resolve(isInitialCommit));
    // Native snippet identity remains stable as lexical sources change. This
    // documented source-attribute observer follows the actual rendered image.
    const Observer = image.ownerDocument.defaultView?.MutationObserver;
    if (!Observer) return;
    const observer = new Observer(() => resolve(false));
    observer.observe(image, { attributes: true, attributeFilter: ['src', 'srcset', 'sizes', 'crossorigin', 'referrerpolicy'] });
    return () => observer.disconnect();
  });

  const renderedStatusProps = $derived(keepMounted ? {
    'data-loading': imageLoadingStatus === 'loading' ? '' : undefined,
    'data-error': imageLoadingStatus === 'error' ? '' : undefined,
    'aria-hidden': imageLoadingStatus !== 'loaded' || undefined,
    onload() { loading.setLoadingStatus('loaded'); },
    onerror() { loading.setLoadingStatus('error'); },
  } : undefined);
  const handleLoadingStatusChange = useStableCallback((status: ImageLoadingStatus) => {
    onLoadingStatusChange?.(status);
    root.setImageLoadingStatus(status);
  });
  $effect.pre(() => {
    if (imageLoadingStatus !== 'idle') handleLoadingStatusChange(imageLoadingStatus);
  });
  $effect(() => () => root.setImageLoadingStatus('idle'));

  useOpenChangeComplete({
    get enabled() { return !isVisible; },
    get open() { return isVisible; },
    ref: imageRef,
    onComplete() { if (!isVisible) transition.setMounted(false); },
  });
  const partState: AvatarImageState = $derived({
    imageLoadingStatus,
    transitionStatus: keepMounted && transition.transitionStatus === 'ending' ? undefined : transition.transitionStatus,
  });
  const shouldRender = $derived(keepMounted || transition.mounted);
  const sourceProps = $derived.by(() => {
    const source: Record<string, unknown> = {};
    if (sizes !== undefined) source.sizes = sizes;
    if (srcset !== undefined) source.srcset = srcset;
    if (src !== undefined) source.src = src;
    return source;
  });
  const stateAttributesMapping = { ...avatarStateAttributesMapping, ...transitionStatusMapping };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({
    state: partState, ref: imageRef,
    props: [renderedStatusProps, elementProps, sourceProps],
    stateAttributesMapping, enabled: shouldRender,
  });
</script>
<RenderElement tag="img" {componentProps} {params} {children} bind:element={ref} />
