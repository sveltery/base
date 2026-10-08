import { describe, expect, it } from 'vitest';
import {
	componentPropTypeNames,
	unexportedComponentProps
} from '../../../scripts/check-exported-props.mjs';

describe('exported component props', () => {
	it('rejects an internal props type and an anonymous props type', () => {
		const source = [
			'Portal: import("svelte").Component<import("../internal/portal-props.js").PortalProps, {}, "">;',
			'Popup: import("svelte").Component<import("./types.js").DialogPopupProps, {}, "">;',
			'declare const Loose: import("svelte").Component<{ class?: string }, {}, "">;'
		].join('\n');

		expect(componentPropTypeNames(source)).toEqual([
			'PortalProps',
			'DialogPopupProps',
			'(anonymous)'
		]);
		expect(
			unexportedComponentProps(source, new Set(['DialogPortalProps', 'DialogPopupProps']))
		).toEqual(['PortalProps', '(anonymous)']);
	});

	it('accepts a props type the package exports', () => {
		const source =
			'Portal: import("svelte").Component<import("./types.js").DialogPortalProps, {}, "">;';
		expect(unexportedComponentProps(source, new Set(['DialogPortalProps']))).toEqual([]);
	});
});
