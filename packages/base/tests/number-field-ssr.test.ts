import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import Fixture from './dom/NumberFieldFixture.svelte';
import { NumberField } from '../src/lib/number-field/index.js';
for (const props of [{}, { options: { disabled: true } }, { initial: 1234.5, options: { locale: 'de-DE' } }, { controlled: true, initial: 3 }, { withScrub: true }]) {
  it(`supplement NumberField SSR has actual numeric/text controls and no cursor DOM (${JSON.stringify(props)})`, () => {
    const { body } = render(Fixture, { props });
    expect(body).toContain('type="text"'); expect(body).toContain('type="number"');
    expect(body).toContain('name="amount"'); expect(body).toContain('role="group"');
    expect(body).not.toContain('data-testid="cursor"');
    if (props.options?.disabled) expect(body).toContain('data-disabled');
    if (props.initial === 1234.5) expect(body).toContain('1.234,5');
  });
}
for (const part of ['Input', 'Group', 'Increment', 'Decrement', 'ScrubArea', 'ScrubAreaCursor'] as const) it(`supplement ${part} retains its missing NumberField provider guard`, () => {
  expect(() => render(NumberField[part]).body).toThrow(/NumberFieldRootContext is missing/);
});
