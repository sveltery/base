import type { Snippet } from 'svelte';

/**
 * Live CSP configuration from the nearest `CSPProvider`.
 * Outside a provider, `nonce` is `undefined` and `disableStyleElements` is `false`.
 * Inside a provider, an omitted prop stays `undefined`. Upstream copies the props
 * through and only the fallback context defaults `disableStyleElements` to `false`.
 * Read these properties in the template or in `$derived`.
 *
 * Upstream `useCSPContext()` returns a plain object. Svelte keeps the provider
 * props as the source of truth, so callers read these properties instead of
 * copying them into state.
 */
export interface CSPReading {
	/** Nonce for inline `<style>` and `<script>` tags. */
	readonly nonce: string | undefined;
	/**
	 * When `true`, components skip inline `<style>` elements.
	 * `false` when no provider is mounted. `undefined` when a provider omits the prop.
	 * Both are falsy, so a consumer that checks the flag still renders style elements.
	 */
	readonly disableStyleElements: boolean | undefined;
}

export interface CSPProviderProps {
	children?: Snippet;
	/**
	 * The nonce value to apply to inline `<style>` and `<script>` tags.
	 */
	nonce?: string | undefined;
	/**
	 * Whether inline `<style>` elements created by Base UI components should not be rendered.
	 * Instead, components must specify the CSS styles via custom class names or other methods.
	 * @default false
	 */
	disableStyleElements?: boolean | undefined;
}
