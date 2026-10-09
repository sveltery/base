<script lang="ts">
	import { OTPFieldModel } from './previous-value-cross-model.js';

	let value = '';
	function noteValue(next: string) {
		return next;
	}
	const model = new OTPFieldModel();
	$effect(() => {
		model.noteValue(model.value);
	});
	void noteValue;
	void value;
</script>
