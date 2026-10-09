<!--
	Fixture the no-react-refs rule must allow.
	Element access is $state plus bind:this. Element side effects are
	{@attach} and createAttachmentKey. `current` in a callback or
	`event.currentTarget` is not a React ref.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';

	let el = $state<HTMLFormElement | null>(null);
	let inputNode = $state<HTMLInputElement | null>(null);
	const attachmentKey = createAttachmentKey();

	let { onsubmit }: { onsubmit?: (event: SubmitEvent) => void } = $props();

	function rememberForm(node: HTMLFormElement) {
		el = node;
		return () => {
			if (el === node) el = null;
		};
	}

	function onClick(event: MouseEvent) {
		const current = event.currentTarget;
		onsubmit?.(event);
		void current;
	}

	const hostProps = $derived({
		onsubmit: onClick,
		[attachmentKey]: rememberForm
	});
</script>

<form bind:this={el} {@attach rememberForm} {...hostProps}></form>
<input bind:this={inputNode} {@attach rememberForm} />
<a href="#target">Target</a>
