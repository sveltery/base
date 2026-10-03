// Source contracts from Base UI 1.8.0 SwitchRoot/CheckboxRoot/CheckboxGroup.
// Supplemental native-Svelte probes, zero ordinary parity credit pending paired witnesses. MIT.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount, type ComponentProps } from 'svelte';
import { Switch } from '../../src/lib/switch/index.js';
import { Checkbox } from '../../src/lib/checkbox/index.js';
import Fixture from './BooleanFieldFixture.svelte';
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
});
function render(
  family: 'switch' | 'checkbox',
  props: Partial<ComponentProps<typeof Fixture>> = {},
) {
  const host = document.createElement('div');
  document.body.append(host);
  const component = mount(Fixture, { target: host, props: { family, ...props } });
  cleanups.push(() => unmount(component));
  flushSync();
  return {
    host,
    component,
    root: () => host.querySelector<HTMLElement>(`[role="${family}"]`)!,
    input: () => host.querySelector<HTMLInputElement>('input[type="checkbox"]')!,
    form: () => host.querySelector('form')!,
    click() {
      host.querySelector<HTMLElement>(`[role="${family}"]`)!.click();
      flushSync();
    },
  };
}
for (const family of ['switch', 'checkbox'] as const)
  describe(family, () => {
    it('owns one root, hidden native checkbox, stateful part and Field registry', async () => {
      const submit = vi.fn();
      const view = render(family, { submit });
      expect(view.host.querySelectorAll('input[type="checkbox"]')).toHaveLength(1);
      expect(view.root().getAttribute('aria-checked')).toBe('false');
      view.click();
      await tick();
      expect(view.root().getAttribute('aria-checked')).toBe('true');
      expect(view.host.querySelector('[data-part]')!.hasAttribute('data-checked')).toBe(
        true,
      );
      view.host.querySelector<HTMLButtonElement>('[type="submit"]')!.click();
      flushSync();
      await tick();
      expect(submit).toHaveBeenCalledTimes(1);
      expect(submit.mock.calls[0][0]).toEqual({ enabled: true });
      expect(new FormData(view.form()).get('enabled')).toBe('on');
    });
    it('uses source field label/description IDs and focuses visible control', () => {
      const view = render(family);
      expect(view.input().style.width).toBe('1px');
      expect(view.input().style.height).toBe('1px');
      expect(view.input().style.margin).toBe('-1px');
      expect(getComputedStyle(view.input()).position).toBe('absolute');
      const label = view.host.querySelector<HTMLLabelElement>('[data-label]')!;
      expect(label.htmlFor).toBe(view.input().id);
      expect(view.root().getAttribute('aria-labelledby')).toBe(label.id);
      expect(view.input().getAttribute('aria-describedby')).toBe(
        view.host.querySelector('[data-description]')!.id,
      );
      view.input().focus();
      expect(document.activeElement).toBe(view.root());
    });
    it('supports native wrapping labels using live aria fallback', async () => {
      const view = render(family, { scenario: 'label' });
      await tick();
      const label = view.host.querySelector('label')!;
      expect(label.id).not.toBe('');
      expect(view.root().getAttribute('aria-labelledby')).toBe(label.id);
      label.click();
      flushSync();
      expect(view.root().getAttribute('aria-checked')).toBe('true');
    });
    it('updates controlled owner state through checked callback', () => {
      const callback = vi.fn();
      const view = render(family, {
        scenario: 'controlled',
        rootProps: { onCheckedChange: callback },
      });
      view.click();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(view.root().getAttribute('aria-checked')).toBe('true');
      view.component.setChecked(false);
      flushSync();
      expect(view.root().getAttribute('aria-checked')).toBe('false');
      expect(view.input().checked).toBe(false);
    });
    it.each(['field', 'controlled'])(
      'native activation cancellation leaves DOM and source state unchanged (%s)',
      async (scenario) => {
        const callback = vi.fn((_value, details) => details.cancel());
        const view = render(family, {
          scenario,
          rootProps: { onCheckedChange: callback },
        });
        const inputEvent = vi.fn();
        view.form()?.addEventListener('input', inputEvent);
        view.click();
        await tick();
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.calls[0][1].event.type).toBe('click');
        expect(view.root().getAttribute('aria-checked')).toBe('false');
        expect(view.input().checked).toBe(false);
        expect(inputEvent).not.toHaveBeenCalled();
      },
    );
    it('underlying canceled click is ignored and callback cancellation rolls back direct click', () => {
      const callback = vi.fn((_value, details) => details.cancel());
      const view = render(family, { rootProps: { onCheckedChange: callback } });
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      event.preventDefault();
      view.input().dispatchEvent(event);
      flushSync();
      expect(callback).not.toHaveBeenCalled();
      expect(view.input().checked).toBe(false);
      view.input().click();
      flushSync();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(view.input().checked).toBe(false);
    });
    it.each(['disabled', 'readOnly'] as const)(
      'blocks root and hidden input activation for %s',
      (property) => {
        const callback = vi.fn();
        const view = render(family, {
          rootProps: { [property]: true, onCheckedChange: callback },
        });
        view.click();
        view.input().click();
        flushSync();
        expect(callback).not.toHaveBeenCalled();
        expect(view.input().checked).toBe(false);
        expect(view.root().getAttribute('aria-checked')).toBe('false');
      },
    );
    it('submits custom checked/unchecked values with source callback state', () => {
      const view = render(family, { rootProps: { value: 'yes', uncheckedValue: 'no' } });
      expect(new FormData(view.form()).getAll('enabled')).toEqual(['no']);
      view.click();
      expect(new FormData(view.form()).getAll('enabled')).toEqual(['yes']);
      view.click();
      expect(new FormData(view.form()).getAll('enabled')).toEqual(['no']);
    });
    it('preserves required native validation and source Field error/focus', async () => {
      const submit = vi.fn();
      const view = render(family, { submit, rootProps: { required: true } });
      view.host.querySelector<HTMLButtonElement>('[type="submit"]')!.click();
      flushSync();
      await tick();
      expect(submit).not.toHaveBeenCalled();
      expect(view.root().getAttribute('aria-invalid')).toBe('true');
      expect(document.activeElement).toBe(view.root());
      view.click();
      await tick();
      view.host.querySelector<HTMLButtonElement>('[type="submit"]')!.click();
      flushSync();
      await tick();
      expect(submit).toHaveBeenCalledTimes(1);
    });
    it('passes boolean to custom Field validation and clears server errors on accepted change', async () => {
      const validation = vi.fn((value) => (value ? null : 'Must enable'));
      const submit = vi.fn();
      const view = render(family, {
        validation,
        submit,
        errors: { enabled: 'Server error' },
      });
      expect(view.host.textContent).toContain('Server error');
      view.click();
      await tick();
      expect(view.host.textContent).not.toContain('Server error');
      view.host.querySelector<HTMLButtonElement>('[type="submit"]')!.click();
      flushSync();
      await tick();
      expect(validation).toHaveBeenCalledWith(true, expect.any(Object));
      expect(submit).toHaveBeenCalledTimes(1);
    });
    it('cleans Field registration and hidden input when unmounted', async () => {
      const submit = vi.fn();
      const view = render(family, { submit });
      view.click();
      view.component.hide();
      flushSync();
      await tick();
      expect(view.host.querySelector('input[type="checkbox"]')).toBeNull();
      view.host.querySelector<HTMLButtonElement>('[type="submit"]')!.click();
      flushSync();
      await tick();
      expect(submit.mock.calls[0][0]).toEqual({});
    });
    it('retains native reset behavior without a reset/checked restoration kernel', () => {
      const view = render(family, { rootProps: { defaultChecked: false } });
      view.click();
      expect(view.input().checked).toBe(true);
      view.form().reset();
      flushSync();
      // This is an observation of native Svelte checkbox defaults, not React parity.
      expect(view.input().checked).toBe(view.input().defaultChecked);
    });
    it('supports native button render replacement and attachment/ref forwarding', () => {
      const inputRef = { current: null as HTMLInputElement | null };
      const view = render(family, {
        scenario: 'native',
        rootProps: { inputRef, id: 'visible-control' },
      });
      expect(view.root().tagName).toBe('BUTTON');
      expect(view.root().id).toBe('visible-control');
      expect(view.input().id).toBe('');
      expect(inputRef.current).toBe(view.input());
      view.click();
      expect(view.root().getAttribute('aria-checked')).toBe('true');
    });
    it('detaches merged hidden-input refs and authored cleanup exactly once', async () => {
      const detached = vi.fn();
      const external = vi.fn((input: HTMLInputElement | null) =>
        input ? detached : undefined,
      );
      const view = render(family, { rootProps: { inputRef: external } });
      expect(external).toHaveBeenCalledTimes(1);
      expect(external.mock.calls[0][0]).toBe(view.input());
      view.component.hide();
      flushSync();
      await tick();
      expect(detached).toHaveBeenCalledTimes(1);
      expect(external).toHaveBeenCalledTimes(1);
    });
  });
