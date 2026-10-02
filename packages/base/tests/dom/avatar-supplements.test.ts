// Additional regressions beyond the immutable Avatar ordinary declaration inventory.
// These supplements earn no ordinary parity credit. Base UI v1.8.0 source contract; MIT.
import { expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import { Avatar } from '../../src/lib/avatar/index.js';
import { cleanupWith, fallback, fireImage, image, mockImageLoading, resolveProbe, setup, settle } from './avatar-test-utils.js';
import Conformance from './avatar-conformance-fixture.svelte';

it('supplement source/options replacement abandons stale detached completion handlers', () => {
  const images = mockImageLoading(), changed = vi.fn(); const { component } = setup({ imageProps: { src: 'first.png', onLoadingStatusChange: changed } }); const stale = images[0];
  component.updateImage({ src: 'second.png', crossorigin: 'use-credentials', referrerpolicy: 'origin', sizes: '64px', srcset: 'second.png 1x' }); flushSync();
  expect(images).toHaveLength(2); expect(images[1].crossOrigin).toBe('use-credentials'); expect(images[1].referrerPolicy).toBe('origin'); expect(images[1].sizes).toBe('64px');
  stale.onload?.(); flushSync(); expect(image()).toBe(null); expect(fallback()).not.toBe(null); expect(changed.mock.calls.map(([status]) => status)).toEqual(['loading']);
  resolveProbe(images); expect(image()!.getAttribute('src')).toBe('second.png'); expect(fallback()).toBe(null); stale.onerror?.(); flushSync(); expect(fallback()).toBe(null);
});
it('supplement detached callbacks cannot publish after Image teardown', () => {
  const images = mockImageLoading(), changed = vi.fn(); const { component } = setup({ imageProps: { src: 'avatar.png', onLoadingStatusChange: changed } });
  component.showImage(false); flushSync(); images[0].onload?.(); images[0].onerror?.(); flushSync(); expect(changed.mock.calls.map(([status]) => status)).toEqual(['loading']); expect(fallback()).not.toBe(null);
});
it('supplement user error cancellation preserves rendered loading status', () => {
  const changed = vi.fn(); setup({ imageProps: { src: 'avatar.png', keepMounted: true, onerror: event => event.preventBaseUIHandler(), onLoadingStatusChange: changed } }); fireImage('error');
  expect(image()!.hasAttribute('data-loading')).toBe(true); expect(image()!.hasAttribute('data-error')).toBe(false); expect(changed.mock.calls.map(([status]) => status)).toEqual(['loading']);
});
it('supplement native preventDefault alone still permits the Base UI handler', () => {
  setup({ imageProps: { src: 'avatar.png', keepMounted: true, onload: event => event.preventDefault() } }); fireImage('load'); expect(fallback()).toBe(null);
});
it('supplement delay change clears old timer and teardown clears pending timer', () => {
  vi.useFakeTimers(); const { component } = setup({ fallbackProps: { delay: 100 } }); vi.advanceTimersByTime(50); component.updateFallback({ delay: 200 }); flushSync();
  vi.advanceTimersByTime(50); flushSync(); expect(fallback()).toBe(null); vi.advanceTimersByTime(150); flushSync(); expect(fallback()).not.toBe(null);
  component.remove(); flushSync(); expect(vi.getTimerCount()).toBe(0);
});
it('supplement cached srcSet without src takes the synchronous loaded path', () => {
  mockImageLoading({ completeOnSet: true }); const changed = vi.fn(); setup({ imageProps: { srcset: 'avatar@2x.png 2x', onLoadingStatusChange: changed } });
  expect(image()!.getAttribute('srcset')).toBe('avatar@2x.png 2x'); expect(image()!.hasAttribute('src')).toBe(false); expect(fallback()).toBe(null); expect(changed.mock.calls.map(([status]) => status)).toEqual(['loaded']);
});
for (const name of ['Image', 'Fallback'] as const) it(`supplement ${name} rejects missing Avatar context`, () => {
  expect(() => name === 'Image' ? mount(Avatar.Image, { target: document.createElement('div') }) : mount(Avatar.Fallback, { target: document.createElement('div') })).toThrow('AvatarRootContext is missing');
});
for (const part of ['Root', 'Fallback'] as const) it(`supplement ${part} actual replacement refs clear on host replacement and removal`, () => {
  const host = document.createElement('main'); document.body.append(host); const component = mount(Conformance, { target: host, props: { part, mode: 'function' } }); cleanupWith(() => unmount(component)); flushSync();
  const [old, renderOld] = component.refs(); expect(old).toBe(renderOld); expect(old!.tagName).toBe('DIV'); component.replace(); flushSync();
  const [current, renderCurrent] = component.refs(); expect(current).toBe(renderCurrent); expect(current!.tagName).toBe('SECTION'); expect(old!.isConnected).toBe(false); component.remove(); flushSync(); expect(component.refs()).toEqual([null, null]);
});
it('supplement reopening abandons an earlier exit completion', async () => {
  vi.useFakeTimers(); mockImageLoading({ completeOnSet: true }); const { component } = setup({ imageProps: { src: 'first.png' } }); const node = image()!;
  let complete!: () => void; node.getAnimations = () => [{ finished: new Promise<void>(resolve => { complete = resolve; }) } as unknown as Animation];
  component.updateImage({ src: undefined }); flushSync(); expect(node.hasAttribute('data-ending-style')).toBe(true); vi.advanceTimersByTime(20);
  component.updateImage({ src: 'second.png' }); flushSync(); complete(); await settle(); vi.advanceTimersByTime(20); flushSync(); expect(image()).toBe(node); expect(fallback()).toBe(null); expect(node.hasAttribute('data-ending-style')).toBe(false);
});
it('supplement pending exit cleanup tolerates Image removal before animation completion', async () => {
  vi.useFakeTimers(); mockImageLoading({ completeOnSet: true }); const { component } = setup({ imageProps: { src: 'avatar.png' } }); const node = image()!;
  let complete!: () => void; node.getAnimations = () => [{ finished: new Promise<void>(resolve => { complete = resolve; }) } as unknown as Animation];
  component.updateImage({ src: undefined }); flushSync(); vi.advanceTimersByTime(20); component.showImage(false); flushSync(); complete(); await settle(); expect(image()).toBe(null); expect(fallback()).not.toBe(null);
});
it('supplement rejected animation waits for replacement animation before unmount', async () => {
  vi.useFakeTimers(); mockImageLoading({ completeOnSet: true }); const { component } = setup({ imageProps: { src: 'avatar.png' } });
  let reject!: () => void, complete!: () => void; let replacement = false;
  const first = { finished: new Promise<void>((_resolve, rejectPromise) => { reject = rejectPromise; }), playState: 'running', pending: false } as unknown as Animation;
  const second = { finished: new Promise<void>(resolve => { complete = resolve; }), playState: 'running', pending: false } as unknown as Animation;
  image()!.getAnimations = () => [replacement ? second : first]; component.updateImage({ src: undefined }); flushSync(); vi.advanceTimersByTime(20); replacement = true; reject(); await settle(); expect(image()).not.toBe(null);
  complete(); await settle(); expect(image()).toBe(null);
});
it('supplement Root state and teardown stay within each Avatar owner', () => {
  const images = mockImageLoading(); const first = setup({ imageProps: { src: 'first.png' } }), second = setup({ imageProps: { src: 'second.png' } });
  images[0].onload?.(); flushSync(); expect(first.host.querySelector('[data-testid=fallback]')).toBe(null); expect(second.host.querySelector('[data-testid=fallback]')).not.toBe(null);
  expect(first.host.querySelector('[data-testid=root]')!.className).toBe('root-loaded'); expect(second.host.querySelector('[data-testid=root]')!.className).toBe('root-loading');
  first.component.showImage(false); flushSync(); expect(first.host.querySelector('[data-testid=fallback]')).not.toBe(null); expect(second.host.querySelector('[data-testid=root]')!.className).toBe('root-loading');
  images[1].onload?.(); flushSync(); expect(second.host.querySelector('[data-testid=fallback]')).toBe(null);
});
it('supplement state class/style callbacks follow rendered loading, loaded and error transitions', () => {
  setup({ imageProps: { keepMounted: true, src: 'avatar.png', class: state => [state.imageLoadingStatus, { active: true }], style: state => `opacity:${state.imageLoadingStatus === 'loaded' ? 1 : 0}` }, fallbackProps: { style: state => `color:${state.imageLoadingStatus === 'error' ? 'red' : 'green'}` } });
  expect(image()!.className).toBe('loading active'); expect(image()!.style.opacity).toBe('0'); expect(fallback()!.style.color).toBe('green'); fireImage('load');
  expect(image()!.className).toBe('loaded active'); expect(image()!.style.opacity).toBe('1'); expect(fallback()).toBe(null); fireImage('error'); expect(image()!.className).toBe('error active'); expect(fallback()!.style.color).toBe('red');
});
