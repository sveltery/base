import type { Component, ComponentProps } from 'svelte';
import { render } from 'vitest-browser-svelte';

/**
 * Renders with every prop bound to a `$state` object, the way a parent using `bind:` would. The
 * test changes a prop by writing to the returned object and reads back what the component
 * wrote. `rerender` cannot do this: it passes a new props object, which drops every value the
 * component wrote to its own bindable props.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderBound<C extends Component<any>>(
	component: C,
	initial: ComponentProps<C>,
	defaults: Partial<ComponentProps<C>> = {}
) {
	const backing: Record<string, unknown> = $state({ ...defaults, ...initial });
	const props = {};
	for (const key of Object.keys(backing)) {
		Object.defineProperty(props, key, {
			enumerable: true,
			configurable: true,
			get: () => backing[key],
			set: (next) => (backing[key] = next)
		});
	}
	// The testing library's own `Component` type does not accept a generic Svelte component.
	render(component as never, props as never);
	return backing as ComponentProps<C>;
}
