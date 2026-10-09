<script lang="ts">
	import { useOpen } from './void-signal-object-helper.js';

	let open = false;
	let enabled = true;

	$effect(() => {
		useOpen(() => ({ enabled, open }));
	});

	function publish(read: () => { open?: boolean; enabled?: boolean }) {
		const { enabled: shown } = read();
		return shown;
	}

	publish(() => ({ enabled, open }));
</script>
