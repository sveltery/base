<script lang="ts">
	// Derived from Base UI v1.8.0 packages/react/src/utils/FocusGuard.tsx
	// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

	import type { HTMLAttributes } from 'svelte/elements';
	import { toCssStyle } from './css-style.js';
	import { platform } from './platform.js';
	import { visuallyHidden } from './visuallyHidden.js';

	let { children: _children, ...rest }: HTMLAttributes<HTMLSpanElement> = $props();

	const role = platform.screenReader.voiceOver && platform.engine.webkit ? 'button' : undefined;
</script>

<!-- The guard is focusable on purpose so Tab can enter the popup. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span
	{...rest}
	tabindex="0"
	{role}
	aria-hidden={role ? undefined : 'true'}
	data-base-ui-focus-guard=""
	style={toCssStyle(visuallyHidden)}
></span>
