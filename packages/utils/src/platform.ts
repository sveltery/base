// Derived from Base UI v1.8.0 packages/utils/src/platform
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// One module. NumberField, ScrollArea, and later overlay code import `platform` from here.
// `DEV` replaces `process.env.NODE_ENV`. Flags are read once at module load and are false
// when `navigator` is missing.

import { DEV } from 'esm-env';

interface UserAgentBrand {
	brand: string;
	version: string;
}

interface UserAgentData {
	brands?: UserAgentBrand[];
	platform?: string;
}

function readRawData() {
	if (typeof navigator === 'undefined') {
		return { userAgent: '', platform: '', maxTouchPoints: 0 };
	}

	if (DEV) {
		const uaData = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData;
		if (uaData && Array.isArray(uaData.brands)) {
			return {
				userAgent: uaData.brands.map(({ brand, version }) => `${brand}/${version}`).join(' '),
				platform: uaData.platform ?? navigator.platform ?? '',
				maxTouchPoints: navigator.maxTouchPoints ?? 0
			};
		}
	}

	return {
		userAgent: navigator.userAgent,
		platform: navigator.platform ?? '',
		maxTouchPoints: navigator.maxTouchPoints ?? 0
	};
}

const { userAgent, platform: platformName, maxTouchPoints } = readRawData();
const lowerUserAgent = userAgent.toLowerCase();
const lowerPlatform = platformName.toLowerCase();

/** iPhone, iPad (including iPadOS 13+ reporting as macOS), iPod. */
const ios = /^i(os$|p)/.test(lowerPlatform) || (lowerPlatform === 'macintel' && maxTouchPoints > 1);

/** Android phones, tablets, and embedded Android browsers. */
const android = lowerPlatform === 'android' || lowerUserAgent.includes('android');

/** macOS desktop. Excludes iPadOS, which reports as `MacIntel`. */
const mac = !ios && lowerPlatform.startsWith('mac');

/** Windows desktop. */
const windows = lowerPlatform.startsWith('win');

/** Linux desktop (including Chrome OS). */
const linux = !android && /^(linux|chrome os)/.test(lowerPlatform);

/** Any Apple OS (`mac || ios`). */
const apple = mac || ios;

/**
 * WebKit: Safari, all iOS browsers, GNOME Web. Excludes Blink.
 * Distinguished by the legacy `-webkit-backdrop-filter` name.
 */
const webkit = typeof CSS !== 'undefined' && !!CSS.supports?.('-webkit-backdrop-filter:none');

/** Gecko: Firefox. Mutually exclusive with WebKit. */
const gecko = !webkit && lowerUserAgent.includes('firefox');

/** Blink: Chrome, Edge, Opera, Brave, and other Chromium-based browsers. */
const blink = !webkit && lowerUserAgent.includes('chrom');

/**
 * The user may be using VoiceOver. Actual activation is not detectable.
 * True on any Apple platform.
 */
const voiceOver = apple;

/** Running in jsdom or HappyDOM. */
const jsdom = /jsdom|happydom/.test(lowerUserAgent);

/** CSS `@supports` query matching iOS/iPadOS WebKit browsers. */
const iOS = '@supports (-webkit-touch-callout: none)';

export const platform = {
	os: { ios, android, mac, windows, linux, apple },
	engine: { webkit, gecko, blink },
	screenReader: { voiceOver },
	env: { jsdom },
	mediaQuery: { iOS }
};
