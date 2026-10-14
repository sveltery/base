<!--
	Groups all parts of the autocomplete. Renders no element of its own, only the hidden input a
	form validates.
	Derived from Base UI v1.9.0 packages/react/src/autocomplete/root/AutocompleteRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	`actionsRef` is the exported `close` and `unmount`. Bind the root with `bind:this`.
-->
<script lang="ts" generics="ItemValue = unknown">
	import { REASONS } from '@sveltery/utils';
	import AriaCombobox from '../combobox/AriaCombobox.svelte';
	import type { ComboboxChangeEventDetails } from '../combobox/types.js';
	import { stringifyAsLabel } from '../internal/listbox/resolveValueLabel.js';
	import { useValueChanged } from '../internal/useValueChanged.svelte.js';
	import type { AutocompleteHighlightEventDetails, AutocompleteRootProps } from './types.js';

	let {
		value = $bindable(),
		defaultValue,
		onValueChange,
		open = $bindable(false),
		mode = 'list',
		openOnInputClick = false,
		itemToStringValue,
		filter,
		onItemHighlighted,
		readonly = false,
		...rest
	}: AutocompleteRootProps<ItemValue> = $props();

	// Inline completion writes the highlighted label into the input, which `readonly` prevents.
	const enableInline = $derived((mode === 'inline' || mode === 'both') && !readonly);
	const staticItems = $derived(mode === 'inline' || mode === 'none');

	/** The highlighted item's label, shown in the input in place of the typed text. */
	let inlineValue = $state('');

	useValueChanged(
		() => value,
		() => (inlineValue = '')
	);
	useValueChanged(
		() => enableInline,
		(enabled) => {
			if (!enabled) inlineValue = '';
		}
	);

	const shownValue = $derived(enableInline && inlineValue !== '' ? inlineValue : value);

	function handleValueChange(next: string, details: ComboboxChangeEventDetails) {
		inlineValue = '';
		onValueChange?.(next, details);
	}

	function handleItemHighlighted(
		highlighted: ItemValue | undefined,
		details: AutocompleteHighlightEventDetails
	) {
		onItemHighlighted?.(highlighted, details);
		if (details.reason === REASONS.pointer) return;
		inlineValue =
			enableInline && highlighted != null
				? stringifyAsLabel(highlighted, itemToStringValue as never)
				: '';
	}

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
	{readonly}
	selectionMode="none"
	fillInputOnItemPress
	{openOnInputClick}
	itemToStringLabel={itemToStringValue as never}
	filter={staticItems || filter === null ? null : (filter as never)}
	filterQuery={mode === 'both' ? String(value ?? '').trim() : undefined}
	autoComplete={mode}
	bind:inputValue={
		() => shownValue as string | undefined,
		(next) => {
			inlineValue = '';
			value = next;
		}
	}
	defaultInputValue={defaultValue}
	onInputValueChange={handleValueChange}
	onItemHighlighted={handleItemHighlighted as never}
	bind:open
/>
