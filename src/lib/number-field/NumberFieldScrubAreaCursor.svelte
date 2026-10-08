<!--
	A custom element to display instead of the native cursor while using the scrub area.
	Renders a `<span>` element, moved to `document.body` while scrubbing.
	Derived from Base UI v1.8.0 packages/react/src/number-field/scrub-area-cursor/NumberFieldScrubAreaCursor.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	The portal is an attachment, not a floating-ui overlay. It is omitted on WebKit.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { numberFieldStateAttributes } from './attributes.js';
	import { useNumberFieldContext, useScrubAreaContext } from './context.svelte.js';
	import { mergeCssStyle } from '../internal/css-style.js';
	import { ownerDocument } from '../internal/owner.js';
	import { platform } from '../internal/platform.js';
	import type {
		NumberFieldScrubAreaCursorProps,
		NumberFieldScrubAreaCursorState
	} from './types.js';

	const CURSOR_STYLE = 'position: fixed; top: 0; left: 0; pointer-events: none';
	const portalKey = createAttachmentKey();

	let { render, children, style, ...elementProps }: NumberFieldScrubAreaCursorProps = $props();

	const model = useNumberFieldContext();
	const scrub = useScrubAreaContext();
	const shouldRender = $derived(
		scrub.scrubbing && !platform.engine.webkit && !scrub.touchInput && !scrub.pointerLockDenied
	);
	const state: NumberFieldScrubAreaCursorState = $derived(model.state);

	function portal(node: HTMLElement) {
		scrub.cursor = node;
		const body = ownerDocument(node).body;
		if (node.parentElement !== body) body.appendChild(node);
		return () => {
			if (scrub.cursor === node) scrub.cursor = null;
			node.remove();
		};
	}

	const hostProps: HTMLAttributes<HTMLElement> = $derived({
		role: 'presentation',
		style: mergeCssStyle(CURSOR_STYLE, style),
		...elementProps,
		...getStateAttributesProps(state, numberFieldStateAttributes),
		[portalKey]: portal
	});
</script>

{#if shouldRender}
	{#if render}
		{@render render(hostProps, state, children)}
	{:else}
		<span {...hostProps}>{@render children?.()}</span>
	{/if}
{/if}
