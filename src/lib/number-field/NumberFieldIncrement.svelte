<!--
	A stepper button that increases the field value when clicked.
	Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/number-field/increment/NumberFieldIncrement.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import NumberFieldStepper from './NumberFieldStepper.svelte';
	import type { NumberFieldStepperProps } from './types.js';

	let { children, ...rest }: NumberFieldStepperProps = $props();
</script>

<NumberFieldStepper {...rest} increment {children} />
