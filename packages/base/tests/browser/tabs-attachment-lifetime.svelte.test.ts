// Native Svelte host overlap/default outro lifetime; supplemental, zero ordinary credit.
import { expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Fixture from './TabsAttachmentLifetimeFixture.svelte';

async function replaceHostThroughNativeOutro() {
  render(Fixture);
  await page.getByRole('button', { name: 'Replace host' }).click();
  await expect.element(page.getByLabelText('Bound host')).toHaveTextContent('new');
  await expect.element(page.getByLabelText('Outro ended')).toHaveTextContent('false');
  expect(document.querySelectorAll('[data-host]')).toHaveLength(2);
  await expect.element(page.getByLabelText('Outro ended')).toHaveTextContent('true');
  expect(document.querySelectorAll('[data-host]')).toHaveLength(1);
}

function recordCurrentHost(caseName: string) {
  const current = document.querySelector<HTMLButtonElement>('[data-host="new"]')!;
  const ancestors: Array<{
    tag: string;
    disabled: boolean;
    ariaDisabled: string | null;
    inert: boolean;
  }> = [];
  for (let parent = current.parentElement; parent; parent = parent.parentElement) {
    ancestors.push({
      tag: parent.tagName,
      disabled: parent.hasAttribute('disabled'),
      ariaDisabled: parent.getAttribute('aria-disabled'),
      inert: parent.inert,
    });
  }
  const snapshot = {
    caseName,
    tag: current.tagName,
    role: current.getAttribute('role'),
    disabled: current.disabled,
    disabledAttribute: current.getAttribute('disabled'),
    ariaDisabled: current.getAttribute('aria-disabled'),
    disabledFieldset: current.closest('fieldset[disabled]') !== null,
    ancestors,
  };
  console.info('TABS_BUTTON_OWNER_SNAPSHOT', JSON.stringify(snapshot));
  expect(snapshot.disabledFieldset).toBe(false);
  expect(
    ancestors.every(
      (parent) => !parent.disabled && !parent.inert && parent.ariaDisabled !== 'true',
    ),
  ).toBe(true);
  return snapshot;
}

it('retained old native outro cleanup leaves the current Tabs button disabled synchronization owned', async () => {
  await replaceHostThroughNativeOutro();
  await page.getByRole('button', { name: 'Disable current host' }).click();
  const currentTab = page.getByRole('tab', { name: 'Current tab' });
  await expect.element(currentTab).toHaveAttribute('aria-disabled', 'true');
  recordCurrentHost('disabled synchronization');
  // Vitest's browser disabled matcher includes aria-disabled; the Source
  // focusable disabled Tab keeps ARIA true and clears only the physical property.
  await expect
    .poll(() => document.querySelector<HTMLButtonElement>('[data-host="new"]')?.disabled)
    .toBe(false);
  await expect.element(currentTab).not.toHaveAttribute('disabled');
  await expect.element(page.getByLabelText('Bound host')).toHaveTextContent('new');
});

it('retained old native outro cleanup leaves the current Tabs button diagnostic owned', async () => {
  const messages: string[] = [];
  const spy = vi
    .spyOn(console, 'error')
    .mockImplementation((...args) => messages.push(args.join(' ')));
  try {
    await replaceHostThroughNativeOutro();
    await page.getByRole('button', { name: 'Change native expectation' }).click();
    recordCurrentHost('diagnostic');
    await expect
      .poll(() => messages.some((message) => message.includes('expected a non-<button>')))
      .toBe(true);
  } finally {
    spy.mockRestore();
  }
});
