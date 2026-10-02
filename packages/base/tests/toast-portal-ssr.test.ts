import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import * as Toast from '../src/lib/toast/index.js';
import Fixture from './ssr/ToastPortal.svelte';
it('standalone Toast.Portal emits no server DOM or children across independent SSR requests', () => {
  expect(typeof Toast.Portal).toBe('function');
  for (const container of [undefined, null, { current: null }]) {
    for (let request = 0; request < 2; request += 1) {
      const body = render(Fixture, { props: { container } }).body;
      expect(body).not.toContain('data-base-ui-portal');
      expect(body).not.toContain('portal-child');
      expect(body).not.toContain('Portal child');
    }
  }
});
