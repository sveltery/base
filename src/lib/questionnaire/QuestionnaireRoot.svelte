<!--
	A form that shows one item at a time and validates each before it moves on. Renders a `<form>` element.
	Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/components.tsx and use-questionnaire-root.ts
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { DEV } from 'esm-env';
	import { chain } from '../internal/mergeProps.js';
	import { QuestionnaireModel, setRoot } from './root-state.svelte.js';
	import type { QuestionnaireRootProps } from './types.js';
	import { dataAttributes } from './utils.js';

	let {
		item = $bindable(),
		defaultItem,
		items,
		onItemChange,
		shortcuts,
		novalidate = true,
		onkeydown,
		onreset,
		onsubmit,
		children,
		...rest
	}: QuestionnaireRootProps = $props();

	const root = new QuestionnaireModel({
		get item() {
			return item;
		},
		get defaultItem() {
			return defaultItem;
		},
		get items() {
			return items;
		},
		get shortcuts() {
			return shortcuts;
		},
		get novalidate() {
			return novalidate;
		},
		select(next, report) {
			item = next;
			if (report) onItemChange?.(next);
		}
	});
	item ??= root.initialItem ?? undefined;
	setRoot(root);

	$effect(() => root.reconcile());
	$effect(() => root.followFocus());
	if (DEV) $effect(() => root.warn());
</script>

<form
	{novalidate}
	data-shortcuts={shortcuts}
	{...dataAttributes(root.state)}
	{...rest}
	onkeydown={chain((event) => root.keydown(event), onkeydown)}
	onreset={chain(() => root.reset(), onreset)}
	onsubmit={(event) => {
		if (!root.submit()) return event.preventDefault();
		onsubmit?.(event);
	}}
	{@attach root.attach}
>
	{@render children?.()}
</form>
