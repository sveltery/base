// Authored actual Original/native regression; zero unchanged Original declaration credit.
import {
  React,
  createRoot,
  flushSync,
  Menu,
} from '../../../../apps/fixtures/src/lib/menu-family-probe-original.js';
import { expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './fixtures/MenuRetainedFocus.svelte';
async function settle() {
  await tick();
  await new Promise((resolve) => setTimeout(resolve, 80));
  await tick();
}
for (const source of [true, false])
  it(`${source ? 'Original' : 'native'} retained finalFocus replacement`, async () => {
    const target = document.createElement('section');
    document.body.append(target);
    const log: string[] = [];
    let stop: () => void | Promise<void>;
    let close: () => void;
    let replace: () => void;
    let finish: () => void;
    if (source) {
      const root = createRoot(target);
      const actions = { current: null as null | { close(): void; unmount(): void } };
      let useNew = false;
      const render = () =>
        flushSync(() =>
          root.render(
            React.createElement(
              React.Fragment,
              null,
              React.createElement('button', { id: 'old-target' }, 'Old'),
              React.createElement('button', { id: 'new-target' }, 'New'),
              React.createElement(
                Menu.Root,
                {
                  defaultOpen: true,
                  actionsRef: actions,
                  onOpenChange: (open: boolean, details: { preventUnmountOnClose(): void }) => {
                    if (!open) details.preventUnmountOnClose();
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
                        finalFocus: useNew
                          ? () => {
                              log.push('new');
                              return document.getElementById('new-target');
                            }
                          : () => {
                              log.push('old');
                              return document.getElementById('old-target');
                            },
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
        useNew = true;
        render();
      };
      finish = () => flushSync(() => actions.current!.unmount());
      stop = () => flushSync(() => root.unmount());
    } else {
      const instance = mount(Fixture, {
        target,
        props: { log: (value: string) => log.push(value) },
      });
      close = instance.close;
      replace = instance.replace;
      finish = instance.finish;
      stop = () => unmount(instance);
    }
    try {
      await settle();
      document.getElementById('inside')!.focus();
      close();
      await settle();
      expect(document.getElementById('inside')).not.toBeNull();
      expect(log).toEqual([]);
      replace();
      await settle();
      finish();
      await settle();
      const vector = {
        log,
        focus: document.activeElement?.id,
        retained: document.getElementById('inside') !== null,
      };
      console.log(JSON.stringify({ framework: source ? 'Original' : 'native', ...vector }));
      expect(vector).toEqual({ log: ['new'], focus: 'new-target', retained: false });
    } finally {
      await stop();
      await settle();
      target.remove();
    }
  });
