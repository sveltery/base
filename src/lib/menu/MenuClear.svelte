<!--
	A button that clears the input text. Requires the menu to be wrapped in `Menu.FilterProvider`.
	Renders a `<button>` element while the input has text.
	Derived from Base UI v1.9.0 packages/react/src/menu/clear/MenuClear.tsx and
	packages/react/src/filter-dropdown/clear/FilterDropdownClear.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { REASONS, createChangeEventDetails } from '@sveltery/utils';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useMenuFilterPart } from './filter-part.js';
	import type { MenuClearProps, MenuClearState } from './types.js';

	let {
		disabled: disabledProp = false,
		nativeButton = true,
		render,
		children,
		...elementProps
	}: MenuClearProps = $props();

	const { root, filter } = useMenuFilterPart('Clear');
	const disabled = $derived(root.store.disabled || (disabledProp ?? false));
	const button = new ButtonBehavior(() => ({ disabled, native: nativeButton }));

	// `visible` is not part of the state: the button renders nothing while it is false.
	const partState: MenuClearState = $derived({ disabled });

	const hostProps = $derived(
		button.props(
			mergeProps(
				{
					tabindex: -1,
					'aria-hidden': true as const,
					onmousedown(event: MouseEvent) {
						// Keep focus on the input.
						event.preventDefault();
					},
					onclick(event: MouseEvent) {
						filter.onValueChange('', createChangeEventDetails(REASONS.clearPress, event));
						root.store.focusOwner?.focus({ preventScroll: true });
					},
					...getStateAttributesProps(partState)
				},
				elementProps
			)
		)
	);
</script>

{#if filter.query !== ''}
	{#if render}
		{@render render(hostProps, partState, children)}
	{:else}
		<button {...hostProps}>{@render children?.()}</button>
	{/if}
{/if}
