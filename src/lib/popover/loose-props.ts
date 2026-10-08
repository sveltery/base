// mergeProps takes plain dictionaries. Component prop types have no index signature.
import type { HTMLAttributes } from 'svelte/elements';

export type LooseProps = Record<PropertyKey, unknown>;

export function loose(bag: object | null | undefined): LooseProps {
	return (bag ?? {}) as LooseProps;
}

export function asHost<Element extends EventTarget>(props: LooseProps): HTMLAttributes<Element> {
	return props as HTMLAttributes<Element>;
}
