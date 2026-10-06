// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import { DEV } from 'esm-env';

interface NavigatorUAData {
  readonly brands: ReadonlyArray<{ brand: string; version: string }>;
  readonly mobile: boolean;
  readonly platform: string;
}

interface RawNavigatorData {
  readonly userAgent: string;
  readonly platform: string;
  readonly maxTouchPoints: number;
}

/**
 * Reads `navigator.userAgent` / `navigator.platform` (legacy but universally
 * supported) into a normalized shape. In development, prefers the modern
 * `navigator.userAgentData` API on Chromium to avoid DevTools warnings about
 * the deprecated reads; that branch is dead-code-eliminated in production
 * builds to keep the bundle small.
 *
 * Returns empty/zero values when `navigator` is undefined (SSR), so every
 * derived flag safely evaluates to `false`.
 */
function readRawData(): RawNavigatorData {
  if (typeof navigator === 'undefined') {
    return { userAgent: '', platform: '', maxTouchPoints: 0 };
  }

  if (DEV) {
    const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData | undefined })
      .userAgentData;

    if (uaData && Array.isArray(uaData.brands)) {
      return {
        userAgent: uaData.brands.map(({ brand, version }) => `${brand}/${version}`).join(' '),
        platform: uaData.platform ?? navigator.platform ?? '',
        maxTouchPoints: navigator.maxTouchPoints ?? 0,
      };
    }
  }

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform ?? '',
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
  };
}

const { userAgent, platform, maxTouchPoints } = readRawData();
export const lowerUserAgent = userAgent.toLowerCase();
export const lowerPlatform = platform.toLowerCase();
export { maxTouchPoints };
