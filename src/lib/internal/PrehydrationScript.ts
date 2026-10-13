// Derived from Base UI v1.9.0 packages/react/src/internals/PrehydrationScript.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

/**
 * The script element, with the nonce from `CSPProvider` when one is set.
 * `script` is inserted unescaped, so pass only a trusted static string.
 */
export function prehydrationScriptElement(script: string, nonce: string | undefined) {
	const attribute =
		nonce == null ? '' : ` nonce="${nonce.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`;
	return `<script${attribute}>${script}</script>`;
}
