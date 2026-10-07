<script lang="ts">
	import { on } from 'svelte/events';

	const labelable = {
		registerControlId(_source: symbol, _id: string | undefined) {}
	};
	const controlSource = Symbol();

	function watchWheel(element: HTMLElement) {
		return on(element, 'wheel', (event) => event.preventDefault(), { passive: false });
	}

	function remember(element: HTMLElement) {
		const stopWheel = watchWheel(element);
		labelable.registerControlId(controlSource, element.id);
		return () => {
			stopWheel();
			labelable.registerControlId(controlSource, undefined);
		};
	}

	$effect(() => {
		const id = 'control';
		labelable.registerControlId(controlSource, id);
		return () => labelable.registerControlId(controlSource, undefined);
	});

	const css = {
		registerOverflowProperties() {}
	};
	const motion = {
		observeViewportSize() {
			return () => {};
		}
	};

	$effect(() => {
		css.registerOverflowProperties();
	});

	$effect(() => {
		return motion.observeViewportSize();
	});

	void remember;
</script>
