<!--
	Groups all parts of the accordion. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/accordion/root/AccordionRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { warn } from '@sveltery/utils';
	import { WrittenReference } from '../internal/written-reference.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { rootStateAttributesMapping } from './attributes.js';
	import { AccordionRootModel, setAccordionRootContext } from './context.svelte.js';
	import type { AccordionRootProps, AccordionRootState } from './types.js';

	let {
		value = $bindable(),
		disabled = false,
		hiddenUntilFound = false,
		keepMounted,
		loopFocus: _loopFocus = true,
		onValueChange,
		multiple = false,
		orientation = 'vertical',
		render,
		children,
		...elementProps
	}: AccordionRootProps = $props();

	const EMPTY: unknown[] = [];
	const selection = new WrittenReference<unknown[] | undefined>(
		() => value,
		(next) => {
			value = next;
		}
	);
	const accordion = new AccordionRootModel(
		() => selection.current ?? EMPTY,
		() => disabled,
		() => multiple,
		() => orientation,
		() => hiddenUntilFound,
		() => keepMounted ?? false,
		() => onValueChange
	);
	accordion.commit = (next) => selection.set(next);
	setAccordionRootContext(accordion);

	$effect(() => {
		if (hiddenUntilFound && keepMounted === false) {
			warn(
				'The `keepMounted={false}` prop on `Accordion.Root` is ignored when `hiddenUntilFound` is enabled, since panels must remain mounted while closed.'
			);
		}
	});

	const state: AccordionRootState = $derived({
		value: accordion.values,
		disabled: accordion.disabled,
		orientation: accordion.orientation
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...getStateAttributesProps(state, rootStateAttributesMapping),
		...elementProps
	});
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
