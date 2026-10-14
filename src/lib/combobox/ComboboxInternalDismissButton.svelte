<!--
	A visually hidden button screen reader users can press to close the popup.
	Derived from Base UI v1.9.0 packages/react/src/combobox/utils/ComboboxInternalDismissButton.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createChangeEventDetails, REASONS, visuallyHiddenInput } from '@sveltery/utils';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { toCssStyle } from '../internal/css-style.js';
	import { useComboboxRoot } from './context.svelte.js';

	let { edge }: { edge: 'start' | 'end' } = $props();

	const store = useComboboxRoot();

	function register(element: HTMLElement) {
		const key = edge === 'start' ? 'startDismissElement' : 'endDismissElement';
		store[key] = element;
		return () => {
			if (store[key] === element) store[key] = null;
		};
	}
	const button = new ButtonBehavior(() => ({ disabled: false, native: false }));

	const hostProps = $derived({
		...button.props({
			onclick(event: MouseEvent) {
				store.setOpen(
					false,
					createChangeEventDetails(REASONS.closePress, event, event.currentTarget as HTMLElement)
				);
			}
		}),
		'aria-label': 'Dismiss',
		tabindex: undefined,
		style: toCssStyle(visuallyHiddenInput)
	});
</script>

<span {...hostProps} {@attach register}></span>