describe('CheckboxGroup actual source composition', () => {
  it('re-registers a live child value in the original native-input registry', async () => {
    const submit = vi.fn();
    const view = render('checkbox', { scenario: 'group', submit });
    view.component.setGroupValue(['a']);
    flushSync();
    await tick();
    view.component.setChildValue('c');
    view.component.setGroupValue(['c']);
    flushSync();
    await tick();
    expect(new FormData(view.form()).getAll('choices')).toEqual(['c']);
    view.host.querySelector<HTMLButtonElement>('[type="submit"]')!.click();
    flushSync();
    await tick();
    expect(submit.mock.calls[0][0]).toEqual({ choices: ['c'] });
  });
  it('records the native group input event before Svelte flushes the checked-dependent value', async () => {
    const view = render('checkbox', { scenario: 'group' });
    const values: string[] = [];
    view
      .form()
      .addEventListener('input', (event) =>
        values.push((event.target as HTMLInputElement).value),
      );
    const child = [...view.host.querySelectorAll<HTMLElement>('[role="checkbox"]')][1];
    child.click();
    expect(values).toEqual(['']);
    flushSync();
    await tick();
    expect(new FormData(view.form()).getAll('choices')).toEqual(['a']);
  });
  it.each(['group', 'group-uncontrolled'])(
    'records native %s reset while the group owns child state',
    async (scenario) => {
      const submit = vi.fn();
      const view = render('checkbox', { scenario, submit });
      if (scenario === 'group') view.component.setGroupValue(['a']);
      flushSync();
      await tick();
      const children = () =>
        [...view.host.querySelectorAll<HTMLElement>('[role="checkbox"]')].slice(1);
      const inputs = () =>
        [...view.host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')].slice(
          1,
        );
      expect(children().map((child) => child.getAttribute('aria-checked'))).toEqual([
        'true',
        'false',
      ]);
      expect(inputs().map((input) => input.defaultChecked)).toEqual([false, false]);
      view.form().reset();
      flushSync();
      await tick();
      expect(inputs().map((input) => input.checked)).toEqual([false, false]);
      expect(children().map((child) => child.getAttribute('aria-checked'))).toEqual([
        'true',
        'false',
      ]);
      expect(new FormData(view.form()).getAll('choices')).toEqual([]);
      view.host.querySelector<HTMLButtonElement>('[type="submit"]')!.click();
      flushSync();
      await tick();
      expect(submit.mock.calls[0][0]).toEqual({ choices: [] });
      if (scenario === 'group') {
        view.component.setGroupValue([]);
        flushSync();
        await tick();
        expect(children().map((child) => child.getAttribute('aria-checked'))).toEqual([
          'false',
          'false',
        ]);
      }
    },
  );
  it('registers one array Field and distinct native inputs/labels', async () => {
    const submit = vi.fn();
    const view = render('checkbox', { scenario: 'group', submit });
    const roots = view.host.querySelectorAll<HTMLElement>('[role="checkbox"]');
    expect(roots).toHaveLength(3);
    expect(view.host.querySelector<HTMLLabelElement>('label')!.htmlFor).toBe('');
    roots[1].click();
    flushSync();
    await tick();
    expect(roots[0].getAttribute('aria-checked')).toBe('mixed');
    expect(roots[0].getAttribute('aria-controls')).toBe(`${roots[1].id} ${roots[2].id}`);
    view.host.querySelector<HTMLButtonElement>('[type="submit"]')!.click();
    flushSync();
    await tick();
    expect(submit.mock.calls[0][0]).toEqual({ choices: ['a'] });
    expect(new FormData(view.form()).getAll('choices')).toEqual(['a']);
  });
  it('parent toggles all, child mutation yields mixed state and group cancellation rolls back native activation', () => {
    const view = render('checkbox', { scenario: 'group' });
    const roots = view.host.querySelectorAll<HTMLElement>('[role="checkbox"]');
    roots[0].click();
    flushSync();
    expect(roots[1].getAttribute('aria-checked')).toBe('true');
    expect(roots[2].getAttribute('aria-checked')).toBe('true');
    roots[1].click();
    flushSync();
    expect(roots[0].getAttribute('aria-checked')).toBe('mixed');
    const canceled = render('checkbox', { scenario: 'group', canceled: true });
    const canceledRoots =
      canceled.host.querySelectorAll<HTMLElement>('[role="checkbox"]');
    canceledRoots[1].click();
    flushSync();
    expect(canceledRoots[1].getAttribute('aria-checked')).toBe('false');
    expect(
      canceled.host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[1]
        .checked,
    ).toBe(false);
  });
  it('parent respects disabled child successful controls', async () => {
    const submit = vi.fn();
    const view = render('checkbox', {
      scenario: 'group',
      rootProps: { disabled: true },
      submit,
    });
    view.host.querySelector<HTMLElement>('[data-parent-control]')!.click();
    flushSync();
    await tick();
    view.host.querySelector<HTMLButtonElement>('[type="submit"]')!.click();
    flushSync();
    await tick();
    expect(submit.mock.calls[0][0]).toEqual({ choices: ['a'] });
    expect(new FormData(view.form()).getAll('choices')).toEqual(['a']);
  });
});
it('parts fail clearly outside their actual source root', () => {
  const target = document.createElement('div');
  expect(() => mount(Switch.Thumb, { target })).toThrow('SwitchRootContext is missing');
  expect(() => mount(Checkbox.Indicator, { target })).toThrow(
    'CheckboxRootContext is missing',
  );
});

