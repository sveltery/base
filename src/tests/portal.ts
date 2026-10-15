import type { Attachment } from 'svelte/attachments';

/**
 * Moves the node into a new `<div>` or `<form>` appended to `<body>`, outside any `<form>` the
 * component tree renders. Svelte context still flows to the moved node, as through `createPortal`.
 */
export function portalTo(tag: 'div' | 'form'): Attachment<HTMLElement> {
	return (node) => {
		const container = document.createElement(tag);
		document.body.append(container);
		container.append(node);
		return () => container.remove();
	};
}
