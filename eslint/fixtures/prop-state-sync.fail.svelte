<script lang="ts">
	// Copied from TabsRoot, RadioGroup, CheckboxGroup, AccordionRoot, and ToolbarRoot.
	// Each block only copies props into state inside an effect.
	let {
		value = $bindable(undefined),
		orientation = 'horizontal',
		loopFocus = true,
		disabled = false
	}: {
		value?: unknown;
		orientation?: string;
		loopFocus?: boolean;
		disabled?: boolean;
	} = $props();

	let writes = 0;
	let seenWrites = 0;
	let seenValue = value;
	const tabs = { orientation: 'horizontal', value: 0, applyExternal(_next: unknown) {} };

	$effect.pre(() => {
		tabs.orientation = orientation;

		if (value === undefined) return;
		const incoming = value;
		if (writes !== seenWrites) {
			seenWrites = writes;
			seenValue = incoming;
			return;
		}
		if (incoming === seenValue) return;
		seenValue = incoming;
		tabs.applyExternal(incoming);
	});

	const root = { roving: { loopFocus: true, orientation: 'horizontal' } };
	$effect.pre(() => {
		root.roving.loopFocus = loopFocus;
		root.roving.orientation = orientation;
	});

	let disabledState = $state(false);
	$effect.pre(() => {
		disabledState = Boolean(disabled);
	});
</script>
