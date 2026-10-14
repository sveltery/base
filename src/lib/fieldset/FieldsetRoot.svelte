<!--
	Groups a shared legend with related controls. Renders a `<fieldset>` element.
	Derived from Base UI v1.9.0 packages/react/src/fieldset/root/FieldsetRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLFieldsetAttributes } from 'svelte/elements';
	import {
		FieldsetRootContextValue,
		setFieldsetRootContext,
		findFieldsetRootContext
	} from './context.svelte.js';
	import type { FieldsetRootProps, FieldsetRootState } from './types.js';

	const parent = findFieldsetRootContext();

	let { disabled: disabledProp, render, children, ...elementProps }: FieldsetRootProps = $props();

	const fieldset = new FieldsetRootContextValue(parent, () => disabledProp ?? false);
	setFieldsetRootContext(fieldset);

	const state: FieldsetRootState = $derived({
		disabled: fieldset.disabled
	});

	// One object whose keys each read their own source. A control rendered through `render`
	// spreads it, and Svelte drops an unbound prop's local value whenever a spread object it
	// reads is replaced. A new object when the legend id arrives would reset the control's value.
	const own: Record<string, unknown> = {
		get 'aria-labelledby'() {
			return fieldset.legendId;
		},
		get disabled() {
			return fieldset.disabled;
		},
		get 'data-disabled'() {
			return fieldset.disabled ? '' : undefined;
		}
	};
	const read = (key: string | symbol) =>
		Object.hasOwn(own, key) ? Reflect.get(own, key) : Reflect.get(elementProps, key);
	const hostProps = new Proxy(own, {
		get: (_target, key) => read(key),
		has: (_target, key) => Object.hasOwn(own, key) || key in elementProps,
		ownKeys: () => [...new Set([...Reflect.ownKeys(elementProps), ...Reflect.ownKeys(own)])],
		getOwnPropertyDescriptor: (_target, key) =>
			Object.hasOwn(own, key) || key in elementProps
				? { configurable: true, enumerable: true, value: read(key) }
				: undefined
	}) as HTMLFieldsetAttributes;
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<fieldset {...hostProps}>{@render children?.()}</fieldset>
{/if}
