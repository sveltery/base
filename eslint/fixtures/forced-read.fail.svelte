<script lang="ts">
	import { untrack } from 'svelte';
	// Copied from CollapsiblePanelMotion, ToggleGroup roving sync, Toolbar roving sync,
	// and ScrollAreaModel.queueThumb before those forced reads were removed.
	let height: number | undefined = 1;
	let width: number | undefined = 1;
	let needsLayoutReset = false;
	let disabled = false;
	let focusableWhenDisabled = true;
	let active: HTMLElement | null = null;
	let highlighted: HTMLElement | null = null;

	function resetLayoutStyles(panel: HTMLElement) {
		return panel;
	}
	function isDisabled(element: HTMLElement) {
		return element.hidden;
	}
	function isSkipped(element: HTMLElement) {
		return element.hidden;
	}
	function ensureActive() {
		return active;
	}
	function reconcile() {
		return highlighted;
	}
	function readStyle() {
		return '';
	}
	function readDir() {
		return 'ltr';
	}
	function readThreshold() {
		return 0;
	}
	function direction() {
		return 'ltr';
	}
	function computeThumbPosition() {
		return 0;
	}

	function layout(panel: HTMLElement | null) {
		if (!panel) return;
		if (needsLayoutReset && (height !== undefined || width !== undefined)) {
			return resetLayoutStyles(panel);
		}
	}

	function sync(itemDisabled = false) {
		if (itemDisabled) {
			untrack(() => {
				ensureActive();
				if (active && isDisabled(active)) ensureActive();
			});
			return;
		}
		untrack(() => ensureActive());
	}

	function syncToolbar(itemDisabled = false, focusable = true) {
		if (itemDisabled && !focusable) {
			untrack(() => {
				reconcile();
				if (highlighted && isSkipped(highlighted)) return;
			});
			return;
		}
		untrack(() => reconcile());
	}

	function queueThumb() {
		const seenDirection = direction();
		const style = readStyle();
		const dir = readDir();
		const threshold = readThreshold();
		queueMicrotask(() => {
			if (
				direction() !== seenDirection ||
				readStyle() !== style ||
				readDir() !== dir ||
				readThreshold() !== threshold
			) {
				return;
			}
			computeThumbPosition();
		});
	}

	layout(active);
	sync(disabled);
	syncToolbar(disabled, focusableWhenDisabled);
	queueThumb();
</script>
