<!-- Re-provides the enclosing Field's context with a source binding, as a bound Field.Root will. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setFieldContext, useFieldContext } from '#lib/field/context.svelte.js';
	import type { ControlKind, FieldHandle } from '#lib/form/source.js';

	let { binding, type, children }: { binding: FieldHandle; type?: ControlKind; children: Snippet } =
		$props();

	const field = useFieldContext();
	setFieldContext(
		new Proxy(field, {
			get(target, key) {
				if (key === 'binding') return binding;
				if (key === 'controlType') return type;
				const value = Reflect.get(target, key, target);
				return typeof value === 'function' ? value.bind(target) : value;
			}
		})
	);
</script>

{@render children()}
