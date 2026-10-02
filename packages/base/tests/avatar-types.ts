// Six exact type assertions adapted from Avatar.spec.tsx at immutable Base UI v1.8.0
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT. Type evidence earns no ordinary test credit.
import type { AvatarRootProps, AvatarImageProps, AvatarFallbackProps, ImageLoadingStatus } from '../src/lib/avatar/index.js';
import { expectType } from './expect-type.js';
declare const rootState: Parameters<NonNullable<AvatarRootProps['render']>>[1];
expectType<ImageLoadingStatus, typeof rootState.imageLoadingStatus>(rootState.imageLoadingStatus); // spec:7
const image: AvatarImageProps = {
  crossorigin: 'anonymous', keepMounted: true, referrerpolicy: 'no-referrer', sizes: '48px', srcset: 'avatar.png 1x, avatar@2x.png 2x',
  onLoadingStatusChange(status) {
    expectType<ImageLoadingStatus, typeof status>(status); // spec:18
  },
};
declare const imageProps: Parameters<NonNullable<AvatarImageProps['render']>>[0];
expectType<string | undefined, typeof imageProps.src>(imageProps.src); // spec:21
expectType<string | undefined, typeof imageProps.alt>(imageProps.alt); // spec:22
declare const imageState: Parameters<NonNullable<AvatarImageProps['render']>>[1];
expectType<ImageLoadingStatus, typeof imageState.imageLoadingStatus>(imageState.imageLoadingStatus); // spec:23
declare const fallbackState: Parameters<NonNullable<AvatarFallbackProps['render']>>[1];
expectType<ImageLoadingStatus, typeof fallbackState.imageLoadingStatus>(fallbackState.imageLoadingStatus); // spec:30
const root: AvatarRootProps = { class: state => [state.imageLoadingStatus, { active: true }], ref: undefined };
const fallback: AvatarFallbackProps = { delay: 100, class: state => state.imageLoadingStatus };
// @ts-expect-error Loading statuses are a bounded public union.
const invalid: ImageLoadingStatus = 'finished';
// @ts-expect-error keepMounted is boolean.
const invalidImage: AvatarImageProps = { keepMounted: 'yes' };
void [root, image, fallback, invalid, invalidImage];
