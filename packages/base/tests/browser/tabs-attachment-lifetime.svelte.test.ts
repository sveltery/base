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

it('retained old native outro cleanup leaves the current Tabs button disabled synchronization owned', async () => {
  await replaceHostThroughNativeOutro();
  await page.getByRole('button', { name: 'Disable current host' }).click();
  const currentTab = page.getByRole('tab', { name: 'Current tab' });
  await expect.element(currentTab).toHaveAttribute('aria-disabled', 'true');
  await expect.element(currentTab).not.toBeDisabled();
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
    await expect
      .poll(() => messages.some((message) => message.includes('expected a non-<button>')))
      .toBe(true);
  } finally {
    spy.mockRestore();
  }
});
