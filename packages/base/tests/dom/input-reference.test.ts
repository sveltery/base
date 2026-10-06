// Actual pinned React characterization. Supplemental evidence, no ordinary leaf credit.
import { afterEach, expect, it } from 'vitest';
import { mountInputReference } from '../../../../apps/fixtures/src/lib/input-reference.js';
const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
  document.body.replaceChildren();
});
async function setup(scenario: string) {
  const node = document.createElement('section');
  document.body.append(node);
  cleanups.push(mountInputReference(node, scenario));
  await new Promise((resolve) => setTimeout(resolve, 25));
  return { input: node.querySelector('input')!, form: node.querySelector('form')!, node };
}
for (const scenario of ['controlled-reject', 'controlled-default'])
  it(`React controlled reset derives defaultValue from value (${scenario})`, async () => {
    const { input, form } = await setup(scenario);
    expect(input.value).toBe('owner');
    expect(input.defaultValue).toBe('owner');
    input.value = 'edit';
    form.reset();
    expect(input.value).toBe('owner');
    expect(input.defaultValue).toBe('owner');
  });
it('React uncontrolled canceled reset keeps edit and supplied default', async () => {
  const { input, form } = await setup('reset-cancel');
  expect(input.value).toBe('seed');
  input.value = 'edit';
  form.reset();
  expect(input.value).toBe('edit');
  expect(input.defaultValue).toBe('seed');
});
for (const [scenario, expected, count] of [
  ['controlled-accept', 'edit', 1],
  ['controlled-reject', 'owner', 1],
  ['controlled-rewrite', 'EDIT', 1],
  ['controlled-cancel', 'owner', 1],
  ['controlled-prevent-base', 'owner', 0],
] as const)
  it(`React native input and controlled restoration (${scenario})`, async () => {
    const { input, node } = await setup(scenario);
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'edit');
    input.dispatchEvent(
      new InputEvent('input', { bubbles: true, cancelable: true, isComposing: true }),
    );
    expect(input.value).toBe(expected);
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(input.value).toBe(expected);
    const calls = JSON.parse(node.querySelector('[data-testid=calls]')!.textContent!);
    expect(calls).toHaveLength(count);
    if (count) expect(calls[0].type).toBe('input');
  });
