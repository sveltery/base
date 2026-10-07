<script lang="ts">
	import { DEV } from 'esm-env';

	let element: HTMLElement | null = null;
	let nativeLabel = true;

	$effect(() => {
		if (!DEV || !element) return;
		if (nativeLabel && element.tagName !== 'LABEL') console.error('expected a label');
	});

	export function devWarn(message: string) {
		if (!DEV) return;
		console.warn(message);
	}
</script>
