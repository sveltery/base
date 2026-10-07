<!--
	Provides a reading direction to descendant components. Renders no element.
	Derived from Base UI v1.8.0 packages/react/src/direction-provider/DirectionProvider.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { setDirectionContext } from '../internal/direction-context.js';
	import type { DirectionProviderProps } from './types.js';

	let { direction = 'ltr', children }: DirectionProviderProps = $props();

	// The getter is the provider prop. Descendants read it; nothing copies it into state.
	setDirectionContext(() => direction);
</script>

{@render children?.()}
