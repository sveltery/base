// Class names and chained pointer handlers for scroll area parts.
// Style strings use `toCssStyle` and `mergeCssStyle` from `src/lib/internal/css-style.ts`.

export function mergeClass(
	componentClass: string | undefined,
	consumerClass: unknown
): string | undefined {
	const consumer = typeof consumerClass === 'string' && consumerClass ? consumerClass : undefined;
	if (componentClass && consumer) return `${componentClass} ${consumer}`;
	return componentClass || consumer;
}

type Handler<E extends Event> = (event: E) => void;

/** Consumer handler runs first. `preventDefault()` skips the part handler. */
export function chain<E extends Event>(
	component: Handler<E>,
	consumer: Handler<E> | null | undefined
): Handler<E> {
	if (!consumer) return component;
	return (event) => {
		consumer(event);
		if (event.defaultPrevented) return;
		component(event);
	};
}
