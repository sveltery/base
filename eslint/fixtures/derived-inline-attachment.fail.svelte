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

	function host(k: symbol) {
		return {
			[k]: (node: HTMLElement) => {
				void node;
			}
		};
	}

	let flag = false;
	const stable = (node: HTMLElement) => {
		void node;
	};

	const fromHelper = $derived(host(bindKey));
	const conditional = $derived({
		[bindKey]: flag
			? (node: HTMLElement) => {
					void node;
				}
			: stable
	});
	const bound = $derived({ [bindKey]: stable.bind(null) });
	const declared = $derived.by(() => {
		function attach(node: HTMLElement) {
			void node;
		}
		return { [bindKey]: attach };
	});
	const assigned = $derived.by(() => {
		let f: (node: HTMLElement) => void;
		f = (node) => {
			void node;
		};
		return { [bindKey]: f };
	});
	const freshKey = $derived({ [createAttachmentKey()]: stable });
</script>

<button {...hostProps}>Open</button>
<p>{rebound ? '' : ''}</p>
