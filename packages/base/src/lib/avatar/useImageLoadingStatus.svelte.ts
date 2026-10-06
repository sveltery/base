// Ported from Base UI v1.8.0 avatar/image/useImageLoadingStatus.ts.
// Pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: parity/avatar/UPSTREAM_LICENSE.
import type { HTMLImgAttributes } from 'svelte/elements';
import type { ImageLoadingStatus } from './types.js';

type UseImageLoadingStatusOptions = Pick<
  HTMLImgAttributes,
  'referrerpolicy' | 'crossorigin' | 'sizes' | 'srcset'
>;

export function useImageLoadingStatus(
  getSrc: () => string | undefined,
  getOptions: () => UseImageLoadingStatusOptions,
  getEnabled: () => boolean,
) {
  let loadingStatus = $state<ImageLoadingStatus>('idle');
  function setLoadingStatus(status: ImageLoadingStatus) {
    loadingStatus = status;
  }

  // Probe after component setup, as the source layout effect does: transition
  // state must initialize from idle before a cached probe publishes loaded.
  // Native client synchronization owns cleanup; SSR never constructs an Image.
  $effect(() => {
    if (!getEnabled()) return;
    const src = getSrc();
    const { referrerpolicy, crossorigin, sizes, srcset } = getOptions();
    if (!src && !srcset) {
      setLoadingStatus('error');
      return;
    }

    let isMounted = true;
    const image = new window.Image();
    const updateStatus = (status: ImageLoadingStatus) => () => {
      if (isMounted) setLoadingStatus(status);
    };
    setLoadingStatus('loading');
    image.onload = updateStatus('loaded');
    image.onerror = updateStatus('error');
    if (referrerpolicy) image.referrerPolicy = referrerpolicy;
    image.crossOrigin = crossorigin ?? null;
    if (sizes) image.sizes = sizes;
    if (srcset) image.srcset = srcset;
    if (src) image.src = src;
    if (image.complete) setLoadingStatus(image.naturalWidth > 0 ? 'loaded' : 'error');
    return () => {
      isMounted = false;
    };
  });

  return {
    get loadingStatus() {
      return loadingStatus;
    },
    setLoadingStatus,
  };
}
