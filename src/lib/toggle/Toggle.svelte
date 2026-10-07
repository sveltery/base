<!--
	A two-state button that can be on or off. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/toggle/Toggle.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { Controlled } from '../internal/controlled.svelte.js';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import type { ToggleClickEvent, ToggleProps, ToggleState } from './types.js';

	let {
		pressed: pressedProp,
		defaultPressed = false,
		disabled = false,
		onPressedChange,
		onclick,
		render,
		children,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-useless-assignment -- read by the parent through bind:ref
		ref = $bindable(null),
		// Toggle never participates in forms and cannot change its button type.
		form: _form,
		type: _type,
		...elementProps
	}: ToggleProps = $props();

	const pressed = new Controlled(
		() => pressedProp,
		() => defaultPressed
	);

	const state: ToggleState = $derived({ pressed: pressed.value, disabled });

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		let baseUIHandlerPrevented = false;
		const clickEvent = Object.assign(event, {
			preventBaseUIHandler() {
				baseUIHandlerPrevented = true;
			}
		}) as ToggleClickEvent;
		onclick?.(clickEvent);
		if (baseUIHandlerPrevented || disabled) {
			return;
		}

		const nextPressed = !pressed.value;
		const details = createChangeEventDetails(REASONS.none, event);
		onPressedChange?.(nextPressed, details);
		if (details.isCanceled) {
			return;
		}
		pressed.value = nextPressed;
	}

	const refKey = createAttachmentKey();

	const hostProps: HTMLButtonAttributes = $derived({
		type: 'button',
		...elementProps,
		...getStateAttributesProps(state),
		'aria-pressed': state.pressed,
		disabled,
		onclick: handleClick,
		[refKey]: (node: HTMLElement) => {
			ref = node;
			return () => {
				ref = null;
			};
		}
	});
</script>

{#if render}
	{@render render(hostProps, state)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
