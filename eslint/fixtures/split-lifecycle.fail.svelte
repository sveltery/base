<script lang="ts">
	// Copied from FieldControl and NumberFieldRoot: register in one effect,
	// cleanup in another. Copied from NumberFieldModel and press-and-hold:
	// addEventListener inside an effect, or removed from a later empty effect.
	const labelable = {
		registerControlId(_source: symbol, _id: string | undefined) {}
	};
	const controlSource = Symbol();
	const idProp: string | undefined = undefined;

	$effect(() => {
		labelable.registerControlId(controlSource, idProp);
	});

	$effect(() => {
		return () => {
			labelable.registerControlId(controlSource, undefined);
		};
	});

	let element: HTMLElement | null = null;
	$effect(() => {
		if (!element) return;
		element.addEventListener('wheel', () => {}, { passive: false });
		return () => element?.removeEventListener('wheel', () => {});
	});

	let removePointerUp: (() => void) | undefined;
	function addEventListener(target: EventTarget, type: string, listener: EventListener) {
		target.addEventListener(type, listener);
		return () => target.removeEventListener(type, listener);
	}
	function start() {
		removePointerUp = addEventListener(window, 'pointerup', () => {});
	}
	$effect(() => {
		return () => {
			removePointerUp?.();
			removePointerUp = undefined;
		};
	});
</script>

<button type="button" onclick={start}>Start</button>
