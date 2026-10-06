// Derived from mui/base-ui Avatar v1.8.0, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT attribution: parity/avatar/UPSTREAM_LICENSE and THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { ClassValue, HTMLAttributes, HTMLImgAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, HTMLProps, WithBaseUIEvent } from '../internals/types.js';
export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';
export interface AvatarRootState {
  imageLoadingStatus: ImageLoadingStatus;
}
export interface AvatarImageState extends AvatarRootState {
  transitionStatus: 'starting' | 'ending' | 'idle' | undefined;
}
export type AvatarFallbackState = AvatarRootState;
type PartProps<State, NativeProps> = Omit<
  WithBaseUIEvent<NativeProps>,
  'class' | 'style' | 'children'
> & {
  children?: Snippet;
  ref?: HTMLElement | null;
  style?: BaseUIComponentProps<State>['style'];
  class?: ClassValue | ((state: State) => ClassValue);
  render?: Snippet<[HTMLProps, State, Snippet | undefined]>;
};
export type AvatarRootProps = PartProps<AvatarRootState, HTMLAttributes<HTMLSpanElement>>;
// Source and alt remain typed on replacement snippets, as on the pinned React render callback.
export type AvatarImageProps = Omit<
  PartProps<AvatarImageState, HTMLImgAttributes>,
  'render' | 'src' | 'alt'
> & {
  src?: string;
  alt?: string;
  render?: Snippet<
    [HTMLProps & { src?: string; alt?: string }, AvatarImageState, Snippet | undefined]
  >;
  keepMounted?: boolean;
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
};
export type AvatarFallbackProps = PartProps<
  AvatarFallbackState,
  HTMLAttributes<HTMLSpanElement>
> & { delay?: number };
