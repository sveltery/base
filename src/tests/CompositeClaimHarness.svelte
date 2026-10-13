<script lang="ts">
	import { CompositeRoot } from '../lib/internal/composite-root.svelte.js';

	const roving = new CompositeRoot({ keys: 'arrows' });
	const claimA = roving.claim(false);
	const claimB = roving.claim(true);
	const claimC = roving.claim(true);
	let removeA = roving.register(
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

	function swap() {
		removeA();
		removeA = roving.register(
			document.createElement('button'),
			() => ({ disabled: false }),
			claimA
		);
		const claimD = roving.claim(false);
		const tab = roving.tabIndex(null, claimD, { disabled: false });
		report = JSON.stringify({ tab });
	}
</script>

<button type="button" onclick={leave}>Leave</button>
<button type="button" onclick={swap}>Swap</button>
<output data-testid="report">{report}</output>
