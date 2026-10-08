<!--
	Button host shared by the trigger and the close button.
	Derived from Base UI v1.8.0 packages/react/src/dialog/trigger/DialogTrigger.tsx
	and packages/react/src/dialog/close/DialogClose.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Button behavior comes from Button.
-->
<script lang="ts" generics="State">
	import type { Attachment } from 'svelte/attachments';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/Button.svelte';
	import type { DialogTriggerHostProps } from './types.js';
	import type { RenderChildren } from '../internal/render-children.js';

	let {
		disabled = false,
		nativeButton = true,
		onclick,
		onmousedown,
		onpointerdown,
		onkeydown,
		onkeyup,
		render,
		state,
		children,
		described,
		attach
	}: {
		disabled?: boolean | null;
		nativeButton?: boolean;
		onclick?: HTMLButtonAttributes['onclick'];
		onmousedown?: HTMLButtonAttributes['onmousedown'];
		onpointerdown?: HTMLButtonAttributes['onpointerdown'];
		onkeydown?: HTMLButtonAttributes['onkeydown'];
		onkeyup?: HTMLButtonAttributes['onkeyup'];
		render?: Snippet<[DialogTriggerHostProps, State, RenderChildren]>;
		state: State;
		children?: Snippet;
		described: Record<string, unknown>;
		attach?: Attachment<HTMLElement>;
	} = $props();
</script>

{#snippet host(props: HTMLAttributes<HTMLElement>, _buttonState: { disabled: boolean })}
	{#if render}
		{@render render(props, state, children)}
	{:else if attach}
		<button {...props} {@attach attach}>{@render children?.()}</button>
	{:else}
		<button {...props}>{@render children?.()}</button>
	{/if}
{/snippet}

<Button
	disabled={disabled === true}
	{nativeButton}
	{onclick}
	{onmousedown}
	{onpointerdown}
	{onkeydown}
	{onkeyup}
	render={host}
	{...described}
/>
