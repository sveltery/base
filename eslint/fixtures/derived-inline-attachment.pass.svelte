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

	const stableBind = (node: HTMLElement) => {
		triggerEl = node;
	};

	const hostProps = $derived.by(() => ({
		id: 'trigger',
		onclick: () => {},
		[bindKey]: bindTrigger,
		[createAttachmentKey()]: stableBind
	}));
</script>

<button {...hostProps}>Open</button>
