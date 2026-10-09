<script lang="ts">
	import { CompositeRoot } from '../lib/internal/composite-root.svelte.js';

	const roving = new CompositeRoot({ keys: 'arrows' });
	const indexA = roving.claim(false);
	const indexB = roving.claim(true);
	const indexC = roving.claim(true);
	const nodeA = document.createElement('button');
	const nodeB = document.createElement('button');
	const nodeC = document.createElement('button');
	const removeA = roving.register(nodeA, () => ({ disabled: false }), indexA);
	roving.register(nodeB, () => ({ disabled: true }), indexB);
	roving.register(nodeC, () => ({ disabled: true }), indexC);

	let report = $state('idle');

	function leave() {
		removeA();
		const indexD = roving.claim(true);
		const indexE = roving.claim(false);
		const tab = roving.tabIndex(null, indexE, { disabled: false });
		report = JSON.stringify({ indexC, indexD, tab });
	}
</script>

<button type="button" onclick={leave}>Leave</button>
<output data-testid="report">{report}</output>
