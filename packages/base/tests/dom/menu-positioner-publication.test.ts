// Supplemental public native publication/parent-subscription lifetime; zero Original credit.
import { expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './fixtures/MenuPositionerPublication.svelte';

for (const control of [true, false])
  it(`${control ? 'native binding control' : 'public Menu'} keeps an imperative handle read out of host publication tracking`, async () => {
    const target = document.createElement('section');
    document.body.append(target);
    const publications: { node: HTMLElement | null; open: boolean }[] = [];
    const component = mount(Fixture, { target, props: { publications, control } });
    let stopped = false;
    try {
      await tick();
      const first = component.snapshot().positioner;
      expect(first).toBeInstanceOf(HTMLElement);
      expect(publications).toEqual([{ node: first, open: true }]);

      component.setOpen(false);
      await tick();
      expect(component.snapshot()).toEqual({ positioner: first, open: false });
      expect(publications).toEqual([{ node: first, open: true }]);
      expect(target.querySelector('#publication-trigger')?.getAttribute('aria-expanded')).toBe(
        'false',
      );

      component.setOpen(true);
      component.updateOptions();
      await tick();
      expect(component.snapshot()).toEqual({ positioner: first, open: true });
      expect(publications).toEqual([{ node: first, open: true }]);
      expect(target.querySelector('#publication-trigger')?.getAttribute('aria-expanded')).toBe(
        'true',
      );

      component.replaceHost();
      await tick();
      const replacement = component.snapshot().positioner;
      expect(replacement).toBeInstanceOf(HTMLElement);
      expect(replacement).not.toBe(first);
      expect(first!.isConnected).toBe(false);
      expect(publications).toEqual([
        { node: first, open: true },
        { node: null, open: true },
        { node: replacement, open: true },
      ]);

      await unmount(component);
      stopped = true;
      expect(publications.map(({ node }) => node)).toEqual([first, null, replacement, null]);
      expect(replacement!.isConnected).toBe(false);
    } finally {
      if (!stopped) await unmount(component);
      target.remove();
    }
  });
