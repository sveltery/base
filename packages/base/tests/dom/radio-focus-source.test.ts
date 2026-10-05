// Paired source focus/blur business supplements; zero original declaration credit. MIT.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './RadioFixture.svelte';
import CompositeFixture from './CompositeFocusFixture.svelte';
import {
  mountRadioReference,
  mountCompositeFocusReference,
} from '../../../../apps/fixtures/src/lib/radio-reference.js';

const cleanups: (() => Promise<void> | void)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
});

for (const renderer of ['react', 'svelte']) {
  it(`${renderer} descendant focus preserves group containment and onBlur validation`, async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const validate = vi.fn((value: unknown) => `Blur error: ${String(value)}`);
    if (renderer === 'react') {
      cleanups.push(mountRadioReference(host, 'onblur'));
      await vi.waitFor(() =>
        expect(
          host.querySelector('main[data-hydrated="true"]')?.getAttribute('data-renderer'),
        ).toBe('19.2.8/19.2.8'),
      );
    } else {
      const component = mount(Fixture, {
        target: host,
        props: { validationMode: 'onBlur', validate },
      });
      cleanups.push(() => unmount(component));
      flushSync();
    }
    const field = host.querySelector<HTMLElement>('#field')!;
    const radio = host.querySelector<HTMLElement>('[data-testid="radio-b"]')!;
    const next = host.querySelector<HTMLElement>('[data-testid="radio-c"]')!;
    const outside = host.querySelector<HTMLButtonElement>('#submit')!;
    const calls = () =>
      renderer === 'react'
        ? Number(host.querySelector('#validation-calls')?.textContent)
        : validate.mock.calls.length;
    expect(field.hasAttribute('data-focused')).toBe(false);
    expect(field.hasAttribute('data-touched')).toBe(false);
    expect(calls()).toBe(0);
    radio.focus();
    flushSync();
    await vi.waitFor(() => expect(field.hasAttribute('data-focused')).toBe(true));
    expect(field.hasAttribute('data-touched')).toBe(false);
    next.focus();
    flushSync();
    await vi.waitFor(() => expect(document.activeElement).toBe(next));
    expect(field.hasAttribute('data-focused')).toBe(true);
    expect(field.hasAttribute('data-touched')).toBe(false);
    expect(calls()).toBe(0);
    expect(radio.getAttribute('aria-checked')).toBe('true');
    outside.focus();
    flushSync();
    await vi.waitFor(() => expect(calls()).toBe(1));
    expect(field.hasAttribute('data-focused')).toBe(false);
    expect(field.hasAttribute('data-touched')).toBe(true);
    await vi.waitFor(() => expect(host.querySelector('#error')?.textContent).toBe('Blur error: b'));
    if (renderer === 'svelte') expect(validate.mock.lastCall?.[0]).toBe('b');
  });
}

for (const renderer of ['react', 'svelte']) {
  for (const mode of ['focus', 'arrow', 'cancel', 'disabled', 'readonly']) {
    it(`${renderer} nested textbox ${mode} focus follows item and Root business`, async () => {
      const host = document.createElement('div');
      document.body.append(host);
      const changed = vi.fn();
      const currentTargets: string[] = [];
      const observe = (event: { currentTarget: HTMLElement; preventBaseUIHandler(): void }) => {
        currentTargets.push(event.currentTarget.getAttribute('data-testid') ?? '');
        if (mode === 'cancel') event.preventBaseUIHandler();
      };
      if (renderer === 'react') {
        cleanups.push(mountRadioReference(host, mode, {}, false, { onFocus: observe }));
        await vi.waitFor(() =>
          expect(host.querySelector('main')?.getAttribute('data-hydrated')).toBe('true'),
        );
      } else {
        const component = mount(Fixture, {
          target: host,
          props: {
            onChange: changed,
            disabled: mode === 'disabled',
            readOnly: mode === 'readonly',
            radioFocusProps: { onfocusin: observe },
          },
        });
        cleanups.push(() => unmount(component));
        flushSync();
      }
      const field = host.querySelector<HTMLElement>('#field')!;
      const before = host.querySelector<HTMLElement>('[data-testid="radio-b"]')!;
      const next = host.querySelector<HTMLElement>('[data-testid="radio-c"]')!;
      const textbox = document.createElement('input');
      textbox.type = 'text';
      textbox.value = 'hello';
      next.append(textbox);
      textbox.setSelectionRange(5, 5);
      if (mode !== 'focus') {
        before.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
          }),
        );
        flushSync();
        await vi.waitFor(() => expect(field.hasAttribute('data-focused')).toBe(true));
      }
      textbox.focus();
      flushSync();
      await vi.waitFor(() => expect(currentTargets).toEqual(['radio-c']));
      await vi.waitFor(() => expect(next.tabIndex).toBe(mode === 'cancel' ? -1 : 0));
      expect(before.tabIndex).toBe(mode === 'cancel' ? 0 : -1);
      expect([textbox.selectionStart, textbox.selectionEnd]).toEqual(
        mode === 'cancel' ? [5, 5] : [0, 5],
      );
      const selected = mode === 'arrow' ? 'c' : 'b';
      await vi.waitFor(() =>
        expect(
          host.querySelector(`[data-testid="radio-${selected}"]`)?.getAttribute('aria-checked'),
        ).toBe('true'),
      );
      expect(field.hasAttribute('data-touched')).toBe(mode === 'arrow');
      const calls =
        renderer === 'react'
          ? JSON.parse(host.querySelector('#calls')!.textContent!)
          : changed.mock.calls;
      expect(calls).toHaveLength(mode === 'arrow' ? 1 : 0);
    });
  }
}