// Native event phase supplement. These checks deliberately do not assert that
// React's synthetic/native default-prevention split exists in Svelte.
describe('Checkbox native Enter submission boundary', () => {
  async function enterView(props: Record<string, unknown> = {}) {
    const { default: EnterFixture } = await import('./CheckboxEnterFixture.svelte');
    const host = document.createElement('div');
    document.body.append(host);
    const component = mount(EnterFixture, { target: host, props });
    cleanups.push(() => unmount(component));
    flushSync();
    const root = host.querySelector<HTMLElement>('[role="checkbox"]')!;
    return {
      host,
      root,
      component,
      enter() {
        const event = new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        });
        root.dispatchEvent(event);
        flushSync();
        return event;
      },
    };
  }
  it.each([false, true])(
    'submits once without ticking default root (nativeButton=%s)',
    async (native) => {
      const submit = vi.fn();
      const change = vi.fn();
      const view = await enterView({ native, submit, change });
      expect(view.enter().defaultPrevented).toBe(true);
      expect(submit).toHaveBeenCalledTimes(1);
      expect(change).not.toHaveBeenCalled();
      expect(view.root.getAttribute('aria-checked')).toBe('false');
      view.enter();
      expect(submit).toHaveBeenCalledTimes(2);
    },
  );
  it.each([false, true])(
    'respects ancestor default prevention (nativeButton=%s)',
    async (native) => {
      const submit = vi.fn();
      const view = await enterView({ native, ancestor: 'prevent', submit });
      view.enter();
      expect(submit).not.toHaveBeenCalled();
    },
  );
  it.each([false, true])(
    'stopPropagation prevents final native submit listener (nativeButton=%s)',
    async (native) => {
      const submit = vi.fn();
      const view = await enterView({ native, ancestor: 'stop', submit });
      const event = view.enter();
      expect(submit).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    },
  );
  it('later window cancellation cannot retroactively cancel earlier native handler', async () => {
    const submit = vi.fn();
    const view = await enterView({ submit });
    const cancel = (event: KeyboardEvent) => event.preventDefault();
    window.addEventListener('keydown', cancel);
    try {
      view.enter();
      expect(submit).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener('keydown', cancel);
    }
  });
  it('disabled button prevents Enter intent, readonly checkbox retains source Enter submission', async () => {
    const disabledSubmit = vi.fn();
    const disabledView = await enterView({ disabled: true, submit: disabledSubmit });
    disabledView.enter();
    expect(disabledSubmit).not.toHaveBeenCalled();
    const readonlySubmit = vi.fn();
    const readonlyView = await enterView({ readOnly: true, submit: readonlySubmit });
    readonlyView.enter();
    expect(readonlySubmit).toHaveBeenCalledTimes(1);
  });
  it('unmount removes owned listener and another checkbox does not process its events', async () => {
    const submit = vi.fn();
    const view = await enterView({ submit });
    view.component.hide();
    flushSync();
    view.root.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
    flushSync();
    expect(submit).not.toHaveBeenCalled();
    view.host
      .querySelector<HTMLElement>('[data-second]')!
      .dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
      );
    flushSync();
    expect(submit).toHaveBeenCalledTimes(1);
  });
});

