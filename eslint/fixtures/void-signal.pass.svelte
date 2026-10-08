<script lang="ts">
	import { untrack } from 'svelte';

	let {
		actions = $bindable()
	}: {
		actions?: { validate: () => void };
	} = $props();

	let disabledState = false;
	let focusableWhenDisabled = true;
	const toolbar = {
		roving: {
			syncAfter(disabled: boolean, focusable: boolean) {
				return disabled && focusable;
			}
		}
	};

	const geometry = $derived.by(() => {
		const revision = 0;
		return revision + (disabledState ? 1 : 0);
	});

	let active = false;
	$effect(() => {
		active = toolbar.roving.syncAfter(disabledState, focusableWhenDisabled);
	});

	const actionsHandle = { validate() {} };
	actions = actionsHandle;

	let value = 0;
	function publish(next: number) {
		return next;
	}
	$effect(() => {
		const next = value;
		untrack(() => publish(next));
	});

	const shown = geometry;
</script>

<span>{shown}{active ? '1' : '0'}</span>
