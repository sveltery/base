<script lang="ts">
	// Copied from FieldLabel and collapsible/warn.ts.
	let element: HTMLElement | null = null;
	let nativeLabel = true;

	$effect(() => {
		if (!element) return;
		const env = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
			?.NODE_ENV;
		if (env === 'production') return;
		if (nativeLabel && element.tagName !== 'LABEL') console.error('expected a label');
	});

	export function devWarn(message: string) {
		const env = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
			?.NODE_ENV;
		if (env === 'production') return;
		console.warn(message);
	}
</script>
