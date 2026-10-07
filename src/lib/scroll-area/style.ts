// Turns component style maps into a native `style` attribute string.
// Custom properties stay as written. Empty values are omitted so an overscroll
// override can be removed and the resting variable applies again.

export function cssText(declarations: Record<string, string | number | undefined>): string {
	const parts: string[] = [];
	for (const [key, value] of Object.entries(declarations)) {
		if (value === undefined || value === '') continue;
		const property = key.startsWith('--')
			? key
			: key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
		parts.push(`${property}: ${value}`);
	}
	return parts.join('; ');
}

export function joinStyles(...parts: Array<string | undefined | null>): string | undefined {
	const text = parts
		.map((part) => part?.trim().replace(/;$/, ''))
		.filter((part): part is string => Boolean(part))
		.join('; ');
	return text || undefined;
}

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
