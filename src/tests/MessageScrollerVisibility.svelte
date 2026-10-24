<script lang="ts">
	import { getMessageScroller } from '#lib';
	const scroller = getMessageScroller();
</script>

<output data-testid="visibility" data-current-anchor={scroller.visibility.currentAnchorId ?? ''}
	>{scroller.visibility.visibleMessageIds.join(',')}</output
>
