<script lang="ts">
	import { createDismissPopup } from './dismiss-popup.svelte.js';

	const popup = createDismissPopup('child-popup');
</script>

<div data-testid="child" data-open={popup.store.open ? '' : undefined} {@attach popup.bindFloating}>
	<button type="button">Child</button>
</div>
