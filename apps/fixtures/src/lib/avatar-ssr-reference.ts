// SSR hydration assertions from Base UI 47b40521; MIT: parity/avatar/UPSTREAM_LICENSE.
import { createElement as h, useLayoutEffect, useState } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Avatar } from '@base-ui/react/avatar';
import { avatarDataUri } from './avatar-harness.js';
export function AvatarSsrReference({ keepMounted = false }: { keepMounted?: boolean }) {
  const [hydrated, setHydrated] = useState(false);
  useLayoutEffect(() => {
    setHydrated(true);
  }, []);
  return h(
    'main',
    { 'data-hydrated': hydrated },
    h(
      Avatar.Root,
      { id: 'ssr-avatar', ...{ 'data-testid': 'root' } },
      h(Avatar.Image, {
        ...{ 'data-testid': 'image' },
        keepMounted,
        src: avatarDataUri,
        alt: 'Jane Doe',
        onLoadingStatusChange: (status) => window.avatarHarness.statuses.push(status),
      }),
      h(Avatar.Fallback, { id: 'ssr-avatar-fallback', ...{ 'data-testid': 'fallback' } }, 'JD'),
    ),
  );
}
export function hydrateAvatarReference(node: HTMLElement, keepMounted: boolean) {
  let root: ReturnType<typeof hydrateRoot> | undefined;
  flushSync(() => {
    root = hydrateRoot(node, h(AvatarSsrReference, { keepMounted }));
  });
  return () => root?.unmount();
}
