<script lang="ts">
	// Derived from Base UI v1.9.0 packages/react/src/utils/FocusGuard.tsx
	// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { platform } from './platform.js';
	import { visuallyHiddenStyle } from './visuallyHidden.js';

	let {
		children: _children,
		attach,
		...rest
	}: HTMLAttributes<HTMLSpanElement> & { attach?: Attachment<HTMLSpanElement> } = $props();

	function apply(node: HTMLSpanElement) {
		return attach?.(node);
	}

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
	style={visuallyHiddenStyle}
	{@attach apply}
></span>
