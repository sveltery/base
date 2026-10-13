<!-- Runs `run` with the toast manager in an effect once `active` is true. -->
<script lang="ts">
	import { Toast, type GetToastManagerReturnValue } from '#lib';

	let { active, run }: { active: boolean; run: (manager: GetToastManagerReturnValue) => void } =
		$props();

	const manager = Toast.getToastManager();

	$effect(() => {
		if (active) run(manager);
	});
</script>