for (const family of ['switch', 'checkbox'] as const)
  it(`${family} serializes provider names while logical errors/registry remain source-owned`, async () => {
    const { default: NameFixture } = await import('./BooleanNativeNameFixture.svelte');
    const submit = vi.fn();
    const target = document.createElement('div');
    document.body.append(target);
    const component = mount(NameFixture, { target, props: { family, submit } });
    cleanups.push(() => unmount(component));
    flushSync();
    const input = target.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    const root = target.querySelector<HTMLElement>(`[role="${family}"]`)!;
    const form = target.querySelector('form')!;
    expect(input.name).toBe('b:enabled');
    expect(new FormData(form).getAll('b:enabled')).toEqual(['false']);
    expect(target.textContent).toContain('logical error');
    root.click();
    flushSync();
    await tick();
    expect(target.textContent).not.toContain('logical error');
    expect(new FormData(form).getAll('b:enabled')).toEqual(['true']);
    target.querySelector<HTMLButtonElement>('[type="submit"]')!.click();
    flushSync();
    await tick();
    expect(submit.mock.calls[0][0]).toEqual({ enabled: true });
    component.setNativeName('b:other');
    flushSync();
    expect(input.name).toBe('b:other');
    expect(new FormData(form).get('b:other')).toBe('true');
    component.setNativeName('');
    flushSync();
    expect(input.name).toBe('');
    expect(new FormData(form).getAll('enabled')).toEqual([]);
    component.setNativeName(undefined);
    flushSync();
    expect(input.name).toBe('enabled');
  });
