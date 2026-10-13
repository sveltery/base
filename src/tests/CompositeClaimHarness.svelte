<script lang="ts">
	import { CompositeRoot } from '../lib/internal/composite-root.svelte.js';

	const roving = new CompositeRoot({ keys: 'arrows' });
	const indexA = roving.claim();
	roving.tabIndex(null, indexA, { disabled: false });
	const indexB = roving.claim();
	roving.tabIndex(null, indexB, { disabled: true });
	const indexC = roving.claim();
	roving.tabIndex(null, indexC, { disabled: true });
	const removeA = roving.register(document.createElement('button'), () => ({ disabled: false }));
	roving.register(document.createElement('button'), () => ({ disabled: true }));
	roving.register(document.createElement('button'), () => ({ disabled: true }));

	let report = $state('idle');

	function leave() {
		removeA();
		const indexD = roving.claim();
		roving.tabIndex(null, indexD, { disabled: true });
		const indexE = roving.claim();
		const tab = roving.tabIndex(null, indexE, { disabled: false });
		report = JSON.stringify({ indexC, indexD, tab });
	}
</script>

<button type="button" onclick={leave}>Leave</button>
<output data-testid="report">{report}</output>
