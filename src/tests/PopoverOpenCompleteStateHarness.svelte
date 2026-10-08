<script lang="ts">
	import { Popover } from '#lib';

	let completions = $state<boolean[]>([]);
</script>

<pre data-testid="completions">{completions.join(',')}</pre>
<Popover.Root onOpenChangeComplete={(open) => completions.push(open)}>
	<Popover.Trigger>Open</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner>
			<Popover.Popup>Content</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
