// Assertions follow Base UI v1.9.0 packages/react/src/internals/labelable-provider/useLabel.test.tsx
// and slider/label/SliderLabel.test.tsx cases from 4ba59eeb7 and ec6bf32d3
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { flushSync, mount, unmount } from 'svelte';
import { describe, expect, it, onTestFinished } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LabelShadowHarness from '../../tests/LabelShadowHarness.svelte';

function shadowContainer(parent: Element | ShadowRoot = document.body) {
	const host = document.createElement('div');
	const shadowRoot = host.attachShadow({ mode: 'open' });
	const container = document.createElement('div');
	shadowRoot.appendChild(container);
	parent.appendChild(host);
	onTestFinished(() => host.remove());
	return { host, shadowRoot, container };
}

function labelIn(root: ParentNode, control: 'field' | 'slider') {
	const text = control === 'field' ? 'Name' : 'Volume';
	const label = [...root.querySelectorAll('div,label')].find(
		(node) => node.childElementCount === 0 && node.textContent === text
	);
	if (!(label instanceof HTMLElement)) throw new Error(`no ${text} label`);
	return label;
}

function controlIn(root: ParentNode, control: 'field' | 'slider') {
	const element = root.querySelector(control === 'field' ? 'input' : 'input[type="range"]');
	if (!(element instanceof HTMLInputElement)) throw new Error('no control');
	return element;
}

describe.each(['field', 'slider'] as const)('%s label in a shadow root', (control) => {
	it('focuses the control in its own shadow root when the document has a matching id', async () => {
		const { shadowRoot, container } = shadowContainer();
		const unrelated = document.body.appendChild(document.createElement('input'));
		onTestFinished(() => unrelated.remove());
		render(LabelShadowHarness, { control, labelContainer: container, controlContainer: container });
		const target = controlIn(shadowRoot, control);
		expect(target.id).not.toBe('');
		unrelated.id = target.id;

		labelIn(shadowRoot, control).click();

		expect(shadowRoot.activeElement).toBe(target);
		expect(document.activeElement).not.toBe(unrelated);
	});

	it('focuses a control in the light DOM', async () => {
		const { shadowRoot, container } = shadowContainer();
		const view = render(LabelShadowHarness, { control, labelContainer: container });

		labelIn(shadowRoot, control).click();

		expect(document.activeElement).toBe(controlIn(view.container, control));
	});

	it('focuses a control in an ancestor shadow root from a nested shadow root', async () => {
		const outer = shadowContainer();
		const inner = shadowContainer(outer.shadowRoot);
		render(LabelShadowHarness, {
			control,
			labelContainer: inner.container,
			controlContainer: outer.container
		});

		labelIn(inner.shadowRoot, control).click();

		expect(outer.shadowRoot.activeElement).toBe(controlIn(outer.shadowRoot, control));
	});

	it('does not throw when the label is clicked in a detached tree', async () => {
		const target = document.createElement('div');
		const component = mount(LabelShadowHarness, { target, props: { control } });
		onTestFinished(() => unmount(component));
		flushSync();
		const errors: ErrorEvent[] = [];
		const onError = (event: ErrorEvent) => {
			event.preventDefault();
			errors.push(event);
		};
		window.addEventListener('error', onError);
		onTestFinished(() => window.removeEventListener('error', onError));

		expect(() => labelIn(target, control).click()).not.toThrow();
		expect(errors).toEqual([]);
	});
});
