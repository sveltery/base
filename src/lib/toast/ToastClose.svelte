<!--
	Closes the toast when clicked. Renders a `<button>` element.
	Derived from Base UI v1.9.0 packages/react/src/toast/close/ToastClose.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Button behavior is `ButtonBehavior`. State is `{ type }` only, as upstream's `useButton`
	adds no `data-disabled`.
-->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useToastRoot, useToastStore } from './context.js';
	import type { ToastCloseProps, ToastCloseState } from './types.js';

	let {
		disabled = false,
		nativeButton = true,
		render,
		children,
		...elementProps
	}: ToastCloseProps = $props();

	const store = useToastStore();
	const rootContext = useToastRoot();
	const button = new ButtonBehavior(() => ({ disabled, native: nativeButton }));

	let hasFocus = $state(false);

	const closeState: ToastCloseState = $derived({ type: rootContext.toast.type });

	const hostProps: HTMLButtonAttributes = $derived(
		button.props(
			mergeProps(
				{
					'aria-hidden': String(!rootContext.expanded && !hasFocus) as 'true' | 'false',
					onclick() {
						store.closeToast(rootContext.toast.id);
					},
					onfocus() {
						hasFocus = true;
					},
					onblur() {
						hasFocus = false;
					},
					...getStateAttributesProps(closeState)
				},
				elementProps
			)
		)
	);
</script>

{#if render}
	{@render render(hostProps, closeState, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
