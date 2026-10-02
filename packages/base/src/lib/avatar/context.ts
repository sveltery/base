// Derived from pinned Base UI AvatarRootContext. MIT: parity/avatar/UPSTREAM_LICENSE.
import { getContext, setContext } from 'svelte';
import type { ImageLoadingStatus } from './types.js';
const key = Symbol('AvatarRoot');
export interface AvatarContext { readonly imageLoadingStatus: ImageLoadingStatus; setImageLoadingStatus(status: ImageLoadingStatus): void }
export function setAvatarContext(context: AvatarContext) { setContext(key, context); }
export function getAvatarContext(): AvatarContext {
  const context = getContext<AvatarContext | undefined>(key);
  if (!context) throw new Error('Base UI: AvatarRootContext is missing. Avatar parts must be placed within <Avatar.Root>.');
  return context;
}
