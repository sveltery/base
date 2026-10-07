// Derived from Base UI v1.8.0 packages/utils/src/shadowDom.ts,
// packages/utils/src/addEventListener.ts, and packages/react/src/scroll-area/utils/getOffset.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// `contains` and `getTarget` are the shadow-dom helpers ScrollArea calls. The floating-ui
// re-export module is not part of this component.

export function contains(parent?: Element | null, child?: Element | null) {
	if (!parent || !child) {
		return false;
	}

	const rootNode = child.getRootNode?.();

	if (parent.contains(child)) {
		return true;
	}

	if (rootNode && isShadowRoot(rootNode)) {
		let next: Node | null = child;
		while (next) {
			if (parent === next) {
				return true;
			}
			next = next.parentNode || (next as ShadowRoot).host;
		}
	}

	return false;
}

export function getTarget(event: Event) {
	if ('composedPath' in event) {
		return event.composedPath()[0] ?? event.target;
	}

	return (event as Event).target;
}

export function addEventListener(
	target: EventTarget,
	type: string,
	listener: EventListener,
	options?: boolean | AddEventListenerOptions
) {
	target.addEventListener(type, listener, options);
	return () => {
		target.removeEventListener(type, listener, options);
	};
}

export function getOffset(
	element: Element | null,
	prop: 'margin' | 'padding',
	axis: 'x' | 'y'
): number {
	if (!element) {
		return 0;
	}

	const styles = getComputedStyle(element);
	const key = `${prop}${axis === 'x' ? 'Inline' : 'Block'}` as const;
	const start = parseFloat(styles[`${key}Start`]);

	// Safari misreports `marginInlineEnd` in RTL.
	// We have to assume the start/end values are symmetrical, which is likely.
	if (axis === 'x' && prop === 'margin') {
		return start * 2;
	}

	return start + parseFloat(styles[`${key}End`]);
}

function isShadowRoot(node: Node): node is ShadowRoot {
	return typeof ShadowRoot !== 'undefined' && node instanceof ShadowRoot;
}
