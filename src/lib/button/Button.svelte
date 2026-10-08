<!--
	A button that triggers an action. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/button/Button.tsx and the
	non-composite paths of packages/react/src/internals/use-button/useButton.ts,
	packages/react/src/utils/useFocusableWhenDisabled.ts and
	packages/react/src/utils/dispatchClickWithModifiers.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { currentHost, dispatchClick, isLink } from '../internal/click.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import type { ButtonHostProps, ButtonProps, ButtonState } from './types.js';

	let {
		disabled = false,
		focusableWhenDisabled = false,
		nativeButton = true,
		onclick,
		onmousedown,
		onpointerdown,
		onkeydown,
		onkeyup,
		render,
		children,
		...elementProps
	}: ButtonProps = $props();

	const state: ButtonState = $derived({ disabled });

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (disabled) {
			event.preventDefault();
			return;
		}
		onclick?.(event);
	}

	// Pinned behavior, tracked in https://github.com/sveltery/base/issues/66 :
	// a disabled mousedown does not cancel its default, so a chorded press can still focus.
	function handleMouseDown(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (!disabled) onmousedown?.(event);
	}

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if (disabled) {
			event.preventDefault();
			return;
		}
		onpointerdown?.(event);
	}

	function handleKeyDown(
		event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if (disabled) {
			// Let Tab leave a focusable disabled button. Block every other key's default.
			if (focusableWhenDisabled && event.key !== 'Tab') event.preventDefault();
			return;
		}

		onkeydown?.(event);
		if (event.defaultPrevented) return;

		const current = currentHost(event);
		if (!current) return;

		const buttonElement = current instanceof HTMLButtonElement;
		const link = isLink(current, nativeButton);
		const shouldClick = nativeButton ? buttonElement : !link;
		const isEnter = event.key === 'Enter';
		const isSpace = event.key === ' ';

		// Native buttons activate themselves. Links keep Enter and only suppress Space scrolling.
		if (!shouldClick || nativeButton || (!isSpace && !isEnter)) {
			if (link && isSpace) event.preventDefault();
			return;
		}

		event.preventDefault();
		if (isEnter) dispatchClick(current, event);
	}

	function handleKeyUp(event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (disabled) return;

		onkeyup?.(event);
		// Upstream keeps no keydown/keyup memory: a prevented Space keydown still clicks on keyup
		// unless this keyup itself is prevented.
		if (event.defaultPrevented || nativeButton || event.key !== ' ') return;

		const current = currentHost(event);
		if (!current) return;
		dispatchClick(current, event);
	}

	const hostProps: HTMLButtonAttributes = $derived({
		...(nativeButton ? { type: 'button' as const } : { role: 'button' as const }),
		tabindex: !nativeButton && disabled && !focusableWhenDisabled ? -1 : 0,
		...((nativeButton && focusableWhenDisabled) || (!nativeButton && disabled)
			? { 'aria-disabled': disabled }
			: {}),
		...(nativeButton && !focusableWhenDisabled && disabled ? { disabled: true } : {}),
		...elementProps,
		...getStateAttributesProps(state),
		onclick: handleClick,
		onmousedown: handleMouseDown,
		onpointerdown: handlePointerDown,
		onkeydown: handleKeyDown,
		onkeyup: handleKeyUp
	});
</script>

{#if render}
	{@render render(hostProps as ButtonHostProps, state, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
