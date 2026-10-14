<!--
	Enables filtering for the menu or submenu it wraps. Add `Menu.Input` to the popup and place
	its items in `Menu.List`. Wrap each searchable submenu in its own provider.
	Does not render its own HTML element.
	Derived from Base UI v1.9.0 packages/react/src/menu/filter-provider/MenuFilterProvider.tsx and
	MenuFilterProviderOptions.ts (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
	MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { setMenuFilterProvider } from './filter-root.svelte.js';
	import type { MenuFilterProviderProps } from './types.js';

	let {
		value = $bindable(''),
		onValueChange,
		filter,
		autoHighlight = false,
		locale,
		children
	}: MenuFilterProviderProps = $props();

	setMenuFilterProvider({
		get filter() {
			return filter;
		},
		get autoHighlight() {
			return autoHighlight;
		},
		get locale() {
			return locale;
		},
		get value() {
			return value;
		},
		setValue(next, details) {
			onValueChange?.(next, details);
			if (!details.isCanceled) value = next;
		}
	});
</script>

{@render children?.()}
