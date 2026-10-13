<!-- An element with a consumer style string and the menu's own live styles, spread like Menu.Popup. -->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { liveStyle } from '#lib/menu/live-style.js';

	let { style, own }: { style: string; own: Record<string, string> } = $props();

	const styleKey = createAttachmentKey();
	const ownStyle = liveStyle(
		() => own,
		() => style
	);
	const attributes = $derived({ 'data-testid': 'styled', style, [styleKey]: ownStyle });
</script>

<div {...attributes}></div>
