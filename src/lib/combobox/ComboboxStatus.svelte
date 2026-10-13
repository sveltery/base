<!--
	Announces status messages, such as a loading state, politely to screen readers.
	Keep it mounted and change its children, so screen readers announce the change.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/status/ComboboxStatus.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { announceInitialText } from './dom.js';
	import type { ComboboxStatusProps, ComboboxStatusState } from './types.js';

	let { render, children, ...elementProps }: ComboboxStatusProps = $props();

	const liveKey = createAttachmentKey();
	const partState: ComboboxStatusState = {};
	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		role: 'status',
		'aria-live': 'polite',
		'aria-atomic': true,
		...elementProps,
		[liveKey]: announceInitialText
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
