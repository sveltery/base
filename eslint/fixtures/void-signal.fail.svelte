<script lang="ts">
	import { untrack } from 'svelte';
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

	let style = '';
	let dir = 'ltr';
	function refreshRoot(_style: string, _dir: string) {
		return 0;
	}
	$effect(() => {
		refreshRoot(style, dir);
	});

	function sync(disabled: boolean) {
		untrack(() => disabled);
	}
	$effect(() => {
		sync(disabledState);
	});

	let height = 0;
	let width = 0;
	$effect(() => {
		const _height = height;
		const _width = width;
		return 0;
	});

	function publish(current: { validate?: () => void } | undefined) {
		const incoming = current?.validate;
		actions = actionsHandle;
		return incoming;
	}
	publish(actions);

	function syncCopied(disabled = false) {
		const itemDisabled = disabled;
		untrack(() => {
			if (itemDisabled) return 1;
		});
	}
	syncCopied(disabledState);

	function syncToolbar(disabled = false, focusableWhenDisabled = true) {
		const nativeDisabled = disabled && !focusableWhenDisabled;
		untrack(() => {
			if (nativeDisabled) return 1;
		});
	}
	syncToolbar(disabledState, focusableWhenDisabled);

	class Layout {
		get threshold() {
			return 0;
		}
		computeThumbPosition() {}
		refreshLayout() {
			const threshold = this.threshold;
			untrack(() => this.computeThumbPosition());
			return threshold;
		}
	}
	const layout = new Layout();
	$effect(() => {
		layout.refreshLayout();
	});
</script>
