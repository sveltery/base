import { expect, test, type Page } from '@playwright/test';

async function counter(page: Page) {
  const reads = Number(await page.locator('#counter-reads').textContent());
  await page.getByRole('button', { name: 'Read server counter', exact: true }).click();
  await expect(page.locator('#counter-reads')).toHaveText(String(reads + 1));
  return Number(await page.locator('#server-counter').textContent());
}
async function setup(page: Page) {
  await page.goto('/remote-native-propagation');
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  await page.locator('#remote-form').evaluate((form: HTMLFormElement) => {
    form.dataset.later = '0';
    form.dataset.ancestor = '0';
    form.addEventListener('submit', () => {
      form.dataset.later = String(Number(form.dataset.later) + 1);
    });
    form.parentElement!.addEventListener('submit', () => {
      form.dataset.ancestor = String(Number(form.dataset.ancestor) + 1);
    });
  });
  const before = await counter(page),
    requests: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('remote'))
      requests.push(request.url());
  });
  await page.locator('#remote-email').fill('blocked@example.com');
  return { before, requests };
}
async function assertCanceled(page: Page, before: number, requests: string[], listeners: number) {
  await expect(page.locator('#remote-form')).toHaveAttribute('data-later', String(listeners));
  await expect(page.locator('#remote-form')).toHaveAttribute('data-ancestor', String(listeners));
  await page.waitForTimeout(250);
  expect(requests).toHaveLength(0);
  expect((await counter(page)) - before).toBe(0);
  await expect(page.locator('#remote-email')).toHaveValue('blocked@example.com');
  await expect(page.locator('#remote-result')).toHaveText('null');
  await expect(page.locator('#remote-resets')).toHaveText('0');
  await expect(page.locator('#remote-native-submit')).toHaveText('0');
}
async function nextValid(
  page: Page,
  before: number,
  requests: string[],
  previousListeners: number,
) {
  await page.getByRole('button', { name: 'Toggle cancellation', exact: true }).click();
  await page.locator('#remote-email').fill('valid@example.com');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.locator('#remote-result')).toContainText('valid@example.com');
  expect(requests).toHaveLength(1);
  expect((await counter(page)) - before).toBe(1);
  await expect(page.locator('#remote-email')).toHaveValue('seed@example.com');
  await expect(page.locator('#remote-resets')).toHaveText('1');
  await expect(page.locator('#remote-native-submit')).toHaveText('1');
  await expect(page.locator('#remote-form')).toHaveAttribute(
    'data-later',
    String(previousListeners + 1),
  );
  await expect(page.locator('#remote-form')).toHaveAttribute(
    'data-ancestor',
    String(previousListeners + 1),
  );
}

for (const sourceHost of ['default', 'formReplacement'])
  test(`literal Kit cancellation oracle for ${sourceHost} empty formaction keeps later listeners`, async ({
    page,
  }) => {
    const { before, requests } = await setup(page);
    const observation = await page.locator('#remote-form').evaluate((form: HTMLFormElement) => {
      const action = new URL(form.action);
      history.replaceState(
        history.state,
        '',
        new URL(
          `?/remote=${encodeURIComponent(action.searchParams.get('/remote')!)}`,
          location.href,
        ),
      );
      const base = document.createElement('base');
      base.id = 'boundary-base';
      base.href = new URL('/ordinary-base', location.origin).href;
      document.head.prepend(base);
      const submitter = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
      submitter.setAttribute('formaction', '');
      return { action: submitter.formAction, documentURL: document.URL, baseURI: document.baseURI };
    });
    expect(observation.action).toBe(observation.documentURL);
    expect(observation.action).not.toBe(observation.baseURI);
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await assertCanceled(page, before, requests, 1);
    await test.info().attach('literal-empty-formaction.json', {
      body: JSON.stringify({
        sourceHost,
        ...observation,
        listeners: 1,
        POST: requests.length,
        counterDelta: (await counter(page)) - before,
        reset: 0,
        result: null,
      }),
      contentType: 'application/json',
    });
    await nextValid(page, before, requests, 1);
  });

for (const tag of ['button', 'input'])
  test(`literal Kit ${tag} submitter override oracle keeps every later listener`, async ({
    page,
  }) => {
    const { before, requests } = await setup(page);
    await page.locator('#remote-form').evaluate((form: HTMLFormElement, name) => {
      const submitter = document.createElement(name);
      submitter.id = 'boundary-submitter';
      submitter.type = 'submit';
      form.append(submitter);
    }, tag);
    const observations = [];
    let listeners = 0;
    for (const [attribute, value] of [
      ['formmethod', ''],
      ['formmethod', 'invalid'],
      ['formmethod', 'get'],
      ['formmethod', 'dialog'],
      ['formmethod', 'POST'],
      ['formaction', '/ordinary'],
      ['formtarget', '_blank'],
      ['formtarget', '_self'],
    ]) {
      const observation = await page.locator('#remote-form').evaluate(
        (form: HTMLFormElement, override) => {
          const submitter = form.querySelector<HTMLButtonElement | HTMLInputElement>(
            '#boundary-submitter',
          )!;
          for (const name of ['formmethod', 'formaction', 'formtarget'])
            submitter.removeAttribute(name);
          submitter.setAttribute(override[0], override[1]);
          const event = new SubmitEvent('submit', { submitter, cancelable: true, bubbles: true });
          form.dispatchEvent(event);
          return {
            attribute: override[0],
            value: override[1],
            defaultPrevented: event.defaultPrevented,
          };
        },
        [attribute, value],
      );
      expect(observation.defaultPrevented).toBe(true);
      observations.push(observation);
      listeners++;
      await expect(page.locator('#remote-form')).toHaveAttribute('data-later', String(listeners));
      await expect(page.locator('#remote-form')).toHaveAttribute(
        'data-ancestor',
        String(listeners),
      );
    }
    await assertCanceled(page, before, requests, 8);
    await test.info().attach('literal-submitter-overrides.json', {
      body: JSON.stringify({
        tag,
        observations,
        listeners,
        POST: requests.length,
        counterDelta: (await counter(page)) - before,
        reset: 0,
        result: null,
      }),
      contentType: 'application/json',
    });
    await page.locator('#boundary-submitter').evaluate((node) => node.remove());
    await nextValid(page, before, requests, 8);
  });
