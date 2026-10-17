<!--
	Groups all parts of the combobox.
	Doesn't render its own HTML element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/root/ComboboxRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	`actionsRef` is the exported `close` and `unmount`. Bind the root with `bind:this`.
-->
<script
	lang="ts"
	generics="Value = unknown, Multiple extends boolean | undefined = false, Item = Value"
>
	import AriaCombobox from './AriaCombobox.svelte';
	import type { ComboboxRootProps } from './types.js';

	let {
		value = $bindable(),
		defaultValue,
		onValueChange,
		inputValue = $bindable(),
		open = $bindable(false),
		defaultOpen,
		multiple,
		autocomplete,
		autoHighlight = false,
		...rest
	}: ComboboxRootProps<Value, Multiple, Item> = $props();
	// The fallback stands for an omitted `open`, so `defaultOpen` replaces it.
	// svelte-ignore state_referenced_locally
	if (open === false && defaultOpen !== undefined) open = defaultOpen;

	let core: AriaCombobox;

	export function close() {
		core.close();
	}

	export function unmount() {
		core.unmount();
	}
</script>

<AriaCombobox
	bind:this={core}
	{...rest as Record<string, unknown>}
	selectionMode={multiple ? 'multiple' : 'single'}
	bind:selectedValue={() => value, (next) => (value = next as never)}
	defaultSelectedValue={defaultValue}
	onSelectedValueChange={onValueChange as never}
	bind:inputValue
	bind:open
	formAutoComplete={autocomplete}
	{autoHighlight}
/>
