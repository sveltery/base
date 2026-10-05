import { expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import PublicButton from './PublicButton.svelte';

it('activates the public native Button through pointer and keyboard input', async () => {
  render(PublicButton);
  const action = page.getByRole('button', { name: 'Public action' });

  await expect.element(page.getByLabelText('Bound host')).toHaveTextContent('BUTTON');
  await action.click();
  await expect.element(page.getByLabelText('Activations')).toHaveTextContent('1');
  await userEvent.keyboard('{Enter}');
  await expect.element(page.getByLabelText('Activations')).toHaveTextContent('2');
});

it('updates native disabled state and clears the bound host on removal', async () => {
  render(PublicButton);
  const action = page.getByRole('button', { name: 'Public action' });

  await page.getByRole('button', { name: 'Disable action' }).click();
  await expect.element(action).toBeDisabled();
  await expect.element(page.getByLabelText('Activations')).toHaveTextContent('0');
  await page.getByRole('button', { name: 'Remove action' }).click();
  await expect.element(action).not.toBeInTheDocument();
  await expect.element(page.getByLabelText('Bound host')).toHaveTextContent('none');
});
