// Actual Kit direct-spread acceptance and unresolved submit characterization; all are supplements.
import { expect, test, type Page } from '@playwright/test';
async function setup(page: Page, query = '') {
  await page.goto(`/field-form-remote${query ? `?${query}` : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  return page.locator('#remote-email');
}
async function readCounter(page: Page) {
  const reads = Number(await page.locator('#counter-reads').textContent());
  await page
    .locator('main > button')
    .filter({ hasText: /^Read server counter$/ })
    .click();
  await expect(page.locator('#counter-reads')).toHaveText(String(reads + 1));
  return Number(await page.locator('#server-counter').textContent());
}
async function observeLaterListeners(page: Page) {
  await page.locator('#remote-form').evaluate((form: HTMLFormElement) => {
    form.dataset.boundaryLater = '0';
    form.dataset.boundaryBubbling = '0';
    form.addEventListener('submit', () => {
      form.dataset.boundaryLater = String(Number(form.dataset.boundaryLater) + 1);
    });
    form.parentElement!.addEventListener('submit', () => {
      form.dataset.boundaryBubbling = String(Number(form.dataset.boundaryBubbling) + 1);
    });
  });
}
async function expectLaterListeners(page: Page, count: number) {
  await expect(page.locator('#remote-form')).toHaveAttribute('data-boundary-later', String(count));
  await expect(page.locator('#remote-form')).toHaveAttribute(
    'data-boundary-bubbling',
    String(count),
  );
}
async function expectNextValidSubmit(
  page: Page,
  input: ReturnType<Page['locator']>,
  before: number,
  requests: string[],
  previousListeners = 0,
) {
  await input.fill('valid@example.com');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.locator('#remote-result')).toContainText('valid@example.com');
  expect(requests).toHaveLength(1);
  expect((await readCounter(page)) - before).toBe(1);
  await expect(input).toHaveValue('seed@example.com');
  await expect(page.locator('#remote-resets')).toHaveText('1');
  await expect(page.locator('#remote-native-submit')).toHaveText('1');
  await expectLaterListeners(page, previousListeners + 1);
}
for (const mode of ['', 'replacement', 'formReplacement', 'native']) {
  test(`Kit ${mode || 'default'} direct descriptors serialize each trusted edit and programmatic updates`, async ({
    page,
  }) => {
    const input = await setup(page, mode);
    await input.fill('sent@example.com');
    await expect(page.locator('#remote-value')).toHaveText('sent@example.com');
    expect(
      await input.evaluate((node: HTMLInputElement) => new FormData(node.form!).get('email')),
    ).toBe('sent@example.com');
    await page.getByRole('button', { name: 'Programmatic', exact: true }).click();
    await expect(input).toHaveValue('programmatic@example.com');
    await expect(page.locator('#remote-value')).toHaveText('programmatic@example.com');
    if (mode !== 'native')
      await expect(input).toHaveAttribute('aria-describedby', 'remote-description');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.locator('#remote-result')).toContainText('programmatic@example.com');
    await expect(input).toHaveValue('seed@example.com');
    await expect(page.locator('#remote-value')).toHaveText('seed@example.com');
  });
  test(`Kit ${mode || 'default'} server failure leaves input/result/reset state intact and surfaces issues`, async ({
    page,
  }) => {
    const input = await setup(page, mode);
    const before = await readCounter(page);
    await input.fill('reject@example.com');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.locator('#remote-issues')).toContainText('Server rejected email');
    await expect(page.locator('#remote-result')).toHaveText('null');
    await expect(page.locator('#remote-resets')).toHaveText('0');
    await expect(input).toHaveValue('reject@example.com');
    if (mode !== 'native') {
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('#remote-error')).toContainText('Server rejected email');
    }
    expect((await readCounter(page)) - before).toBe(0);
  });
  test(`Kit ${mode || 'default'} native and canceled reset retain their actual framework semantics`, async ({
    page,
  }) => {
    const input = await setup(page, `${mode ? `${mode}&` : ''}canceledReset`);
    await input.fill('edit@example.com');
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(input).toHaveValue('edit@example.com');
    await expect(page.locator('#remote-value')).toHaveText('edit@example.com');
    await expect(page.locator('#remote-resets')).toHaveText('1');
  });
  test(`Kit ${mode || 'default'} direct validate publishes server issues without a server operation or reset`, async ({
    page,
  }) => {
    const input = await setup(page, mode);
    const before = await readCounter(page);
    await input.fill('bad');
    await page.getByRole('button', { name: 'Validate', exact: true }).click();
    await expect(page.locator('#remote-issues')).toContainText('Email required');
    expect((await readCounter(page)) - before).toBe(0);
    await expect(page.locator('#remote-result')).toHaveText('null');
    await expect(page.locator('#remote-resets')).toHaveText('0');
    await expect(input).toHaveValue('bad');
    await expect(page.locator('#remote-value')).toHaveText('bad');
    if (mode !== 'native') {
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('#remote-error')).toContainText('Email required');
    }
  });
}
test('diagnostic Kit Form invalid submit preserves raw request, listener and server-effect observations', async ({
  page,
}) => {
  const input = await setup(page);
  const before = await readCounter(page);
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('remote'))
      requests.push(request.url());
  });
  await input.fill('blocked@example.com');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  // The server schema accepts this value; only Field rejects it. Record whether Kit still performs
  // the server operation. This characterization is not an acceptance assertion or parity credit.
  await expect(page.locator('#remote-events')).toContainText('capture');
  await page.waitForTimeout(250);
  const observation = {
    counterBefore: before,
    counterAfter: await readCounter(page),
    nativeAction: await page
      .locator('#remote-form')
      .evaluate((form: HTMLFormElement) => ({
        method: form.method,
        action: form.action,
        target: form.target,
      })),
    requests: requests.length,
    result: JSON.parse((await page.locator('#remote-result').textContent()) ?? 'null'),
    fieldValidity: JSON.parse((await page.locator('#field-validity').textContent()) ?? 'null'),
    events: JSON.parse((await page.locator('#remote-events').textContent()) ?? '[]'),
    nativeSubmit: await page.locator('#remote-native-submit').textContent(),
    resets: await page.locator('#remote-resets').textContent(),
  };
  await test
    .info()
    .attach('kit-invalid-form-submit-observation.json', {
      body: JSON.stringify(observation, null, 2),
      contentType: 'application/json',
    });
  expect(observation.events.some((event: { stage: string }) => event.stage === 'capture')).toBe(
    true,
  );
});
for (const mode of ['native', ''])
  test(`diagnostic Kit ${mode || 'Form'} ordinary preventDefault cancellation preserves enhancement outcome`, async ({
    page,
  }) => {
    const input = await setup(page, `${mode ? `${mode}&` : ''}canceledSubmit`);
    const before = await readCounter(page);
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('remote'))
        requests.push(request.url());
    });
    await input.fill('canceled@example.com');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.locator('#remote-events')).toContainText('after-attachments');
    await page.waitForTimeout(250);
    const observation = {
      mode: mode || 'Form',
      counterBefore: before,
      counterAfter: await readCounter(page),
      requests: requests.length,
      result: JSON.parse((await page.locator('#remote-result').textContent()) ?? 'null'),
      events: JSON.parse((await page.locator('#remote-events').textContent()) ?? '[]'),
      nativeSubmit: await page.locator('#remote-native-submit').textContent(),
      resets: await page.locator('#remote-resets').textContent(),
    };
    await test
      .info()
      .attach('kit-canceled-submit-observation.json', {
        body: JSON.stringify(observation, null, 2),
        contentType: 'application/json',
      });
    expect(
      observation.events.some(
        (event: { stage: string; defaultPrevented: boolean }) =>
          event.stage === 'after-attachments' && event.defaultPrevented,
      ),
    ).toBe(true);
  });
for (const mode of ['', 'replacement', 'formReplacement'])
  test(`acceptance Kit ${mode || 'default'} invalid contextual Field submits zero requests and performs zero server operations`, async ({
    page,
  }) => {
    const input = await setup(page, mode);
    const before = await readCounter(page);
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('remote'))
        requests.push(request.url());
    });
    await input.fill('blocked@example.com');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await page.waitForTimeout(300);
    const after = await readCounter(page);
    await test
      .info()
      .attach('kit-invalid-submit-acceptance-counter.json', {
        body: JSON.stringify({ before, after, delta: after - before, requests: requests.length }),
        contentType: 'application/json',
      });
    expect.soft(requests).toHaveLength(0);
    expect.soft(after - before).toBe(0);
    await expect.soft(page.locator('#remote-result')).toHaveText('null');
    await expect.soft(page.locator('#remote-resets')).toHaveText('0');
    await expect.soft(input).toHaveValue('blocked@example.com');
    await expect.soft(input).toHaveAttribute('aria-invalid', 'true');
  });
for (const mode of ['', 'formReplacement'])
  test(`acceptance Kit ${mode || 'default'} named controls preserve invalid blocking and the next valid native submit`, async ({
    page,
  }) => {
    const input = await setup(page, mode);
    const before = await readCounter(page);
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('remote'))
        requests.push(request.url());
    });
    const attributes = await page.locator('#remote-form').evaluate((form: HTMLFormElement) => {
      for (const name of [
        'action',
        'method',
        'target',
        'getAttribute',
        'ownerDocument',
        'baseURI',
      ]) {
        const control = document.createElement('input');
        control.type = 'hidden';
        control.name = name;
        control.value = name;
        form.append(control);
      }
      const read = (name: 'method' | 'action' | 'target') =>
        Object.getOwnPropertyDescriptor(HTMLFormElement.prototype, name)!.get!.call(form);
      return {
        action: read('action'),
        method: read('method'),
        target: read('target'),
        namedCollisions: [
          'action',
          'method',
          'target',
          'getAttribute',
          'ownerDocument',
          'baseURI',
        ].map((name) => ({
          name,
          instanceLookupIsControl: Reflect.get(form, name) instanceof HTMLInputElement,
        })),
      };
    });
    await test
      .info()
      .attach('kit-native-named-control-attributes.json', {
        body: JSON.stringify(attributes, null, 2),
        contentType: 'application/json',
      });
    expect(attributes.namedCollisions.every((collision) => collision.instanceLookupIsControl)).toBe(
      true,
    );
    // Playwright locator.fill/click itself calls ancestor.getAttribute for ARIA checks. Native focus
    // plus trusted keyboard events exercises the real collision without patching a DOM API.
    await input.evaluate((node) => HTMLElement.prototype.focus.call(node));
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('blocked@example.com');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    expect(requests).toHaveLength(0);
    expect((await readCounter(page)) - before).toBe(0);
    await expect(input).toHaveValue('blocked@example.com');
    await expect(page.locator('#remote-result')).toHaveText('null');
    await expect(page.locator('#remote-resets')).toHaveText('0');
    await input.evaluate((node) => HTMLElement.prototype.focus.call(node));
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('valid@example.com');
    await page.keyboard.press('Enter');
    await expect(page.locator('#remote-result')).toContainText('valid@example.com');
    expect(requests).toHaveLength(1);
    expect((await readCounter(page)) - before).toBe(1);
    await expect(input).toHaveValue('seed@example.com');
    await expect(page.locator('#remote-resets')).toHaveText('1');
  });
for (const mode of ['', 'native'])
  for (const target of ['_blank', '_BLANK', '_Blank'])
    test(`diagnostic Kit ${mode || 'Form'} target ${target} preserves actual request and propagation observations`, async ({
      page,
    }) => {
      // The native control is otherwise valid, so cancel its native submit to keep this characterization
      // in one browsing context. Kit's enhancement still exposes whether it matches this target spelling.
      const input = await setup(page, mode ? 'native&canceledSubmit' : '');
      const before = await readCounter(page);
      const requests: string[] = [];
      page.on('request', (request) => {
        if (request.method() === 'POST' && request.url().includes('remote'))
          requests.push(request.url());
      });
      await page
        .locator('#remote-form')
        .evaluate((form: HTMLFormElement, value) => form.setAttribute('target', value), target);
      await input.fill('blocked@example.com');
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(page.locator('#remote-events')).toContainText('capture');
      await page.waitForTimeout(300);
      const after = await readCounter(page);
      const observation = {
        mode: mode || 'Form',
        target,
        counterBefore: before,
        counterAfter: after,
        delta: after - before,
        requests: requests.length,
        result: JSON.parse((await page.locator('#remote-result').textContent()) ?? 'null'),
        events: JSON.parse((await page.locator('#remote-events').textContent()) ?? '[]'),
        nativeSubmit: await page.locator('#remote-native-submit').textContent(),
        resets: await page.locator('#remote-resets').textContent(),
        value: await input.inputValue(),
      };
      await test
        .info()
        .attach('kit-target-case-observation.json', {
          body: JSON.stringify(observation, null, 2),
          contentType: 'application/json',
        });
      expect(observation.events.some((event: { stage: string }) => event.stage === 'capture')).toBe(
        true,
      );
    });
test('acceptance Kit synthetic DIV submitter override attributes retain ordinary later listeners and the next valid submit', async ({
  page,
}) => {
  const input = await setup(page);
  const before = await readCounter(page);
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('remote'))
      requests.push(request.url());
  });
  await observeLaterListeners(page);
  await input.fill('blocked@example.com');
  const observation = await page.locator('#remote-form').evaluate((form: HTMLFormElement) => {
    const submitter = document.createElement('div');
    submitter.setAttribute('formmethod', 'post');
    submitter.setAttribute('formaction', form.action);
    submitter.setAttribute('formtarget', '_self');
    const event = new SubmitEvent('submit', { submitter, cancelable: true, bubbles: true });
    form.dispatchEvent(event);
    return {
      submitter: submitter.tagName,
      nativeMethod: Reflect.get(submitter, 'formMethod') ?? null,
      defaultPrevented: event.defaultPrevented,
    };
  });
  expect(observation).toEqual({ submitter: 'DIV', nativeMethod: null, defaultPrevented: true });
  await page.waitForTimeout(300);
  expect(requests).toHaveLength(0);
  expect((await readCounter(page)) - before).toBe(0);
  await expectLaterListeners(page, 1);
  await expect(page.locator('#remote-events')).toContainText('after-attachments');
  await expect(page.locator('#remote-native-submit')).toHaveText('0');
  await expect(page.locator('#remote-result')).toHaveText('null');
  await expect(page.locator('#remote-resets')).toHaveText('0');
  await expect(input).toHaveValue('blocked@example.com');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expectNextValidSubmit(page, input, before, requests, 1);
});
for (const mode of ['', 'formReplacement'])
  for (const remoteDocument of [false, true])
    test(`acceptance Kit ${mode || 'default'} empty formaction follows ${remoteDocument ? 'remote document despite ordinary base' : 'ordinary document despite remote base'} and the next valid submit`, async ({
      page,
    }) => {
      const input = await setup(page, mode);
      const before = await readCounter(page);
      const requests: string[] = [];
      page.on('request', (request) => {
        if (request.method() === 'POST' && request.url().includes('remote'))
          requests.push(request.url());
      });
      await observeLaterListeners(page);
      await input.fill('blocked@example.com');
      const observation = await page
        .locator('#remote-form')
        .evaluate((form: HTMLFormElement, useRemoteDocument) => {
          const originalAction = form.action,
            originalDocument = document.URL;
          const remoteURL = new URL(originalDocument);
          remoteURL.searchParams.set(
            '/remote',
            new URL(originalAction).searchParams.get('/remote')!,
          );
          if (useRemoteDocument) history.replaceState(history.state, '', remoteURL);
          const base = document.createElement('base');
          base.id = 'boundary-base';
          base.href = useRemoteDocument
            ? new URL('/ordinary-base', location.origin).href
            : remoteURL.href;
          document.head.prepend(base);
          const submitter = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
          submitter.setAttribute('formaction', '');
          return {
            documentURL: document.URL,
            baseURI: document.baseURI,
            action: submitter.formAction,
            method: form.method,
            remoteDocument: new URL(document.URL).searchParams.has('/remote'),
          };
        }, remoteDocument);
      expect(observation.action).toBe(observation.documentURL);
      expect(observation.action).not.toBe(observation.baseURI);
      expect(observation.remoteDocument).toBe(remoteDocument);
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(input).toBeFocused();
      await page.waitForTimeout(300);
      expect(requests).toHaveLength(0);
      expect((await readCounter(page)) - before).toBe(0);
      await expectLaterListeners(page, 1);
      await expect(page.locator('#remote-result')).toHaveText('null');
      await expect(page.locator('#remote-resets')).toHaveText('0');
      await expect(page.locator('#remote-native-submit')).toHaveText('0');
      await expect(input).toHaveValue('blocked@example.com');
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      if (!remoteDocument)
        await page.locator('#remote-form').evaluate((form: HTMLFormElement) => {
          document.getElementById('boundary-base')!.remove();
          form.querySelector('button[type="submit"]')!.removeAttribute('formaction');
        });
      await expectNextValidSubmit(page, input, before, requests, 1);
    });
for (const tag of ['button', 'input'] as const)
  test(`acceptance Kit native ${tag} submitter reflected overrides preserve method action target selection and the next valid submit`, async ({
    page,
  }) => {
    const input = await setup(page);
    const before = await readCounter(page);
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('remote'))
        requests.push(request.url());
    });
    await observeLaterListeners(page);
    await input.fill('blocked@example.com');
    await page.locator('#remote-form').evaluate((form: HTMLFormElement, name) => {
      const submitter = document.createElement(name);
      submitter.id = 'boundary-submitter';
      submitter.type = 'submit';
      form.append(submitter);
    }, tag);
    let later = 0;
    for (const [attribute, value] of [
      ['formmethod', '', false],
      ['formmethod', 'invalid', false],
      ['formmethod', 'get', false],
      ['formmethod', 'dialog', false],
      ['formmethod', 'POST', true],
      ['formaction', '/ordinary', false],
      ['formtarget', '_blank', false],
      ['formtarget', '_self', true],
    ] as const) {
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
            method: submitter.hasAttribute('formmethod') ? submitter.formMethod : form.method,
            action: submitter.hasAttribute('formaction') ? submitter.formAction : form.action,
            target: submitter.hasAttribute('formtarget') ? submitter.formTarget : form.target,
            defaultPrevented: event.defaultPrevented,
          };
        },
        [attribute, value],
      );
      expect(observation.defaultPrevented).toBe(true);
      if (attribute === 'formmethod')
        expect(observation.method).toBe(
          value === 'POST' ? 'post' : value === 'dialog' ? 'dialog' : 'get',
        );
      later += 1;
      await expectLaterListeners(page, later);
    }
    await page.waitForTimeout(300);
    expect(requests).toHaveLength(0);
    expect((await readCounter(page)) - before).toBe(0);
    await expect(page.locator('#remote-result')).toHaveText('null');
    await expect(page.locator('#remote-resets')).toHaveText('0');
    await expect(page.locator('#remote-native-submit')).toHaveText('0');
    await expect(input).toHaveValue('blocked@example.com');
    await page.locator('#boundary-submitter').evaluate((node) => node.remove());
    await expectNextValidSubmit(page, input, before, requests, later);
  });
