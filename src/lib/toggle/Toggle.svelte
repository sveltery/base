<!--
	A two-state button that can be on or off. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/toggle/Toggle.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). `nativeButton` and the toolbar item
	metadata follow v1.9.0 (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
	MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import type { CompositeHandlers } from '../internal/composite-root.svelte.js';
	import { createChangeEventDetails, error, REASONS } from '@sveltery/utils';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useToggleGroupContext } from '../toggle-group/context.svelte.js';
	import type { ToggleHostProps, ToggleProps, ToggleState } from './types.js';

	const uid = $props.id();
	const group = useToggleGroupContext();

	let {
		pressed = $bindable(),
		defaultPressed,
		disabled = false,
		value: valueProp,
		nativeButton = true,
		onPressedChange,
		onclick,
		onfocus,
		onkeydown,
		render,
		children,
		// Toggle never participates in forms and cannot change its button type.
		form: _form,
		type: _type,
		...elementProps
	}: ToggleProps = $props();
	// svelte-ignore state_referenced_locally
	if (pressed === undefined && defaultPressed !== undefined) pressed = defaultPressed;

	// "" is treated as omitted, matching useBaseUiId(valueProp || undefined).
	const resolvedValue = $derived(valueProp ? valueProp : `base-ui-${uid}`);
	const disabledState = $derived(disabled || (group?.disabled ?? false));
	const pressedState = $derived(group ? group.values.includes(resolvedValue) : pressed === true);
	const toggleState: ToggleState = $derived({ pressed: pressedState, disabled: disabledState });

	let node = $state<HTMLElement | null>(null);
	const claim = group?.roving.claim(untrack(() => disabledState));

	function register(element: HTMLElement) {
		node = element;
		const remove = group?.roving.register(
			element,
			() => ({
				value: resolvedValue,
				disabled: disabledState
			}),
			claim
		);
		return () => {
			remove?.();
			if (node === element) node = null;
		};
	}

	$effect(() => {
		if (!group?.valueProvided || valueProp !== undefined) return;
		error(
			'A `<Toggle>` component rendered in a `<ToggleGroup>` has no explicit `value` prop. This will cause issues between the Toggle Group and Toggle values. Provide the `<Toggle>` with a `value` prop matching the `<ToggleGroup>` values prop type.'
		);
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;

		const nextPressed = !pressedState;
		const details = createChangeEventDetails(REASONS.none, event);
		// onPressedChange runs before the group commits so canceling here vetoes both.
		onPressedChange?.(nextPressed, details);
		if (details.isCanceled) return;

		if (group) {
			group.setGroupValue(resolvedValue, nextPressed, details);
			return;
		}

		pressed = nextPressed;
	}

	const button = new ButtonBehavior(() => ({
		disabled: disabledState,
		native: nativeButton,
		composite: group !== undefined
	}));

	// An outer composite item, such as a Toolbar.Button that renders this Toggle, passes its
	// own tabindex and registration in `elementProps`, and those win over the group's.
	// In a group, the group's focus handler replaces `onfocus` and calls it first.
	const hostProps: HTMLButtonAttributes = $derived(
		button.props({
			onfocus,
			onkeydown,
			...(claim &&
				group?.roving.item(
					node,
					register,
					{
						onfocus: onfocus as CompositeHandlers['onfocus'],
						onkeydown: onkeydown as CompositeHandlers['onkeydown']
					},
					claim,
					{ disabled: disabledState }
				)),
			...elementProps,
			...getStateAttributesProps(toggleState),
			'aria-pressed': pressedState,
			onclick: handleClick
		})
	);
</script>

{#if render}
	{@render render(hostProps as ToggleHostProps, toggleState, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
