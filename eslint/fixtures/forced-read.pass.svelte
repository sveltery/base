<script lang="ts">
	let height: number | undefined = 1;
	let width: number | undefined = 1;
	let needsLayoutReset = false;
	let disabled = false;
	let active: HTMLElement | null = null;
	let direction = 'ltr';

	function resetLayoutStyles(panel: HTMLElement) {
		return panel;
	}
	function ensureActive() {
		return active;
	}
	function keepEnabled(item: HTMLElement) {
		return item === active;
	}
	function computeThumbPosition() {
		return direction;
	}

	function layout(panel: HTMLElement | null) {
		if (!panel || !needsLayoutReset) return;
		if (height === undefined && width === undefined) return;
		return resetLayoutStyles(panel);
	}

	$effect(() => {
		if (height === undefined && width === undefined) return;
		if (active) resetLayoutStyles(active);
	});

	function sync(item: HTMLElement | null, itemDisabled: boolean) {
		if (!item) return;
		if (itemDisabled) {
			if (item === active) ensureActive();
			return;
		}
		return keepEnabled(item);
	}

	function queueThumb() {
		const seen = direction;
		queueMicrotask(() => {
			if (direction !== seen) return;
			computeThumbPosition();
		});
	}

	layout(active);
	sync(active, disabled);
	queueThumb();
</script>
