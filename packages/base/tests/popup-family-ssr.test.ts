import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import Fixture from './dom/PopupFamilyFixture.svelte';
for (const family of ['popover', 'preview-card', 'tooltip'] as const)
  for (const defaultOpen of [false, true])
    it(`${family} SSR preserves trigger hosts without browser portal markup (${defaultOpen})`, () => {
      const { body } = render(Fixture, { props: { family, defaultOpen, keepMounted: true } });
      expect(body).toContain('id="opener"');
      expect(body).toContain('id="second"');
      expect(body).not.toContain('data-testid="popup"');
      expect(body).not.toContain('data-base-ui-focus-guard');
      if (family === 'preview-card') expect(body).toContain('href="#popup"');
    });
