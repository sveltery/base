<!--
	A native textarea that works with [Field](https://base.sveltery.dev/components/field) the way
	Input does. Renders a `<textarea>` element. Sveltery addition, with no Base UI counterpart.
	It declares `type?: never`, so a remote form spread of another input kind is a type error.
-->
<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { Field } from '../field/index.js';
	import type { FieldControlProps } from '../field/types.js';
	import type { TextareaProps } from './types.js';

	let { value = $bindable(), render: renderProp, ...rest }: TextareaProps = $props();
	const controlProps = $derived(rest as FieldControlProps);
</script>

<Field.Control {...controlProps} bind:value>
	{#snippet render(props, state, children)}
		{#if renderProp}
			{@render renderProp(props as HTMLTextareaAttributes, state, children)}
		{:else}
			{@const { value: serverValue, ...attributes } = props as HTMLTextareaAttributes & {
				type?: string;
			}}
			<!-- `value` is set only in the server render. The control writes the live value itself. -->
			<textarea {...attributes} value={serverValue}></textarea>
		{/if}
	{/snippet}
</Field.Control>
