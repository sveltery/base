<!--
	A native input element that automatically works with Field.
	Renders an `<input>` element.
	Derived from Base UI v1.8.0 packages/react/src/input/Input.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	This is Field.Control. The shared unset sentinel keeps an omitted value uncontrolled.
-->
<script lang="ts">
	import { Field } from '../field/index.js';
	import { FIELD_VALUE_UNSET } from '../field/constants.js';
	import type { InputProps } from './types.js';

	let {
		value = $bindable(FIELD_VALUE_UNSET as unknown as InputProps['value']),
		...rest
	}: InputProps = $props();
</script>

<Field.Control {...rest} bind:value />
