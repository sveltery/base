<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { Button, type ButtonProps } from '#lib';

	type Variant = 'native' | 'span' | 'link' | 'bubble' | 'becomes-disabled' | 'form' | 'attach';

	let {
		variant = 'native',
		label = 'Save',
		disabled = false,
		focusableWhenDisabled = false,
		custom = false,
		type,
		form,
		class: className,
		tabindex,
		onclick,
		onmousedown,
		onpointerdown,
		onkeydown,
		onkeyup,
		onmousemove,
		onfocus,
		onblur,
		onsubmit,
		oncapture,
		onrender,
		onancestor,
		withAfter = false
	}: {
		variant?: Variant;
		label?: string;
		disabled?: boolean;
		focusableWhenDisabled?: boolean;
		/** attach variant: spread props onto a custom host instead of the default button. */
		custom?: boolean;
		type?: ButtonProps['type'];
		form?: string;
		class?: string;
		tabindex?: number;
		onclick?: ButtonProps['onclick'];
		onmousedown?: ButtonProps['onmousedown'];
		onpointerdown?: ButtonProps['onpointerdown'];
		onkeydown?: ButtonProps['onkeydown'];
		onkeyup?: ButtonProps['onkeyup'];
		onmousemove?: ButtonProps['onmousemove'];
		onfocus?: ButtonProps['onfocus'];
		onblur?: ButtonProps['onblur'];
		onsubmit?: (event: SubmitEvent) => void;
		oncapture?: (event: MouseEvent) => void;
		onrender?: (event: MouseEvent) => void;
		onancestor?: (event: MouseEvent) => void;
		withAfter?: boolean;
	} = $props();

	let turnedOff = $state(false);
	let host = $state<HTMLElement | null>(null);

	function capture(node: HTMLElement) {
		host = node;
		return () => {
			host = null;
		};
	}

	const shared = $derived({
		disabled,
		focusableWhenDisabled,
		onclick,
		onmousedown,
		onpointerdown,
		onkeydown,
		onkeyup,
		onmousemove,
		onfocus,
		onblur,
		...(type === undefined ? {} : { type }),
		...(form === undefined ? {} : { form }),
		...(className === undefined ? {} : { class: className }),
		...(tabindex === undefined ? {} : { tabindex })
	} satisfies Partial<HTMLButtonAttributes> & Pick<ButtonProps, 'focusableWhenDisabled'>);
</script>

{#if variant === 'link'}
	<Button nativeButton={false} {...shared}>
		{#snippet render(props)}
			<a {...props} href="#target">{label}</a>
		{/snippet}
	</Button>
{:else if variant === 'span'}
	<Button nativeButton={false} {...shared}>
		{#snippet render(props)}
			<span {...props}>{label}</span>
		{/snippet}
	</Button>
{:else if variant === 'bubble'}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div onclick={onancestor}>
		<Button nativeButton={false} {...shared}>
			{#snippet render(props)}
				<!-- React merges the render element's click with Button's. The snippet composes both. -->
				<span
					{...props}
					onclickcapture={oncapture}
					onclick={(event) => {
						onrender?.(event);
						props.onclick?.(event);
					}}>{label}</span
				>
			{/snippet}
		</Button>
	</div>
{:else if variant === 'becomes-disabled'}
	<Button
		disabled={turnedOff}
		focusableWhenDisabled
		onclick={(event) => {
			onclick?.(event);
			turnedOff = true;
		}}>{label}</Button
	>
{:else if variant === 'form'}
	<form
		onsubmit={(event) => {
			event.preventDefault();
			onsubmit?.(event);
		}}
	>
		<Button {...shared}>{label}</Button>
	</form>
{:else if variant === 'attach'}
	{#if custom}
		<Button {@attach capture}>
			{#snippet render(props, buttonState)}
				<button
					{...props}
					class="custom-host"
					data-disabled-state={buttonState.disabled ? 'yes' : 'no'}>{label}</button
				>
			{/snippet}
		</Button>
	{:else}
		<Button class="default-host" {@attach capture}>{label}</Button>
	{/if}
	<output data-testid="host">{host?.className ?? 'none'}</output>
{:else}
	<Button {...shared}>{label}</Button>
	{#if withAfter}
		<button type="button">After</button>
	{/if}
{/if}
