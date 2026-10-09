// Third argument of a part `render` snippet.
// Upstream `useRenderElement` passes the same value as `props.children` and leaves it
// undefined when the consumer passed no children and the part adds none of its own
// (packages/react/src/internals/useRenderElement.tsx, commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c).
// MIT, see THIRD_PARTY_NOTICES.md.
// Svelte children are a snippet, not an element prop, so they are not on `props`.
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

/** Undefined when a render function should be free to show its own fallback. */
export type RenderChildren = Snippet | undefined;

/** Props, state, and children for a part `render` snippet. */
export type PartRender<Element extends EventTarget, State> = Snippet<
	[props: HTMLAttributes<Element>, state: State, children: RenderChildren]
>;
