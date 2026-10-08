<!--
	Stable attachment functions inside $derived props are allowed.
	An inline event handler is not an attachment.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';

	const bindKey = createAttachmentKey();
	let triggerEl: HTMLElement | null = null;

	function bindTrigger(node: HTMLElement) {
		triggerEl = node;
		return () => {
			if (triggerEl === node) triggerEl = null;
		};
	}

	const hostProps = $derived({
		id: 'trigger',
		onclick: () => {},
		[bindKey]: bindTrigger
	});
</script>

<button {...hostProps}>Open</button>
