// I:846/911/965 ports from AvatarImage.test.tsx at Base UI v1.8.0
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c (MIT).
// DOM lifecycle models preserve state/presence assertions; real transition timing is
// separately exercised by paired Chromium. Event dispatch here models CSS completion.
import { expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { cleanupWith, image, mockImageLoading, setup, settle } from './avatar-test-utils.js';
function animationClock() {
  vi.useFakeTimers();
  vi.stubGlobal('BASE_UI_ANIMATIONS_DISABLED', false);
  cleanupWith(() => {
    vi.unstubAllGlobals();
  });
}
it('I:846 triggers enter animation via data-starting-style when mounting (DOM lifecycle model)', () => {
  animationClock();
  mockImageLoading({ completeOnSet: true });
  const transitionFinished = vi.fn(),
    getAnimations = vi.fn(() => []);
  const { component } = setup({
    imageProps: { style: 'transition: opacity 1ms', ontransitionend: transitionFinished },
  });
  expect(image()).toBe(null);
  component.updateImage({ src: 'avatar.png' });
  flushSync();
  const node = image()!;
  node.getAnimations = getAnimations;
  expect(node.hasAttribute('data-starting-style')).toBe(true);
  vi.advanceTimersByTime(20);
  flushSync();
  node.dispatchEvent(new Event('transitionend'));
  flushSync();
  expect(transitionFinished).toHaveBeenCalledTimes(1);
  expect(image()).not.toBe(null);
  expect(getAnimations).not.toHaveBeenCalled();
});
it('I:911 applies data-ending-style before unmount (DOM animation completion model)', async () => {
  animationClock();
  mockImageLoading({ completeOnSet: true });
  const { component } = setup({ imageProps: { src: 'avatar.png' } });
  expect(image()).not.toBe(null);
  let complete!: () => void;
  const finished = new Promise<void>((resolve) => {
    complete = resolve;
  });
  image()!.getAnimations = () => [{ finished } as unknown as Animation];
  component.updateImage({ src: undefined });
  flushSync();
  expect(image()).not.toBe(null);
  expect(image()!.hasAttribute('data-ending-style')).toBe(true);
  vi.advanceTimersByTime(20);
  complete();
  await settle();
  expect(image()).toBe(null);
});
it('I:965 does not apply not-loaded state attributes without keepMounted (DOM exit model)', () => {
  animationClock();
  mockImageLoading({ completeOnSet: true });
  const { component } = setup({ imageProps: { src: 'avatar.png' } });
  image()!.getAnimations = () => [
    { finished: new Promise<void>(() => {}) } as unknown as Animation,
  ];
  component.updateImage({ src: undefined });
  flushSync();
  expect(image()!.hasAttribute('data-ending-style')).toBe(true);
  expect(image()!.hasAttribute('data-error')).toBe(false);
  expect(image()!.hasAttribute('data-loading')).toBe(false);
});
