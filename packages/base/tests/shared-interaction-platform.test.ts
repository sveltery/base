// Supplemental native environment witnesses for the pinned static platform body (MIT).
import { afterEach, expect, it, vi } from 'vitest';
afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});
it('imports the original classifier without browser globals and retains SSR defaults', async () => {
  vi.resetModules();
  vi.stubGlobal('navigator', undefined);
  vi.stubGlobal('CSS', undefined);
  const { platform } = await import('../src/lib/utils/platform/index.js');
  for (const group of [platform.os, platform.engine, platform.screenReader, platform.env]) {
    expect(Object.values(group).every((value) => value === false)).toBe(true);
  }
  expect(platform.mediaQuery.iOS).toBe('@supports (-webkit-touch-callout: none)');
});
it('uses development UA-CH before legacy values while preserving iPad and engine branches', async () => {
  vi.resetModules();
  vi.stubGlobal('CSS', undefined);
  vi.stubGlobal('navigator', {
    userAgent: 'Legacy Android',
    platform: 'Linux',
    maxTouchPoints: 2,
    userAgentData: { brands: [{ brand: 'Chromium', version: '153' }], platform: 'MacIntel' },
  });
  const { platform } = await import('../src/lib/utils/platform/index.js');
  expect(platform.os.ios).toBe(true);
  expect(platform.os.mac).toBe(false);
  expect(platform.os.android).toBe(false);
  expect(platform.engine.blink).toBe(true);
  expect(platform.screenReader.voiceOver).toBe(true);
});
it('keeps the legacy Android/Linux fallback when UA-CH is absent', async () => {
  vi.resetModules();
  vi.stubGlobal('CSS', undefined);
  vi.stubGlobal('navigator', {
    userAgent: 'Mozilla Android',
    platform: 'Linux',
    maxTouchPoints: 5,
  });
  const { platform } = await import('../src/lib/utils/platform/index.js');
  expect(platform.os.android).toBe(true);
  expect(platform.os.linux).toBe(false);
  expect(platform.os.ios).toBe(false);
});
