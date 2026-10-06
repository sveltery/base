// Supplemental server contracts for Base UI Avatar v1.8.0; MIT.
// Hydration ordinary declarations are exercised separately in DOM and paired Chromium.
import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import { JSDOM } from 'jsdom';
import Fixture from './dom/avatar-fixture.svelte';
import { Avatar } from '../src/lib/avatar/index.js';
it('SSR default mode omits Image and renders Fallback without browser globals', () => {
  expect(typeof window).toBe('undefined');
  expect(typeof document).toBe('undefined');
  const changed: string[] = [];
  const { body } = render(Fixture, {
    props: {
      imageProps: {
        src: 'avatar.png',
        alt: 'Jane Doe',
        onLoadingStatusChange: (status) => {
          changed.push(status);
        },
      },
    },
  });
  expect(body).not.toContain('<img');
  expect(new JSDOM(body).window.document.querySelector('[data-testid=fallback]')!.textContent).toBe(
    'JD',
  );
  expect(changed).toEqual([]);
});
it('SSR keepMounted renders the native request with aria-hidden while Fallback names the avatar', () => {
  const { body } = render(Fixture, {
    props: {
      imageProps: {
        keepMounted: true,
        src: 'avatar.png',
        srcset: 'avatar.png 1x',
        sizes: '48px',
        loading: 'lazy',
        alt: 'Jane Doe',
      },
    },
  });
  expect(body).toContain('<img');
  expect(body).toContain('src="avatar.png"');
  expect(body).toContain('srcset="avatar.png 1x"');
  expect(body).toContain('sizes="48px"');
  expect(body).toContain('loading="lazy"');
  expect(body).toContain('aria-hidden="true"');
  expect(new JSDOM(body).window.document.querySelector('[data-testid=fallback]')!.textContent).toBe(
    'JD',
  );
  expect(body).not.toContain('data-starting-style');
});
it('SSR respects explicit aria-hidden and fallback delay without starting timers', () => {
  const { body } = render(Fixture, {
    props: {
      imageProps: { keepMounted: true, src: 'avatar.png', 'aria-hidden': false },
      fallbackProps: { delay: 100 },
    },
  });
  expect(body).toContain('aria-hidden="false"');
  expect(new JSDOM(body).window.document.querySelector('[data-testid=fallback]')).toBe(null);
});
for (const [name, Component] of Object.entries({ Image: Avatar.Image, Fallback: Avatar.Fallback }))
  it(`SSR ${name} requires Avatar context`, () => {
    expect(() => render(Component).body).toThrow('AvatarRootContext is missing');
  });
