import { render } from 'svelte/server';
import type { Component } from 'svelte';
import { describe, expect, it } from 'vitest';
import OtpFieldFixture from '../../routes/fixtures/otp-field/OTPFieldFixture.svelte';
import RadioGroupFixture from '../../routes/fixtures/radio-group/RadioGroupFixture.svelte';
import ToggleGroupFixture from '../../routes/fixtures/toggle-group/ToggleGroupFixture.svelte';
import ToolbarFixture from '../../routes/fixtures/toolbar/ToolbarFixture.svelte';
import { RenderOrder } from './roving-slot.js';

function html<Scenario extends string>(
	component: Component<{ scenario: Scenario }>,
	scenario: Scenario
) {
	return render(component, { props: { scenario } }).body;
}

describe('composite SSR render order', () => {
	it('resets the render-order counter when the registered list shrinks', () => {
		const order = new RenderOrder();
		expect(order.claim()).toBe(0);
		expect(order.claim()).toBe(1);
		order.reset(0);
		expect(order.claim()).toBe(0);
	});

	it('renders a toggle-group tab stop before registration', () => {
		const body = html(ToggleGroupFixture, 'exclusive');
		expect(body).toContain('tabindex="0"');
		expect(body).toContain('tabindex="-1"');
	});

	it('renders a toolbar tab stop before registration', () => {
		const body = html(ToolbarFixture, 'keyboard');
		expect(body).toContain('role="toolbar"');
		expect(body).toContain('tabindex="0"');
		expect(body).toContain('tabindex="-1"');
	});

	it('renders a radio tab stop when nothing is selected', () => {
		const body = html(RadioGroupFixture, 'select');
		expect(body).toContain('role="radiogroup"');
		expect(body).toContain('tabindex="0"');
		expect(body).toContain('tabindex="-1"');
	});

	it('gives each OTP input its own render-order index', () => {
		const body = html(OtpFieldFixture, 'grouped');
		for (const digit of ['1', '2', '3', '4', '5', '6']) {
			expect(body).toContain(`value="${digit}"`);
		}
		const ids = [...body.matchAll(/<input\b[^>]*\svalue="[1-6]"[^>]*>/g)]
			.map((match) => match[0].match(/\sid="([^"]+)"/)?.[1])
			.filter((id): id is string => id != null);
		expect(new Set(ids).size).toBe(ids.length);
		expect(ids.length).toBe(6);
	});
});
