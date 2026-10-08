<!--
	Groups all parts of the accordion. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/accordion/root/AccordionRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { devWarn } from '../collapsible/warn.js';
	import { createControllableValue } from '../internal/controllable-value.svelte.js';
	import PartHost from '../internal/PartHost.svelte';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { rootStateAttributesMapping } from './attributes.js';
	import { AccordionRootModel, setAccordionRootContext } from './context.svelte.js';
	import type {
		AccordionRootChangeEventDetails,
		AccordionRootProps,
		AccordionRootState
	} from './types.js';

	let {
		value = $bindable(undefined),
		defaultValue,
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
	const controllable = createControllableValue<unknown[], AccordionRootChangeEventDetails>({
		getProp: () => value,
		setProp: (next) => {
			value = next;
		},
		getDefault: () => defaultValue ?? EMPTY
	});
	const accordion = new AccordionRootModel(
		() => controllable.value ?? EMPTY,
		() => disabled,
		() => multiple,
		() => orientation,
		() => hiddenUntilFound,
		() => keepMounted ?? false,
		() => onValueChange
	);
	accordion.commit = (next, details) => {
		controllable.set(next, details);
	};
	setAccordionRootContext(accordion);

	$effect(() => {
		if (hiddenUntilFound && keepMounted === false) {
			devWarn(
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

<PartHost tag="div" {render} {children} elementProps={hostProps} partState={state} />
