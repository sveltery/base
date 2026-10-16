<!--
	Displays a status message whose content changes are announced politely to screen readers.
	Useful for conveying the status of an asynchronously loaded list.
	This component's root element must remain mounted in the DOM to announce
	changes consistently across screen readers. Avoid hiding or removing the
	component itself with `display: none`, `hidden`, `aria-hidden`, or conditional
	rendering. Prefer updating or conditionally rendering its children instead.
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
