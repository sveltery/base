<script lang="ts">
	import { Dialog } from '#lib';

	let completions = $state<boolean[]>([]);
</script>

<pre data-testid="completions">{completions.join(',')}</pre>
<Dialog.Root onOpenChangeComplete={(open) => completions.push(open)}>
	<Dialog.Trigger>Open</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Popup>Content</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
