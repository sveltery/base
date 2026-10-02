// Ordinary assertion ports from AvatarImage.test.tsx and AvatarFallback.test.tsx.
// Base UI v1.8.0, immutable 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT.
// I/F:<line> identifies the declaration, not an assertion count. Native-browser declarations
// retain their assertions with explicit DOM boundary models here; browser evidence is separate.
import { expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { fallback, fireImage, image, mockImageLoading, renderedCompleteness, resolveProbe, setup, settle } from './avatar-test-utils.js';

it('I:102 passes native image props to the rendered image', () => {
  mockImageLoading({ completeOnSet: true }); setup({ imageProps: { crossorigin: 'anonymous', referrerpolicy: 'no-referrer', sizes: '48px', src: 'avatar.png', srcset: 'avatar.png 1x, avatar@2x.png 2x' } });
  expect(image()!.getAttribute('crossorigin')).toBe('anonymous'); expect(image()!.getAttribute('referrerpolicy')).toBe('no-referrer'); expect(image()!.getAttribute('sizes')).toBe('48px'); expect(image()!.getAttribute('srcset')).toBe('avatar.png 1x, avatar@2x.png 2x');
});
it('I:123 shows the image when only srcSet is provided', () => {
  mockImageLoading({ completeOnSet: true }); setup({ imageProps: { sizes: '48px', srcset: 'avatar.png 1x' } });
  expect(image()!.getAttribute('srcset')).toBe('avatar.png 1x'); expect(fallback()).toBe(null);
});
it('I:135 passes responsive image props to the loading probe', () => {
  const images = mockImageLoading(); setup({ imageProps: { sizes: '48px', src: 'fallback.png', srcset: 'avatar.png 1x, avatar@2x.png 2x' } });
  expect(images[0].sizes).toBe('48px'); expect(images[0].srcset).toBe('avatar.png 1x, avatar@2x.png 2x'); expect(images[0].src).toBe('fallback.png');
});
it('I:150 fires when the image loads', () => {
  const images = mockImageLoading(), changed = vi.fn(); setup({ imageProps: { src: 'avatar.png', onLoadingStatusChange: changed } });
  expect(changed).toHaveBeenCalledWith('loading'); resolveProbe(images); expect(changed.mock.calls.map(([status]) => status)).toEqual(['loading', 'loaded']);
});
it('I:176 fires when the image errors', () => {
  const images = mockImageLoading(), changed = vi.fn(); setup({ imageProps: { src: 'avatar.png', onLoadingStatusChange: changed } });
  expect(changed).toHaveBeenCalledWith('loading'); resolveProbe(images, 'error'); expect(changed.mock.calls.map(([status]) => status)).toEqual(['loading', 'error']);
});
it('I:202 fires for cached image errors without emitting idle', () => {
  mockImageLoading({ completeOnSet: true, naturalWidth: 0 }); const changed = vi.fn(); setup({ imageProps: { src: 'avatar.png', onLoadingStatusChange: changed } });
  expect(changed).toHaveBeenCalledWith('error'); expect(changed).not.toHaveBeenCalledWith('idle');
});
it('I:221 mounts the image while loading without preloading it', () => {
  const images = mockImageLoading(); setup({ imageProps: { keepMounted: true, src: 'avatar.png' } });
  expect(image()!.getAttribute('src')).toBe('avatar.png'); expect(fallback()).not.toBe(null); expect(images.length).toBe(0);
});
it('I:236 derives the status from the rendered element load event', () => {
  const changed = vi.fn(); setup({ imageProps: { keepMounted: true, src: 'avatar.png', onLoadingStatusChange: changed } }); fireImage('load');
  expect(fallback()).toBe(null); expect(changed.mock.calls.map(([status]) => status)).toEqual(['loading', 'loaded']);
});
it('I:262 keeps the image mounted when it fails to load', () => {
  const changed = vi.fn(); setup({ imageProps: { keepMounted: true, src: 'avatar.png', onLoadingStatusChange: changed } }); fireImage('error');
  expect(changed).toHaveBeenCalledWith('error'); expect(changed.mock.calls.map(([status]) => status)).toEqual(['loading', 'error']); expect(image()).not.toBe(null); expect(fallback()).not.toBe(null);
});
it('I:290 calls the user onError handler', () => {
  const onerror = vi.fn(); setup({ imageProps: { keepMounted: true, src: 'avatar.png', onerror } }); fireImage('error'); expect(onerror).toHaveBeenCalledTimes(1); expect(fallback()).not.toBe(null);
});
it('I:308 calls the user onLoad handler', () => {
  const onload = vi.fn(); setup({ imageProps: { keepMounted: true, src: 'avatar.png', onload } }); fireImage('load'); expect(onload).toHaveBeenCalledTimes(1); expect(fallback()).toBe(null);
});
it('I:328 lets a user handler prevent the status update', () => {
  const changed = vi.fn(); setup({ imageProps: { keepMounted: true, src: 'avatar.png', onload: event => event.preventBaseUIHandler(), onLoadingStatusChange: changed } }); fireImage('load');
  expect(image()!.hasAttribute('data-loading')).toBe(true); expect(fallback()).not.toBe(null); expect(changed.mock.calls.map(([status]) => status)).toEqual(['loading']);
});
it('I:351 resets the status when a rendered image changes source', async () => {
  const changed = vi.fn(); const { component } = setup({ scenario: 'render-source', imageProps: { keepMounted: true, onLoadingStatusChange: changed } }); fireImage('load'); expect(fallback()).toBe(null); changed.mockClear();
  component.changeRenderSource('avatar-2.png'); flushSync(); await settle(); expect(changed).toHaveBeenCalledWith('loading'); expect(fallback()).not.toBe(null);
  fireImage('load'); expect(fallback()).toBe(null); expect(changed.mock.calls.map(([status]) => status)).toEqual(['loading', 'loaded']);
});
it('I:395 resets the status when the src prop changes', () => {
  const changed = vi.fn(); const { component } = setup({ imageProps: { keepMounted: true, src: 'avatar-1.png', onLoadingStatusChange: changed } }); fireImage('load'); expect(fallback()).toBe(null); changed.mockClear();
  component.updateImage({ src: 'avatar-2.png' }); flushSync(); expect(changed).toHaveBeenCalledWith('loading'); expect(fallback()).not.toBe(null);
});
it('I:480 loads the image without a detached preload (DOM rendered completion model)', () => {
  renderedCompleteness(() => ({ complete: true, naturalWidth: 100 })); const images = mockImageLoading(); setup({ imageProps: { keepMounted: true, src: 'avatar.png', alt: 'Jane Doe' } });
  expect(fallback()).toBe(null); expect(image()!.getAttribute('src')).toBe('avatar.png'); expect(images.length).toBe(0);
});
it('I:515 reports an error when there is no source (native complete model)', () => {
  renderedCompleteness(() => ({ complete: true, naturalWidth: 0 })); const changed = vi.fn(); setup({ imageProps: { keepMounted: true, onLoadingStatusChange: changed } });
  expect(changed.mock.calls.map(([status]) => status)).toEqual(['error']); expect(fallback()).not.toBe(null);
});
it('I:537 preserves loaded status when the render element changes', () => {
  renderedCompleteness(() => ({ complete: true, naturalWidth: 100 })); const changed = vi.fn(); const { component } = setup({ scenario: 'render-source', imageProps: { keepMounted: true, onLoadingStatusChange: changed } });
  expect(fallback()).toBe(null); changed.mockClear(); component.changeRenderClass('updated'); flushSync(); expect(image()!.classList.contains('updated')).toBe(true); expect(changed).not.toHaveBeenCalled();
});
it('I:575 hides the image from assistive technology until it loads', () => {
  setup({ imageProps: { keepMounted: true, src: 'avatar.png', alt: 'Jane Doe' } }); expect(image()!.getAttribute('aria-hidden')).toBe('true');
  expect(document.querySelector('img:not([aria-hidden=true])')).toBe(null); fireImage('load'); expect(image()!.hasAttribute('aria-hidden')).toBe(false); expect(image()!.alt).toBe('Jane Doe');
});
it('I:595 keeps the image hidden from assistive technology after an error', () => {
  setup({ imageProps: { keepMounted: true, src: 'avatar.png', alt: 'Jane Doe' } }); fireImage('error');
  expect(image()!.hasAttribute('data-error')).toBe(true); expect(image()!.getAttribute('aria-hidden')).toBe('true'); expect(fallback()).not.toBe(null);
});
it('I:615 hides the image from assistive technology again when the source changes', () => {
  const { component } = setup({ imageProps: { keepMounted: true, src: 'avatar-1.png', alt: 'Jane Doe' } }); fireImage('load'); expect(image()!.hasAttribute('aria-hidden')).toBe(false);
  component.updateImage({ src: 'avatar-2.png' }); flushSync(); expect(image()!.getAttribute('aria-hidden')).toBe('true');
});
it('I:643 preserves an explicitly provided aria-hidden value', () => {
  setup({ imageProps: { keepMounted: true, src: 'avatar.png', alt: 'Jane Doe', 'aria-hidden': false } }); expect(image()!.getAttribute('aria-hidden')).toBe('false'); fireImage('load');
  expect(fallback()).toBe(null); expect(image()!.getAttribute('aria-hidden')).toBe('false');
});
it('I:667 marks the not-loaded states with data attributes', () => {
  setup({ imageProps: { keepMounted: true, src: 'avatar.png' } }); expect(image()!.hasAttribute('data-loading')).toBe(true); fireImage('load');
  expect(image()!.hasAttribute('data-loading')).toBe(false); expect(image()!.hasAttribute('data-error')).toBe(false); fireImage('error'); expect(image()!.hasAttribute('data-error')).toBe(true);
});
it('I:691 does not override source props in a render callback', () => {
  setup({ scenario: 'render-props', imageProps: { keepMounted: true } });
  expect(image()!.getAttribute('sizes')).toBe('48px'); expect(image()!.getAttribute('src')).toBe('avatar.png'); expect(image()!.getAttribute('srcset')).toBe('avatar.png 1x');
});
it('I:717 applies source props after the ones configuring the request', () => {
  let keys: string[] = []; setup({ scenario: 'ordered', observeProps: props => { keys = Object.keys(props); }, imageProps: { keepMounted: true, src: 'avatar.png', loading: 'lazy', sizes: '48px', srcset: 'avatar.png 1x, avatar@2x.png 2x' } });
  expect(keys.indexOf('src')).toBeGreaterThan(keys.indexOf('loading')); expect(keys.indexOf('src')).toBeGreaterThan(keys.indexOf('sizes')); expect(keys.indexOf('src')).toBeGreaterThan(keys.indexOf('srcset'));
});
it('I:747 keeps the status reported by an element that does not forward a ref', () => {
  const changed = vi.fn(); const { component } = setup({ scenario: 'drop-ref', imageProps: { keepMounted: true, onLoadingStatusChange: changed } }); fireImage('load'); expect(fallback()).toBe(null);
  component.changeRenderClass('updated'); flushSync(); expect(fallback()).toBe(null); expect(changed.mock.calls.map(([status]) => status)).toEqual(['loaded']);
});
it('I:797 resets the status when the source changes to an unloaded one (native complete model)', () => {
  renderedCompleteness(node => ({ complete: node.getAttribute('src') === 'cached.png', naturalWidth: node.getAttribute('src') === 'cached.png' ? 100 : 0 }));
  const changed = vi.fn(); const { component } = setup({ imageProps: { keepMounted: true, src: 'cached.png', onLoadingStatusChange: changed } }); expect(fallback()).toBe(null);
  component.updateImage({ src: '/missing-avatar.png' }); flushSync(); expect(image()!.hasAttribute('data-loading')).toBe(true); fireImage('error'); expect(image()!.hasAttribute('data-error')).toBe(true);
  expect(changed.mock.calls.map(([status]) => status)).toEqual(['loaded', 'loading', 'error']);
});
it('I:1017 does not apply data-ending-style with keepMounted', () => {
  renderedCompleteness(node => ({ complete: node.getAttribute('src') === 'cached.png', naturalWidth: 100 }));
  const { component } = setup({ imageProps: { keepMounted: true, src: 'cached.png' } }); expect(image()!.hasAttribute('data-loading')).toBe(false);
  component.updateImage({ src: '/missing-avatar.png' }); flushSync(); expect(image()!.hasAttribute('data-ending-style')).toBe(false); expect(image()!.hasAttribute('data-loading')).toBe(true);
});
it('I:1136 shows the image immediately for a cached src', () => {
  mockImageLoading({ completeOnSet: true }); setup({ imageProps: { src: 'https://example.com/cached-avatar.png', alt: 'Jane Doe' } });
  expect(image()!.getAttribute('src')).toBe('https://example.com/cached-avatar.png'); expect(fallback()).toBe(null);
});

it('F:38 should not render the children if the image loaded', () => {
  mockImageLoading({ completeOnSet: true }); setup({ imageProps: { src: 'avatar.png' }, fallbackText: 'AC' }); expect(fallback()).toBe(null);
});
it('F:53 should render the fallback if the image fails to load', () => {
  mockImageLoading({ completeOnSet: true, naturalWidth: 0 }); setup({ imageProps: { src: 'avatar.png' }, fallbackText: 'AC' }); expect(fallback()!.textContent).toBe('AC');
});
it('F:68 shows the fallback when a loaded image is unmounted', () => {
  mockImageLoading({ completeOnSet: true }); const { component } = setup({ imageProps: { src: 'avatar.png' }, fallbackText: 'AC' }); expect(fallback()).toBe(null); expect(image()).not.toBe(null);
  component.showImage(false); flushSync(); expect(fallback()).not.toBe(null); expect(image()).toBe(null);
});
it('F:105 shows the fallback when the delay has elapsed', () => {
  vi.useFakeTimers(); setup({ fallbackProps: { delay: 100 }, fallbackText: 'AC' }); expect(fallback()).toBe(null); vi.advanceTimersByTime(100); flushSync(); expect(fallback()!.textContent).toBe('AC');
});
it('F:120 shows the fallback immediately when delay is 0', () => {
  vi.useFakeTimers(); setup({ fallbackProps: { delay: 0 }, fallbackText: 'AC' }); expect(fallback()!.textContent).toBe('AC');
});
it('F:134 shows the fallback when delay changes to 0', () => {
  vi.useFakeTimers(); const { component } = setup({ fallbackProps: { delay: 100 }, fallbackText: 'AC' }); expect(fallback()).toBe(null); component.updateFallback({ delay: 0 }); flushSync(); expect(fallback()!.textContent).toBe('AC');
});
it('F:155 keeps the fallback visible when delay changes from undefined to a number', () => {
  vi.useFakeTimers(); const { component } = setup({ fallbackText: 'AC' }); expect(fallback()!.textContent).toBe('AC'); component.updateFallback({ delay: 100 }); flushSync(); expect(fallback()!.textContent).toBe('AC');
});
it('F:176 keeps the fallback visible across a number -> undefined -> number delay change', () => {
  vi.useFakeTimers(); const { component } = setup({ fallbackProps: { delay: 100 }, fallbackText: 'AC' }); expect(fallback()).toBe(null);
  component.updateFallback({ delay: undefined }); flushSync(); expect(fallback()!.textContent).toBe('AC'); component.updateFallback({ delay: 100 }); flushSync(); expect(fallback()!.textContent).toBe('AC');
});
it('F:203 keeps fallback mounted and image unmounted while the image is loading', () => {
  mockImageLoading(); const { component } = setup({ fallbackText: 'AC' }); expect(image()).toBe(null); expect(fallback()).not.toBe(null);
  component.updateImage({ src: 'avatar.png' }); flushSync(); expect(image()).toBe(null); expect(fallback()).not.toBe(null);
});
it('F:245 keeps only one of image or fallback mounted when switching to image', () => {
  mockImageLoading({ completeOnSet: true }); const { component } = setup({ fallbackText: 'AC', fallbackProps: { style: 'animation: test-exit 2s' } }); expect(image()).toBe(null); expect(fallback()).not.toBe(null);
  component.updateImage({ src: 'avatar.png' }); flushSync(); expect(image()).not.toBe(null); expect(fallback()).toBe(null);
});
