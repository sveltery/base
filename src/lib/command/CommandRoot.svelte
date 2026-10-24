<!--
	A command menu that filters, ranks and selects its items. Renders a `<div>` element.
	Derived from cmdk v1.1.1 cmdk/src/index.tsx (commit dd2250ed608443e8f32bafc5fa2d1d07a3746aa3).
	MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { setContainer } from './parts.svelte.js';
	import { CommandModel, setCommand } from './root-state.svelte.js';
	import type { CommandRootProps } from './types.js';
	import { cmdk, VISUALLY_HIDDEN_STYLE } from './utils.js';

	let {
		label,
		shouldFilter = true,
		filter,
		value = $bindable(),
		defaultValue,
		onValueChange,
		loop = false,
		disablePointerSelection = false,
		vimBindings = true,
		onkeydown,
		children,
		...rest
	}: CommandRootProps = $props();
	// svelte-ignore state_referenced_locally
	if (value === undefined && defaultValue !== undefined) value = defaultValue;

	const id = $props.id();
	const root = new CommandModel({
		id,
		get shouldFilter() {
			return shouldFilter;
		},
		get filter() {
			return filter;
		},
		get loop() {
			return loop;
		},
		get disablePointerSelection() {
			return disablePointerSelection;
		},
		get vimBindings() {
			return vimBindings;
		},
		get value() {
			return value ?? '';
		},
		set value(next) {
			value = next;
		},
		get onValueChange() {
			return onValueChange;
		}
	});
	setCommand(root);
	setContainer(undefined);

	$effect(() => root.reconcile());
	$effect(() => root.followSelection());
</script>

<div
	tabindex="-1"
	{...rest}
	{...cmdk.root}
	onkeydown={(event) => {
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		root.keydown(event);
	}}
	{@attach root.attach}
>
	<label {...cmdk.label} for={root.ids.input} id={root.ids.label} style={VISUALLY_HIDDEN_STYLE}
		>{label}</label
	>{@render children?.()}
</div>
