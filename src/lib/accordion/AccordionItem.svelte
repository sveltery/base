<!--
	Groups an accordion header with the corresponding panel. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/accordion/item/AccordionItem.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Open and close motion is the Collapsible root already on main. This item only
	decides whether that root is open from the accordion value list.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { CollapsibleRoot, setCollapsibleRootContext } from '../collapsible/context.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { accordionStateAttributesMapping } from './attributes.js';
	import {
		AccordionItemModel,
		setAccordionItemContext,
		useAccordionRootContext
	} from './context.svelte.js';
	import type { AccordionItemProps, AccordionItemState } from './types.js';

	const uid = $props.id();
	const accordion = useAccordionRootContext();
	const indexKey = createAttachmentKey();

	let {
		value: valueProp,
		disabled: disabledProp = false,
		onOpenChange,
		render,
		children,
		...elementProps
	}: AccordionItemProps = $props();

	const itemValue = $derived(valueProp === undefined ? `base-ui-${uid}` : valueProp);
	const disabled = $derived(disabledProp || accordion.disabled);
	const open = $derived(accordion.values.indexOf(itemValue) !== -1);

	let host = $state<HTMLElement | null>(null);
	const index = $derived(host ? accordion.indexOf(host) : -1);

	const collapsible = new CollapsibleRoot(
		() => accordion.values.indexOf(itemValue) !== -1,
		() => {
			// The value list is the open state. CollapsibleRoot still calls this after
			// onOpenChange, and writing a second boolean would fight the list.
		},
		() => disabled,
		(next, details) => {
			onOpenChange?.(next, details);
			if (details.isCanceled) return;
			accordion.handleValueChange(itemValue, next, details);
		},
		`base-ui-${uid}-panel`
	);
	setCollapsibleRootContext(collapsible);

	const itemState: AccordionItemState = $derived({
		value: accordion.values,
		disabled,
		orientation: accordion.orientation,
		hidden: !open && !collapsible.mounted,
		index,
		open
	});

	const item = new AccordionItemModel(`base-ui-${uid}-trigger`, () => itemState);
	setAccordionItemContext(item);

	function watchHost(element: HTMLElement) {
		untrack(() => {
			host = element;
		});
		const remove = accordion.watchHost(element);
		return () => {
			remove();
			untrack(() => {
				if (host === element) host = null;
			});
		};
	}

	const hostProps: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLDivElement>> =
		$derived({
			...elementProps,
			...getStateAttributesProps(itemState, accordionStateAttributesMapping),
			[indexKey]: watchHost
		});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(hostProps, itemState, content)}
{:else}
	<div {...hostProps}>{@render content()}</div>
{/if}
