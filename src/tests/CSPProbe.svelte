<script lang="ts">
	import { useCSPContext } from '#lib/internal/csp-context.js';

	let { id = 'csp' }: { id?: string } = $props();

	const csp = useCSPContext();
</script>

<span data-testid="{id}-nonce">{csp.nonce === undefined ? 'undefined' : csp.nonce}</span>
<span data-testid="{id}-styles">{String(csp.disableStyleElements)}</span>
