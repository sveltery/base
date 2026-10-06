// Additive native style witnesses. Zero unchanged Original assertion credit.
// Original predicates remain intact; failed native predecessor is archived separately.
import { expect, it, vi } from 'vitest';
import { flushSync, hydrate, mount, tick, unmount } from 'svelte';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { createNavigationMenuTestTransport } from '../../../../apps/fixtures/src/lib/navigation-menu-test-transport.js';
import Bare from '../../../../apps/fixtures/src/lib/NativeNavigationMenuStyleWitness.svelte';
import Public from './NavigationMenuSizeStyleOwner.svelte';
function sample(host: HTMLElement) {
  return {
    connected: host.isConnected,
    color: host.style.color,
    pointer: host.style.pointerEvents,
    popupWidth: host.style.getPropertyValue('--popup-width'),
    popupHeight: host.style.getPropertyValue('--popup-height'),
    positionerWidth: host.style.getPropertyValue('--positioner-width'),
    positionerHeight: host.style.getPropertyValue('--positioner-height'),
  };
}
it('measures actual public Source sizing writes and subsequent native full-style updates', async () => {
  const target = document.createElement('section');
  document.body.append(target);
  const width = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300);
  const height = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(200);
  const trace: { phase: string; operation: string; host: string; value: unknown }[] = [];
  let phase = 'mount';
  const setProperty = CSSStyleDeclaration.prototype.setProperty;
  const setAttribute = Element.prototype.setAttribute;
  const propertySpy = vi
    .spyOn(CSSStyleDeclaration.prototype, 'setProperty')
    .mockImplementation(function (this: CSSStyleDeclaration, property, value, priority) {
      setProperty.call(this, property, value, priority);
      if (
        !['--popup-width', '--popup-height', '--positioner-width', '--positioner-height'].includes(
          property,
        )
      )
        return;
      const host = [
        ...document.querySelectorAll<HTMLElement>('[data-size-positioner], [data-size-popup]'),
      ].find((host) => host.style === this);
      if (host)
        trace.push({
          phase,
          operation: `setProperty:${property}`,
          host: host.hasAttribute('data-size-positioner') ? 'positioner' : 'popup',
          value: { assigned: value, observed: sample(host) },
        });
    });
  const attributeSpy = vi.spyOn(Element.prototype, 'setAttribute').mockImplementation(function (
    this: Element,
    name,
    value,
  ) {
    setAttribute.call(this, name, value);
    if (
      name === 'style' &&
      this instanceof HTMLElement &&
      (this.hasAttribute('data-size-positioner') || this.hasAttribute('data-size-popup'))
    )
      trace.push({
        phase,
        operation: 'setAttribute:style',
        host: this.hasAttribute('data-size-positioner') ? 'positioner' : 'popup',
        value: sample(this),
      });
  });
  const transport = createNavigationMenuTestTransport();
  const app = mount(Public, { target });
  transport.ready(undefined, () => unmount(app));
  try {
    await transport.flush();
    const samplePublic = (label: string) => {
      for (const [selector, name] of [
        ['[data-size-positioner]', 'positioner'],
        ['[data-size-popup]', 'popup'],
      ]) {
        const host = document.querySelector<HTMLElement>(selector);
        if (!host) throw new Error(`Missing actual ${name} host`);
        trace.push({ phase, operation: label, host: name, value: sample(host) });
      }
    };
    samplePublic('after-mount');
    const positioner = document.querySelector<HTMLElement>('[data-size-positioner]');
    const popup = document.querySelector<HTMLElement>('[data-size-popup]');
    const second = [...target.querySelectorAll('button')].find(
      (host) => host.textContent === 'Second',
    );
    if (!second || !positioner) throw new Error('Missing actual public sizing hosts');
    phase = 'switch';
    await transport.mutate(() => second.click());
    await new Promise<void>((done) => requestAnimationFrame(() => done()));
    await tick();
    samplePublic('after-switch');
    phase = 'color';
    await transport.mutate(() => app.updateColor('blue'));
    samplePublic('after-color');
    console.info(`navigation-menu-native-public-style:${JSON.stringify(trace)}`);
    expect(document.querySelector('[data-size-positioner]')).toBe(positioner);
    expect(positioner.style.color).toBe('blue');
    expect(document.querySelector('[data-size-popup]')).toBe(popup);
    const observed = (operation: string, host: string) =>
      trace.find((entry) => entry.operation === operation && entry.host === host)?.value;
    expect(observed('after-mount', 'positioner')).toMatchObject({
      color: 'red',
      positionerWidth: '300px',
      positionerHeight: '200px',
    });
    expect(observed('after-mount', 'popup')).toMatchObject({
      color: 'red',
      popupWidth: '300px',
      popupHeight: '200px',
    });
    expect(observed('after-switch', 'positioner')).toMatchObject({
      color: 'red',
      positionerWidth: '',
      positionerHeight: '',
    });
    expect(observed('after-switch', 'popup')).toMatchObject({
      color: 'red',
      popupWidth: 'auto',
      popupHeight: 'auto',
    });
    expect(observed('after-color', 'positioner')).toMatchObject({
      color: 'blue',
      positionerWidth: '',
      positionerHeight: '',
    });
    expect(observed('after-color', 'popup')).toMatchObject({
      color: 'blue',
      popupWidth: '',
      popupHeight: '',
    });
    // Validate that this is an actual Source sizing-write witness, not a bare
    // empty-style observation. Settled predicates use the focused-1b measurements.
    expect(
      trace.some(
        (entry) =>
          entry.operation === 'setProperty:--positioner-width' &&
          (entry.value as { assigned: string }).assigned === '300px',
      ),
    ).toBe(true);
    expect(
      trace.some(
        (entry) =>
          entry.operation === 'setProperty:--positioner-height' &&
          (entry.value as { assigned: string }).assigned === '200px',
      ),
    ).toBe(true);
  } finally {
    await transport.dispose();
    target.remove();
    attributeSpy.mockRestore();
    propertySpy.mockRestore();
    width.mockRestore();
    height.mockRestore();
  }
});
it('hydrates literal bare Svelte hosts and observes imperative loss plus later authored values', async () => {
  const fixture = pathToFileURL(
    resolve('../../apps/fixtures/src/lib/NativeNavigationMenuStyleWitness.svelte'),
  ).href;
  const html = execFileSync(
    process.execPath,
    [
      '--import',
      resolve('../../scripts/svelte-ssr-loader.mjs'),
      '--input-type=module',
      '-e',
      `import { render } from 'svelte/server'; import Bare from ${JSON.stringify(fixture)}; process.stdout.write(render(Bare).body);`,
    ],
    { encoding: 'utf8' },
  );
  expect(html).toContain('data-hydrated="false"');
  const target = document.createElement('section');
  target.innerHTML = html;
  document.body.append(target);
  const originalHosts = ['attribute', 'spread'].map((kind) =>
    target.querySelector<HTMLElement>(`[data-testid="bare-${kind}-host"]`),
  );
  const warnings = vi.spyOn(console, 'warn');
  const errors = vi.spyOn(console, 'error');
  const app = hydrate(Bare, { target });
  try {
    flushSync();
    await tick();
    expect(
      target.querySelector('[data-testid="bare-style-witness"]')?.getAttribute('data-hydrated'),
    ).toBe('true');
    const trace: { phase: string; hosts: ReturnType<typeof sample>[] }[] = [];
    const record = (phase: string) => {
      trace.push({
        phase,
        hosts: originalHosts.map((host) => {
          if (!host) throw new Error('Missing bare SSR host');
          return sample(host);
        }),
      });
    };
    record('hydrated');
    for (const action of ['write', 'update', 'author']) {
      const button = target.querySelector<HTMLButtonElement>(`[data-testid="bare-${action}"]`);
      if (!button) throw new Error('Missing actual bare control');
      button.click();
      flushSync();
      await tick();
      record(action);
    }
    console.info(`navigation-menu-native-bare-style:${JSON.stringify(trace)}`);
    for (const [index, host] of originalHosts.entries()) {
      if (!host) throw new Error('Missing bare host');
      expect(host.isConnected).toBe(true);
      expect(
        target.querySelector(`[data-testid="bare-${index === 0 ? 'attribute' : 'spread'}-host"]`),
      ).toBe(host);
      expect(host.style.pointerEvents).toBe('auto');
      expect(host.style.getPropertyValue('--positioner-width')).toBe('375px');
    }
    const imperative = {
      connected: true,
      color: 'red',
      pointer: 'auto',
      popupWidth: '250px',
      popupHeight: '120px',
      positionerWidth: '250px',
      positionerHeight: '120px',
    };
    const replaced = {
      connected: true,
      color: 'blue',
      pointer: '',
      popupWidth: '',
      popupHeight: '',
      positionerWidth: '',
      positionerHeight: '',
    };
    const authored = {
      connected: true,
      color: 'blue',
      pointer: 'auto',
      popupWidth: '375px',
      popupHeight: '160px',
      positionerWidth: '375px',
      positionerHeight: '160px',
    };
    expect(trace[1]).toEqual({ phase: 'write', hosts: [imperative, imperative] });
    expect(trace[2]).toEqual({ phase: 'update', hosts: [replaced, replaced] });
    expect(trace[3]).toEqual({ phase: 'author', hosts: [authored, authored] });
    expect(warnings.mock.calls.filter((call) => /hydration/i.test(call.join(' ')))).toEqual([]);
    expect(errors.mock.calls.filter((call) => /hydration/i.test(call.join(' ')))).toEqual([]);
  } finally {
    await unmount(app);
    target.remove();
    warnings.mockRestore();
    errors.mockRestore();
  }
});
