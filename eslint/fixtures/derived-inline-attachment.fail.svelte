<!--
	Fixture the no-derived-inline-attachment rule must reject.
	An inline arrow used as an attachment inside $derived props.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';

	const bindKey = createAttachmentKey();
	let triggerEl: HTMLElement | null = null;

	const hostProps = $derived({
		id: 'trigger',
		onclick: () => {},
		[bindKey]: (node: HTMLElement) => {
			triggerEl = node;
			return () => {
				if (triggerEl === node) triggerEl = null;
			};
		},
		[createAttachmentKey()]: function (node: HTMLElement) {
			void node;
		}
	});

	const rebound = $derived.by(() => ({
		'bind:this': (node: HTMLElement) => {
			triggerEl = node;
		}
	}));
</script>

<button {...hostProps}>Open</button>
<p>{rebound ? '' : ''}</p>
