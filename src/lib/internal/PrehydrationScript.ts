// Derived from Base UI v1.8.0 packages/react/src/internals/PrehydrationScript.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

/**
 * The script element, with the nonce from `CSPProvider` when one is set.
 * `script` is inserted unescaped, so pass only a trusted static string.
 */
export function prehydrationScriptElement(script: string, nonce: string | undefined) {
	const attribute =
		nonce == null ? '' : ` nonce="${nonce.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`;
	return `<script${attribute}>${script}</script>`;
}
