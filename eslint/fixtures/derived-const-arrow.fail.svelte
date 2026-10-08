<!-- A const arrow inside $derived.by is a new attachment every read. -->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';

	const bindKey = createAttachmentKey();
	let triggerEl: HTMLElement | null = null;

	const hostProps = $derived.by(() => {
		const bind = (node: HTMLElement) => {
			triggerEl = node;
		};
		return { [bindKey]: bind };
	});
</script>

<button {...hostProps}>Open</button>
