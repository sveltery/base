<!--
	The text label of a select item. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/select/item-text/SelectItemText.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The popup lines this text up with the trigger's value when `alignItemWithTrigger` is on.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useSelectItem } from './context.svelte.js';
	import type { SelectItemTextProps, SelectItemTextState } from './types.js';

	let { render, children, ...elementProps }: SelectItemTextProps = $props();

	const item = useSelectItem();
	const bindKey = createAttachmentKey();
	const partState: SelectItemTextState = {};

	function bindText(node: HTMLElement) {
		item.setText(node);
		return () => item.setText(null);
	}

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...elementProps,
		[bindKey]: bindText
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
