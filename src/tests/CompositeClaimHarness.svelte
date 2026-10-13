<script lang="ts">
	import { CompositeRoot } from '../lib/internal/composite-root.svelte.js';

	const roving = new CompositeRoot({ keys: 'arrows' });
	const claimA = roving.claim(false);
	const claimB = roving.claim(true);
	const claimC = roving.claim(true);
	const removeA = roving.register(
		document.createElement('button'),
		() => ({ disabled: false }),
		claimA
	);
	roving.register(document.createElement('button'), () => ({ disabled: true }), claimB);
	roving.register(document.createElement('button'), () => ({ disabled: true }), claimC);

	let report = $state('idle');

	function leave() {
		removeA();
		const claimD = roving.claim(true);
		const claimE = roving.claim(false);
		const tab = roving.tabIndex(null, claimE, { disabled: false });
		report = JSON.stringify({ indexC: claimC.index, indexD: claimD.index, tab });
	}
</script>

<button type="button" onclick={leave}>Leave</button>
<output data-testid="report">{report}</output>
