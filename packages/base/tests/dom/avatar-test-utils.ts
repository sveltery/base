// Image mock adapted from AvatarImage.test.tsx:27 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c (MIT).
import { flushSync, mount, unmount } from 'svelte';
import type { ComponentProps } from 'svelte';
import { afterEach, vi } from 'vitest';
import Fixture from './avatar-fixture.svelte';
export interface MockImage {
  complete: boolean; naturalWidth: number; onload: (() => void) | null; onerror: (() => void) | null;
  referrerPolicy: string; crossOrigin: string | null; sizes: string; src: string; srcset: string;
}
const cleanups: (() => void | Promise<void>)[] = [];
export function cleanupWith(fn: () => void | Promise<void>) { cleanups.push(fn); }
afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
  vi.useRealTimers(); document.body.replaceChildren();
});
export function mockImageLoading({ completeOnSet = false, naturalWidth = 100 } = {}) {
  const OriginalImage = window.Image;
  const images: MockImage[] = [];
  window.Image = function MockImage() {
    let src = '', srcset = '';
    const image: MockImage = {
      complete: false, naturalWidth: 0, onload: null, onerror: null, referrerPolicy: '', crossOrigin: null, sizes: '',
      get src() { return src; }, set src(value: string) { src = value; if (completeOnSet) { image.complete = true; image.naturalWidth = naturalWidth; } },
      get srcset() { return srcset; }, set srcset(value: string) { srcset = value; if (completeOnSet) { image.complete = true; image.naturalWidth = naturalWidth; } },
    };
    images.push(image); return image;
  } as unknown as typeof window.Image;
  cleanupWith(() => { window.Image = OriginalImage; });
  return images;
}
export function setup(props: ComponentProps<typeof Fixture> = {}) {
  const host = document.createElement('main'); document.body.append(host);
  const component = mount(Fixture, { target: host, props }); cleanupWith(() => unmount(component)); flushSync();
  return { host, component };
}
export function image() { return document.querySelector<HTMLImageElement>('[data-testid=image]'); }
export function fallback() { return document.querySelector<HTMLElement>('[data-testid=fallback]'); }
export function fireImage(type: 'load' | 'error') { image()!.dispatchEvent(new Event(type)); flushSync(); }
export function resolveProbe(images: MockImage[], type: 'load' | 'error' = 'load') { images.at(-1)?.[type === 'load' ? 'onload' : 'onerror']?.(); flushSync(); }
export async function settle() { await Promise.resolve(); flushSync(); await Promise.resolve(); flushSync(); }
// These descriptors model the browser's synchronous cached/source-less image state.
// They do not establish native cache or animation timing; paired Chromium witnesses do that.
export function renderedCompleteness(resolve: (node: HTMLImageElement) => { complete: boolean; naturalWidth: number }) {
  const complete = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'complete')!;
  const naturalWidth = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'naturalWidth')!;
  Object.defineProperty(HTMLImageElement.prototype, 'complete', { configurable: true, get() { return resolve(this).complete; } });
  Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', { configurable: true, get() { return resolve(this).naturalWidth; } });
  cleanupWith(() => { Object.defineProperty(HTMLImageElement.prototype, 'complete', complete); Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', naturalWidth); });
}
