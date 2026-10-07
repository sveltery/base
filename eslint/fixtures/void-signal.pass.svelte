<script lang="ts">
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

	$effect(() => {
		toolbar.roving.syncAfter(disabledState, focusableWhenDisabled);
	});

	let actions: { validate: () => void } | undefined = $bindable();
	const actionsHandle = { validate() {} };
	$effect.pre(() => {
		actions = actionsHandle;
	});

	const shown = geometry;
</script>