for (const renderer of ['react', 'svelte']) {
  for (const renderOverride of [false, true]) {
    it(`${renderer} direct Composite ${renderOverride ? 'rendered' : 'default'} host selects a descendant textbox`, async () => {
      const host = document.createElement('div');
      document.body.append(host);
      if (renderer === 'react') {
        cleanups.push(mountCompositeFocusReference(host, renderOverride));
        await vi.waitFor(() => expect(host.querySelector('#textbox')).not.toBeNull());
      } else {
        const component = mount(CompositeFixture, {
          target: host,
          props: { renderOverride },
        });
        cleanups.push(() => unmount(component));
        flushSync();
      }
      const textbox = host.querySelector<HTMLInputElement>('#textbox')!;
      expect(host.querySelector('#composite')?.tagName).toBe(renderOverride ? 'SECTION' : 'DIV');
      textbox.setSelectionRange(5, 5);
      textbox.focus();
      await vi.waitFor(() =>
        expect([textbox.selectionStart, textbox.selectionEnd]).toEqual([0, 5]),
      );
    });

    for (const prevent of [false, true]) {
      it(`${renderer} group ${renderOverride ? 'rendered' : 'default'} consumer ${prevent ? 'cancels' : 'precedes'} descendant focus business`, async () => {
        const host = document.createElement('div');
        document.body.append(host);
        const observations: unknown[] = [];
        type FocusConsumerEvent = {
          target: EventTarget | null;
          currentTarget: HTMLElement;
          preventBaseUIHandler(): void;
        };
        const observe = (phase: string) => (event: FocusConsumerEvent) => {
          const field = host.querySelector('#field')!;
          const textbox = event.target as HTMLInputElement;
          observations.push({
            phase,
            currentTarget: event.currentTarget.id,
            tag: event.currentTarget.tagName,
            focused: field.hasAttribute('data-focused'),
            touched: field.hasAttribute('data-touched'),
            selection: [textbox.selectionStart, textbox.selectionEnd],
          });
          if (prevent) event.preventBaseUIHandler();
        };
        const validate = vi.fn((value: unknown) => `Blur error: ${String(value)}`);
        const nativeFocus = vi.fn();
        if (renderer === 'react') {
          cleanups.push(
            mountRadioReference(
              host,
              'onblur',
              {
                onFocus: observe('enter'),
                onBlur: observe('leave'),
              },
              renderOverride,
            ),
          );
          await vi.waitFor(() =>
            expect(host.querySelector('main')?.getAttribute('data-hydrated')).toBe('true'),
          );
        } else {
          const component = mount(Fixture, {
            target: host,
            props: {
              validationMode: 'onBlur',
              validate,
              renderGroup: renderOverride,
              groupFocusProps: {
                onfocusin: observe('enter'),
                onfocusout: observe('leave'),
                onfocus: nativeFocus,
                onblur: nativeFocus,
              },
            },
          });
          cleanups.push(() => unmount(component));
          flushSync();
        }
        const group = host.querySelector<HTMLElement>('#radio-group')!;
        const field = host.querySelector<HTMLElement>('#field')!;
        const textbox = document.createElement('input');
        textbox.type = 'text';
        textbox.value = 'hello';
        group.append(textbox);
        textbox.setSelectionRange(5, 5);
        textbox.focus();
        flushSync();
        await vi.waitFor(() => expect(field.hasAttribute('data-focused')).toBe(!prevent));
        expect([textbox.selectionStart, textbox.selectionEnd]).toEqual(prevent ? [5, 5] : [0, 5]);
        expect(observations).toEqual([
          {
            phase: 'enter',
            currentTarget: 'radio-group',
            tag: renderOverride ? 'SECTION' : 'DIV',
            focused: false,
            touched: false,
            selection: [5, 5],
          },
        ]);
        host.querySelector<HTMLElement>('#submit')!.focus();
        flushSync();
        await vi.waitFor(() => expect(observations).toHaveLength(2));
        expect(observations[1]).toEqual({
          phase: 'leave',
          currentTarget: 'radio-group',
          tag: renderOverride ? 'SECTION' : 'DIV',
          focused: !prevent,
          touched: false,
          selection: prevent ? [5, 5] : [0, 5],
        });
        await vi.waitFor(() => expect(field.hasAttribute('data-touched')).toBe(!prevent));
        expect(field.hasAttribute('data-focused')).toBe(false);
        const calls = () =>
          renderer === 'react'
            ? Number(host.querySelector('#validation-calls')?.textContent)
            : validate.mock.calls.length;
        await vi.waitFor(() => expect(calls()).toBe(prevent ? 0 : 1));
        if (renderer === 'svelte') expect(nativeFocus).not.toHaveBeenCalled();
      });
    }
  }
}
