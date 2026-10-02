// Fixture adapters for Base UI 47b40521; MIT: parity/avatar/UPSTREAM_LICENSE.
export const avatarDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
export const avatarMockSource = '/avatar-assets/mock-a.png';
export const avatarNextMockSource = '/avatar-assets/mock-b.png';
export const avatarRealSource = 'https://avatar.test/avatar-a.png';
export const avatarNextRealSource = 'https://avatar.test/avatar-b.png';
export type AvatarProbe = { complete: boolean; naturalWidth: number; onload: (() => void) | null; onerror: (() => void) | null; src: string; srcset: string; sizes: string; crossOrigin: string | null; referrerPolicy: string; writes: string[] };
export type AvatarHarness = {
  probes: AvatarProbe[];
  statuses: string[];
  callbacks: string[];
  events: string[];
  sourceKeys: string[];
  constructed: number;
  animationReads: number;
  firstPaint?: { fallback: boolean; image: boolean; starting: boolean; hidden: string | null };
};
declare global { interface Window { avatarHarness: AvatarHarness; avatarHydrate?: () => ReturnType<typeof avatarSnapshot> } }
export function installAvatarHarness(scenario: string) {
  const originalImage = window.Image;
  const animationFlags = globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean };
  const originalAnimationFlag = animationFlags.BASE_UI_ANIMATIONS_DISABLED;
  animationFlags.BASE_UI_ANIMATIONS_DISABLED = false;
  const completeDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'complete')!;
  const widthDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'naturalWidth')!;
  const harness: AvatarHarness = { probes: [], statuses: [], callbacks: [], events: [], sourceKeys: [], constructed: 0, animationReads: 0 };
  window.avatarHarness = harness;
  const originalAnimations = Element.prototype.getAnimations;
  Element.prototype.getAnimations = function (options) {
    if (this.getAttribute('data-testid') === 'image') { harness.animationReads += 1; if (scenario === 'animation-enter') return []; }
    return originalAnimations.call(this, options);
  };
  const real = scenario.startsWith('real') || scenario === 'no-source-keep' || scenario === 'dropped-ref';
  if (real) {
    window.Image = class extends originalImage { constructor() { super(); harness.constructed += 1; } };
  } else {
    window.Image = function () {
      harness.constructed += 1;
      const values: Record<string, unknown> = { src: '', srcset: '', sizes: '', crossOrigin: null, referrerPolicy: '' };
      const cached = ['cached', 'cached-error', 'native', 'srcset', 'conformance', 'animation', 'animation-enter', 'fallback-loaded', 'remove-loaded'].includes(scenario);
      const probe = { complete: false, naturalWidth: 0, onload: null, onerror: null, writes: [] } as unknown as AvatarProbe;
      for (const key of Object.keys(values)) Object.defineProperty(probe, key, { enumerable: true, get: () => values[key], set(value: unknown) {
        probe.writes.push(key); values[key] = value;
        if (cached && (key === 'src' || key === 'srcset')) { probe.complete = true; probe.naturalWidth = scenario === 'cached-error' ? 0 : 100; }
      } });
      harness.probes.push(probe);
      return probe;
    } as unknown as typeof Image;
    Object.defineProperty(HTMLImageElement.prototype, 'complete', { configurable: true, get() { return this.getAttribute('src')?.includes('/avatar-assets/') || this.getAttribute('srcset')?.includes('/avatar-assets/') ? false : completeDescriptor.get!.call(this); } });
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', { configurable: true, get() { return this.getAttribute('src')?.includes('/avatar-assets/') || this.getAttribute('srcset')?.includes('/avatar-assets/') ? 0 : widthDescriptor.get!.call(this); } });
  }
  // The mocked rendered elements are driven by explicit events, like upstream's JSDOM cases.
  function ignoreNetworkEvent(event: Event) { if (event.isTrusted && event.target instanceof HTMLImageElement && (event.target.getAttribute('src')?.includes('/avatar-assets/') || event.target.getAttribute('srcset')?.includes('/avatar-assets/'))) event.stopImmediatePropagation(); }
  window.addEventListener('load', ignoreNetworkEvent, true); window.addEventListener('error', ignoreNetworkEvent, true);
  return () => {
    window.Image = originalImage;
    animationFlags.BASE_UI_ANIMATIONS_DISABLED = originalAnimationFlag;
    Element.prototype.getAnimations = originalAnimations;
    Object.defineProperty(HTMLImageElement.prototype, 'complete', completeDescriptor);
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', widthDescriptor);
    window.removeEventListener('load', ignoreNetworkEvent, true); window.removeEventListener('error', ignoreNetworkEvent, true);
  };
}
export function avatarConfig(scenario: string) {
  const real = scenario.startsWith('real') || scenario === 'dropped-ref';
  const keepMounted = scenario.startsWith('keep') || scenario.startsWith('real-keep') || scenario === 'no-source-keep' || scenario === 'dropped-ref';
  return {
    keepMounted,
    src: ['animation-enter', 'empty', 'delay', 'delay-zero', 'delay-undefined', 'fallback-error', 'no-source-keep'].includes(scenario) ? undefined : scenario === 'srcset' || scenario === 'keep-callback-source' || scenario === 'keep-render-source' ? undefined : real ? scenario === 'real-keep-cached' || scenario === 'real-keep-replacement' || scenario === 'dropped-ref' ? avatarDataUri : avatarRealSource : avatarMockSource,
    srcSet: scenario.endsWith('responsive') && real ? `${avatarRealSource} 1x, ${avatarNextRealSource} 2x` : ['native', 'probe-responsive', 'srcset', 'keep-order'].includes(scenario) ? `${avatarMockSource} 1x, /avatar-assets/mock-2x.png 2x` : undefined,
    sizes: scenario.endsWith('responsive') || ['native', 'probe-responsive', 'srcset', 'keep-order'].includes(scenario) ? '48px' : undefined,
    delay: scenario === 'delay' ? 1000 : scenario === 'delay-zero' ? 0 : undefined,
    real,
  };
}
export function avatarSnapshot(node: ParentNode) {
  const image = node.querySelector('[data-testid="image"]');
  return { fallback: !!node.querySelector('[data-testid="fallback"]'), image: !!image, starting: !!image?.hasAttribute('data-starting-style'), hidden: image?.getAttribute('aria-hidden') ?? null, src: image?.getAttribute('src') ?? null, accessibleImage: !!image && image.getAttribute('aria-hidden') !== 'true' };
}
