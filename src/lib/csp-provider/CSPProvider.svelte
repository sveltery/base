<!--
	Provides a CSP nonce and inline-style policy to descendant components. Renders no element.
	Derived from Base UI v1.8.0 packages/react/src/csp-provider/CSPProvider.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { setCSPContext } from '../internal/csp-context.js';
	import type { CSPProviderProps } from './types.js';

	let { nonce, disableStyleElements, children }: CSPProviderProps = $props();

	// The getters are the provider props. Descendants read them; nothing copies them into state.
	setCSPContext(
		() => nonce,
		() => disableStyleElements
	);
</script>

{@render children?.()}
