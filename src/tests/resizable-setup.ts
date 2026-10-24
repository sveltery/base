import { afterAll, afterEach, beforeAll, beforeEach, expect, vi } from 'vitest';
import { resetMockGroupIdCounter } from '../lib/resizable/engine/global/test/mockGroup.js';
import { mockBoundingClientRect } from '../lib/resizable/engine/utils/test/mockBoundingClientRect.js';
import { mockResizeObserver } from '../lib/resizable/engine/utils/test/mockResizeObserver.js';

let unmockBoundingClientRect: (() => void) | null = null;
let unmockResizeObserver: (() => void) | null = null;

const PROTOTYPE_PROPS = ['clientHeight', 'clientWidth', 'offsetHeight', 'offsetWidth'];

expect.addSnapshotSerializer({
	serialize(value) {
		const rect = value as DOMRect;
		return `${rect.x}, ${rect.y} (${rect.width} x ${rect.height})`;
	},
	test(value) {
		return (
			value !== null &&
			typeof value === 'object' &&
			'x' in value &&
			'y' in value &&
			'width' in value &&
			'height' in value
		);
	}
});

beforeAll(() => {
	PROTOTYPE_PROPS.forEach((propertyKey) => {
		Object.defineProperty(HTMLElement.prototype, propertyKey, {
			configurable: true,
			value: 0
		});
	});

	vi.spyOn(console, 'warn').mockImplementation(() => {
		throw Error('Unexpected console warning');
	});

	vi.spyOn(console, 'error').mockImplementation(() => {
		throw Error('Unexpected console error');
	});

	Object.defineProperty(Document.prototype, 'adoptedStyleSheets', {
		value: []
	});
	Object.defineProperty(ShadowRoot.prototype, 'adoptedStyleSheets', {
		value: []
	});
});

afterAll(() => {
	PROTOTYPE_PROPS.forEach((propertyKey) => {
		delete HTMLElement.prototype[propertyKey as keyof typeof HTMLElement.prototype];
	});
});

beforeEach(() => {
	unmockBoundingClientRect = mockBoundingClientRect();
	unmockResizeObserver = mockResizeObserver();
});

afterEach(() => {
	resetMockGroupIdCounter();

	if (unmockBoundingClientRect) {
		unmockBoundingClientRect();
	}

	if (unmockResizeObserver) {
		unmockResizeObserver();
	}
});
