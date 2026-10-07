<script lang="ts">
	// Copied from ToolbarButton, FieldRoot, and TabsRootModel.
	let disabledState = false;
	let focusableWhenDisabled = true;
	const toolbar = { roving: { sync() {} } };
	const tabs: { disabled: boolean; value: unknown }[] = [];

	$effect(() => {
		void disabledState;
		void focusableWhenDisabled;
		toolbar.roving.sync();
	});

	$effect(() => {
		for (const tab of tabs) {
			void tab.disabled;
			void tab.value;
		}
	});

	let actions: { validate?: () => void } | undefined = undefined;
	const actionsHandle = { validate() {} };
	// Read the incoming bindable before replacing it so the publish is a real assignment.
	void actions;
	actions = actionsHandle;
	void actions.validate;
</script>
