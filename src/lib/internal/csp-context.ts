// Derived from Base UI v1.8.0 packages/react/src/internals/csp-context/CSPContext.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import type { CSPReading } from '../csp-provider/types.js';
import { createGetterContext } from './getter-context.js';

const DEFAULT_CSP: CSPReading = {
	get nonce() {
		return undefined;
	},
	get disableStyleElements() {
		return false;
	}
};

/**
 * Holds the provider's nonce and style-element getters.
 * Descendants read the properties so the props stay the source of truth.
 */
export class CSPContextValue implements CSPReading {
	constructor(
		private readonly readNonce: () => string | undefined,
		private readonly readDisableStyleElements: () => boolean | undefined
	) {}

	get nonce(): string | undefined {
		return this.readNonce();
	}

	get disableStyleElements(): boolean | undefined {
		return this.readDisableStyleElements();
	}
}

const cspContext = createGetterContext<CSPReading>(DEFAULT_CSP);

export function setCSPContext(
	readNonce: () => string | undefined,
	readDisableStyleElements: () => boolean | undefined
) {
	cspContext.provide(new CSPContextValue(readNonce, readDisableStyleElements));
}

/**
 * Nearest provider CSP configuration.
 * Outside a provider, `disableStyleElements` is `false` and `nonce` is `undefined`.
 * Call during component init. Read the properties in the template or in `$derived`.
 * Not part of the package entry. Components import this module.
 */
export function useCSPContext(): CSPReading {
	return cspContext.read();
}
