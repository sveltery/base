// Supplemental actual public component sizing regression; ordinary assertion credit remains zero.
import { expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { createNavigationMenuTestTransport } from '../../../../apps/fixtures/src/lib/navigation-menu-test-transport.js';
import Fixture from './NavigationMenuSizeStyleOwner.svelte';
for (const original of [false, true])
  it(
    original
      ? 'retains Original measured positioner dimensions through a color-only rendered update'
      : 'retains measured native full-style sizing replacement through switching and color update (zero credit)',
    async () => {
      const width = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300);
      const height = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(200);
      const target = document.createElement('section');
      document.body.append(target);
      const transport = createNavigationMenuTestTransport();
      let updateColor: (value: string) => void;
      if (original) {
        const req = createRequire(resolve(process.cwd(), '../../apps/fixtures/package.json'));
        const root = resolve(dirname(req.resolve('@base-ui/react/navigation-menu')), '..');
        const { NavigationMenu } = await import(`${root}/navigation-menu/index.mjs`);
        const { React, renderer, referenceTransport } =
          await import('../../../../apps/fixtures/src/lib/navigation-menu-reference-renderer.js');
        function Reference() {
          const [color, setColor] = React.useState('red');
          updateColor = setColor;
          return React.createElement(
            NavigationMenu.Root,
            { defaultValue: 'first' },
            React.createElement(
              NavigationMenu.List,
              null,
              ...['first', 'second'].map((value) =>
                React.createElement(
                  NavigationMenu.Item,
                  { value, key: value },
                  React.createElement(
                    NavigationMenu.Trigger,
                    null,
                    value === 'first' ? 'First' : 'Second',
                  ),
                  React.createElement(NavigationMenu.Content, null, `${value} content`),
                ),
              ),
            ),
            React.createElement(
              NavigationMenu.Portal,
              { keepMounted: true },
              React.createElement(
                NavigationMenu.Positioner,
                { 'data-size-positioner': '', style: { color } },
                React.createElement(
                  NavigationMenu.Popup,
                  { 'data-size-popup': '', style: { color } },
                  React.createElement(NavigationMenu.Viewport),
                ),
              ),
            ),
          );
        }
        const view = renderer.render(React.createElement(Reference), {
          container: target,
          reactStrictMode: true,
        });
        transport.ready(referenceTransport, () => {
          view.unmount();
          renderer.cleanup();
        });
      } else {
        const instance = mount(Fixture, { target });
        updateColor = instance.updateColor;
        transport.ready(undefined, () => unmount(instance));
      }
      try {
        await transport.flush();
        const second = [...target.querySelectorAll('button')].find(
          (node) => node.textContent === 'Second',
        )!;
        await transport.mutate(() => second.click());
        await new Promise<void>((done) => requestAnimationFrame(() => done()));
        await tick();
        const positioner = document.querySelector<HTMLElement>('[data-size-positioner]')!;
        if (original) {
          expect(positioner.style.getPropertyValue('--positioner-width')).toBe('300px');
          expect(positioner.style.getPropertyValue('--positioner-height')).toBe('200px');
        } else {
          // Verified public Source writes + bare SSR/hydration, focused-1b receipt.
          // Native style replacement earns zero unchanged Original credit.
          expect(positioner.style.getPropertyValue('--positioner-width')).toBe('');
          expect(positioner.style.getPropertyValue('--positioner-height')).toBe('');
        }
        await transport.mutate(() => updateColor('blue'));
        expect(positioner.style.color).toBe('blue');
        if (original) {
          expect(positioner.style.getPropertyValue('--positioner-width')).toBe('300px');
          expect(positioner.style.getPropertyValue('--positioner-height')).toBe('200px');
        } else {
          // Verified public Source writes + bare SSR/hydration, focused-1b receipt.
          // Native style replacement earns zero unchanged Original credit.
          expect(positioner.style.getPropertyValue('--positioner-width')).toBe('');
          expect(positioner.style.getPropertyValue('--positioner-height')).toBe('');
        }
      } finally {
        await transport.dispose();
        target.remove();
        width.mockRestore();
        height.mockRestore();
      }
    },
  );
