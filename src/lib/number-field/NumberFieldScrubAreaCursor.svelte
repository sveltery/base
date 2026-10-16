<!--
	A custom element to display instead of the native cursor while using the scrub area.
	Renders a `<span>` element.

	This component uses the [Pointer Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API), which may prompt the browser to display a related notification. It is disabled
	in Safari to avoid a layout shift that this notification causes there.
	Derived from Base UI v1.9.0 packages/react/src/number-field/scrub-area-cursor/NumberFieldScrubAreaCursor.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The portal is an attachment, not a floating-ui overlay. It is omitted on WebKit.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { numberFieldStateAttributes } from './attributes.js';
	import { useNumberFieldContext, useScrubAreaContext } from './context.svelte.js';
	import { mergeCssStyle } from '../internal/css-style.js';
	import { ownerDocument, platform } from '@sveltery/utils';
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
