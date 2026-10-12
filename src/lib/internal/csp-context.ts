// Derived from Base UI v1.8.0 packages/react/src/internals/csp-context/CSPContext.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import type { CSPReading } from '../csp-provider/types.js';
import { defineOptionalContext } from './context.js';

const [readCSP, provideCSP] = defineOptionalContext<CSPReading>({
	nonce: undefined,
	disableStyleElements: false
});

/** Descendants read the properties, so the provider props stay the source of truth. */
export function setCSPContext(
	readNonce: () => string | undefined,
	readDisableStyleElements: () => boolean | undefined
) {
	provideCSP({
		get nonce() {
			return readNonce();
		},
		get disableStyleElements() {
			return readDisableStyleElements();
		}
	});
}

/**
 * Nearest provider CSP configuration.
 * Outside a provider, `disableStyleElements` is `false` and `nonce` is `undefined`.
 * Call during component init. Read the properties in the template or in `$derived`.
 * Not part of the package entry. Components import this module.
 */
export function useCSPContext(): CSPReading {
	return readCSP();
}
