<script lang="ts">
	import { Checkbox } from '#lib';

	let { scrollerDir, contentDir }: { scrollerDir: 'ltr' | 'rtl'; contentDir: 'ltr' | 'rtl' } =
		$props();
</script>

<div data-testid="scroller" dir={scrollerDir} style="width: 100px; height: 100px; overflow: auto">
	<!-- A transform makes this the fixed-position containing block, below the scroller's top edge. -->
	<div dir={contentDir} style="transform: translateY(20px)">
		<Checkbox.Root aria-label="Accept" />
	</div>
</div>
