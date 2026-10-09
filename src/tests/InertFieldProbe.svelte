<script lang="ts">
	import { useFieldContext } from '../lib/field/context.svelte.js';

	const field = useFieldContext();
	let status = $state('idle');
	let seen = $state('none');

	function poke() {
		const data = field.validityData;
		const frozen =
			Object.isFrozen(data) && Object.isFrozen(data.state) && Object.isFrozen(data.errors);
		if (!frozen) {
			data.state.valid = false;
			status = 'mutated';
			return;
		}
		try {
			data.state.valid = false;
			status = 'mutated';
		} catch {
			status = 'frozen';
		}
	}

	function read() {
		seen = String(field.validityData.state.valid);
	}
</script>

<button type="button" onclick={poke}>Poke</button>
<button type="button" onclick={read}>Read</button>
<output data-testid="inert">{status}</output>
<output data-testid="seen">{seen}</output>
