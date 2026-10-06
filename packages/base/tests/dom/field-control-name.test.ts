import { expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './FieldControlNameFixture.svelte';

for (const provided of [false, true])
  it(`native name projection preserves logical errors and registry (provider=${provided})`, async () => {
    const target = document.createElement('section');
    document.body.append(target);
    const component = mount(Fixture, { target, props: { provided } });
    try {
      await tick();
      const input = target.querySelector('input')!;
      const form = target.querySelector('form')!;
      expect(input.name).toBe(provided ? 'serialized' : 'logical');
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(target.querySelector('label')!.htmlFor).toBe(input.id);
      input.value = 'edited';
      input.dispatchEvent(new InputEvent('input', { bubbles: true }));
      await tick();
      expect(input.hasAttribute('aria-invalid')).toBe(false);
      expect(target.querySelector('[data-invalid]')).toBeNull();
      form.requestSubmit();
      await tick();
      expect(JSON.parse(target.querySelector('output')!.textContent!)).toEqual({
        logical: 'edited',
      });
      expect(new FormData(form).get(provided ? 'serialized' : 'logical')).toBe('edited');
      component.rename('renamed');
      await tick();
      expect(input.name).toBe(provided ? 'renamed' : 'logical');
      component.rename('');
      await tick();
      expect(input.name).toBe(provided ? '' : 'logical');
      component.rename(undefined);
      await tick();
      expect(input.name).toBe('logical');
      form.reset();
      await tick();
      expect(input.value).toBe('seed');
      expect(input.name).toBe('logical');
    } finally {
      await unmount(component);
      target.remove();
    }
  });
