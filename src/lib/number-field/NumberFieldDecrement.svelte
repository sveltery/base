<!--
	A stepper button that decreases the field value when clicked.
	Renders a `<button>` element.
	Derived from Base UI v1.9.0 packages/react/src/number-field/decrement/NumberFieldDecrement.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import NumberFieldStepper from './NumberFieldStepper.svelte';
	import type { NumberFieldStepperProps } from './types.js';

	let { children, ...rest }: NumberFieldStepperProps = $props();
</script>

<NumberFieldStepper {...rest} increment={false} {children} />
