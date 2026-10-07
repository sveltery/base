import { afterEach, describe, expect, it, vi } from 'vitest';

interface Probe {
	userAgent?: string;
	platform?: string;
	maxTouchPoints?: number;
	userAgentData?: { brands: { brand: string; version: string }[]; platform?: string };
}

async function load(probe: Probe | undefined, cssSupportsWebkit = false) {
	vi.resetModules();
	if (probe === undefined) {
		vi.stubGlobal('navigator', undefined);
	} else {
		vi.stubGlobal('navigator', {
			userAgent: probe.userAgent ?? '',
			platform: probe.platform ?? '',
			maxTouchPoints: probe.maxTouchPoints ?? 0,
			userAgentData: probe.userAgentData
		});
	}
	vi.stubGlobal('CSS', {
		supports: (query: string) => cssSupportsWebkit && query.includes('-webkit-backdrop-filter')
	});
	const module = await import('./platform.ts');
	return module.platform;
}

describe('platform', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.resetModules();
	});

	it('is false for every flag when navigator is missing', async () => {
		const platform = await load(undefined);
		expect(platform.os).toEqual({
			ios: false,
			android: false,
			mac: false,
			windows: false,
			linux: false,
			apple: false
		});
		expect(platform.engine).toEqual({ webkit: false, gecko: false, blink: false });
		expect(platform.screenReader.voiceOver).toBe(false);
		expect(platform.env.jsdom).toBe(false);
		expect(platform.mediaQuery.iOS).toBe('@supports (-webkit-touch-callout: none)');
	});

	it('treats an iPad that reports MacIntel as iOS, not macOS', async () => {
		const platform = await load({ platform: 'MacIntel', maxTouchPoints: 5, userAgent: 'Mozilla' });
		expect(platform.os.ios).toBe(true);
		expect(platform.os.mac).toBe(false);
		expect(platform.os.apple).toBe(true);
		expect(platform.screenReader.voiceOver).toBe(true);
	});

	it('keeps desktop macOS and Linux distinct', async () => {
		const mac = await load({ platform: 'MacIntel', maxTouchPoints: 0, userAgent: 'Mozilla' });
		expect(mac.os.mac).toBe(true);
		expect(mac.os.ios).toBe(false);

		const linux = await load({ platform: 'Linux x86_64', userAgent: 'Mozilla' });
		expect(linux.os.linux).toBe(true);
		expect(linux.os.android).toBe(false);
	});

	it('marks WebKit, Firefox, and Chromium as mutually exclusive', async () => {
		const webkit = await load({ userAgent: 'Mozilla Firefox', platform: 'MacIntel' }, true);
		expect(webkit.engine.webkit).toBe(true);
		expect(webkit.engine.gecko).toBe(false);
		expect(webkit.engine.blink).toBe(false);

		const firefox = await load({ userAgent: 'Mozilla Firefox', platform: 'Linux' }, false);
		expect(firefox.engine.gecko).toBe(true);
		expect(firefox.engine.blink).toBe(false);

		const chrome = await load({ userAgent: 'Mozilla Chrome', platform: 'Linux' }, false);
		expect(chrome.engine.blink).toBe(true);
		expect(chrome.engine.webkit).toBe(false);
	});

	it('detects jsdom from the user agent', async () => {
		const platform = await load({ userAgent: 'Mozilla/5.0 jsdom/24', platform: 'Linux' });
		expect(platform.env.jsdom).toBe(true);
	});
});
