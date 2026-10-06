// Authored actual Original/native regression; zero unchanged Original declaration credit.
import {
  React,
  createRoot,
  flushSync,
  Menu,
} from '../../../../apps/fixtures/src/lib/menu-family-probe-original.js';
import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './fixtures/MenuRetainedFocusMatrix.svelte';
import { focusValue } from './fixtures/menuFocusValues.js';
async function settle() {
  await tick();
  await new Promise((resolve) => setTimeout(resolve, 80));
  await tick();
}
afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
  document.body.removeAttribute('style');
  document.documentElement.removeAttribute('style');
});
const cases = [
  ['replace-callback', ['new'], 'new-target'],
  ['replace-ref', [], 'new-target'],
  ['mutate-ref', [], 'new-target'],
  ['true-to-false', [], ''],
  ['false-to-true', [], 'opener'],
  ['callback-to-false', [], ''],
  ['undefined-to-callback', ['new'], 'new-target'],
  ['callback-to-undefined', [], 'opener'],
  ['callback-to-empty-ref', [], 'opener'],
  ['callback-returns-false', ['new'], ''],
  ['callback-returns-undefined', ['new'], ''],
  ['callback-returns-null', ['new'], 'opener'],
  ['callback-returns-true', ['new'], 'opener'],
] as const;
async function setup(source: boolean, mode: string) {
  const target = document.createElement('section');
  document.body.append(target);
  const log: string[] = [];
  let stop: () => void | Promise<void>;
  let close: () => void;
  let replace: () => void;
  let finish: () => void;
  let cancelClose: () => void;
  let reopen: () => void;
  if (source) {
    const root = createRoot(target);
    const actions = { current: null as null | { close(): void; unmount(): void } };
    const liveRef = { current: null as HTMLElement | null };
    let generation = 0;
    let cancelNext = false;
    const render = () =>
      flushSync(() =>
        root.render(
          React.createElement(
            React.Fragment,
            null,
            React.createElement('button', { id: 'old-target', ref: liveRef }, 'Old'),
            React.createElement('button', { id: 'new-target' }, 'New'),
            React.createElement('button', { id: 'latest-target' }, 'Latest'),
            React.createElement(
              Menu.Root,
              {
                defaultOpen: true,
                actionsRef: actions,
                onOpenChange(
                  open: boolean,
                  details: { preventUnmountOnClose(): void; cancel(): void },
                ) {
                  if (!open) {
                    details.preventUnmountOnClose();
                    if (cancelNext) {
                      cancelNext = false;
                      details.cancel();
                    }
                  }
                },
              },
              React.createElement(Menu.Trigger, { id: 'opener' }, 'Open'),
              React.createElement(
                Menu.Portal,
                null,
                React.createElement(
                  Menu.Positioner,
                  null,
                  React.createElement(
                    Menu.Popup,
                    {
                      finalFocus: focusValue(mode, generation, (value) => log.push(value), liveRef),
                    },
                    React.createElement(Menu.Item, { id: 'inside' }, 'Inside'),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    render();
    close = () => flushSync(() => actions.current!.close());
    replace = () => {
      generation += 1;
      if (mode === 'mutate-ref') liveRef.current = document.getElementById('new-target');
      else render();
    };
    cancelClose = () => {
      cancelNext = true;
    };
    reopen = () => flushSync(() => document.getElementById('opener')!.click());
    finish = () => flushSync(() => actions.current!.unmount());
    stop = () => flushSync(() => root.unmount());
  } else {
    const instance = mount(Fixture, {
      target,
      props: { mode, log: (value: string) => log.push(value) },
    });
    ({ close, replace, finish, cancelClose, reopen } = instance);
    stop = () => unmount(instance);
  }
  await settle();
  document.getElementById('inside')!.focus();
  return { target, log, stop, close, replace, finish, cancelClose, reopen };
}
for (const source of [true, false]) {
  for (const [mode, expectedLog, expectedFocus] of cases)
    it(`${source ? 'Original' : 'native'} retained finalFocus ${mode}`, async () => {
      const warnings = vi.spyOn(console, 'warn');
      const c = await setup(source, mode);
      try {
        c.close();
        await settle();
        expect(document.getElementById('inside')).not.toBeNull();
        expect(c.log).toEqual([]);
        c.replace();
        await settle();
        c.finish();
        await settle();
        const vector = {
          log: c.log,
          focus: document.activeElement?.id,
          retained: document.getElementById('inside') !== null,
        };
        console.log(JSON.stringify({ framework: source ? 'Original' : 'native', mode, ...vector }));
        expect(vector).toEqual({ log: [...expectedLog], focus: expectedFocus, retained: false });
      } finally {
        await c.stop();
        await settle();
        c.target.remove();
      }
      expect(
        warnings.mock.calls.filter((args) =>
          args.some((value) => String(value).includes('derived_inert')),
        ),
      ).toEqual([]);
    });
  it(`${source ? 'Original' : 'native'} canceled close keeps finalFocus live through subsequent retained close`, async () => {
    const warnings = vi.spyOn(console, 'warn');
    const c = await setup(source, 'replace-callback');
    try {
      c.cancelClose();
      c.close();
      await settle();
      expect(document.getElementById('opener')?.getAttribute('aria-expanded')).toBe('true');
      expect(c.log).toEqual([]);
      c.replace();
      await settle();
      c.close();
      await settle();
      expect(document.getElementById('inside')).not.toBeNull();
      c.finish();
      await settle();
      expect(c.log).toEqual(['new']);
      expect(document.activeElement?.id).toBe('new-target');
      expect(document.getElementById('inside')).toBeNull();
    } finally {
      await c.stop();
      await settle();
      c.target.remove();
    }
    expect(
      warnings.mock.calls.filter((args) =>
        args.some((value) => String(value).includes('derived_inert')),
      ),
    ).toEqual([]);
  });
  it(`${source ? 'Original' : 'native'} retained reopen uses latest finalFocus at next actual unmount`, async () => {
    const warnings = vi.spyOn(console, 'warn');
    const c = await setup(source, 'replace-callback');
    try {
      c.close();
      await settle();
      c.replace();
      await settle();
      c.reopen();
      await settle();
      expect(document.getElementById('opener')?.getAttribute('aria-expanded')).toBe('true');
      expect(c.log).toEqual([]);
      c.close();
      await settle();
      c.replace();
      await settle();
      c.finish();
      await settle();
      expect(c.log).toEqual(['latest']);
      expect(document.activeElement?.id).toBe('latest-target');
      expect(document.getElementById('inside')).toBeNull();
    } finally {
      await c.stop();
      await settle();
      c.target.remove();
    }
    expect(
      warnings.mock.calls.filter((args) =>
        args.some((value) => String(value).includes('derived_inert')),
      ),
    ).toEqual([]);
  });
}
