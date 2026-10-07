<script lang="ts">
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

	const shown = geometry;
</script>

<span>{shown}{active ? '1' : '0'}</span>
