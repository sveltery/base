<script lang="ts">
	import { CSPProvider, ScrollArea } from '#lib';

	let { nonce, disableStyleElements = false }: { nonce?: string; disableStyleElements?: boolean } =
		$props();
</script>

<CSPProvider {nonce} {disableStyleElements}>
	<ScrollArea.Root data-testid="root" style="width: 80px; height: 80px">
		<ScrollArea.Viewport data-testid="viewport" style="width: 100%; height: 100%">
			<div style="width: 20px; height: 20px"></div>
		</ScrollArea.Viewport>
	</ScrollArea.Root>
</CSPProvider>
