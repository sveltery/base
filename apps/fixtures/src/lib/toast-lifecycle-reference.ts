// Supplemental lifecycle comparisons against pinned Base UI 1.8.0; no declaration credit.
import { createElement as h, Fragment, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Toast } from '@base-ui/react/toast';

export function mountToastLifecycleReference(node: HTMLElement, scenario: string) {
  const external = Toast.createToastManager();
  const testId = (value: string) => ({ 'data-testid': value });
  function Contents() {
    const facade = Toast.useToastManager();
    const main = useRef<HTMLElement>(null);
    const [showViewport, setShowViewport] = useState(true);
    const [viewportKey, setViewportKey] = useState(0);
    const [noExitAnimation, setNoExitAnimation] = useState(false);
    const [closed, setClosed] = useState<string[]>([]);
    const [synchronous, setSynchronous] = useState('');
    const [replacements, setReplacements] = useState(false);
    function add(id: string, title: string, timeout = 0, callback?: () => void) {
      facade.add({
        id,
        title,
        timeout,
        onClose: () => {
          callback?.();
          setClosed((previous) => [...previous, id]);
        },
      });
    }
    useLayoutEffect(() => {
      const host = main.current as HTMLElement & {
        closeToastNow?: (channel: string, id?: string) => void;
      };
      host.closeToastNow = (channel, id) => {
        (channel === 'manager' ? external : facade).close(id);
        setSynchronous(host.ownerDocument.activeElement?.id || 'BODY');
      };
      return () => {
        delete host.closeToastNow;
      };
    }, [facade]);
    return h(
      'section',
      {
        ref: main,
        'data-testid': 'lifecycle',
        'data-no-exit-animation': noExitAnimation ? '' : undefined,
        className: 'react-lifecycle',
      },
      h(
        'style',
        null,
        '.react-lifecycle [data-ending-style]{animation:reference-toast-exit 10s linear}.react-lifecycle[data-no-exit-animation] [data-ending-style]{animation:none}@keyframes reference-toast-exit{from{opacity:1}to{opacity:0}}',
      ),
      h('button', { id: 'outside' }, 'outside'),
      h('button', { onClick: () => setNoExitAnimation(true) }, 'disable exit animation'),
      h(
        'button',
        {
          onClick: () => {
            add('a', 'A');
            add('b', 'B');
            add('c', 'C');
          },
        },
        'add three',
      ),
      h('button', { onClick: () => add('save', 'Saving…') }, 'add save'),
      h(
        'button',
        {
          onClick: () =>
            facade.update('save', {
              title:
                'A notification with updated text that wraps across several lines in a narrow toast Root. '.repeat(
                  3,
                ),
            }),
        },
        'update save layout',
      ),
      h(
        'button',
        {
          onClick: () => {
            add('a', 'Oldest');
            add('b', 'Focused');
            add('c', 'Middle');
            add('d', 'Newest', 0, () => facade.close('b'));
          },
        },
        'add nested focused close',
      ),
      h(
        'button',
        {
          onClick: () => {
            setReplacements(true);
            facade.add({
              id: 'callback',
              title: 'Old',
              timeout: 0,
              actionProps: { children: 'Act' },
              onClose: () => {
                facade.add({ id: 'callback', title: 'Fresh', timeout: 50, priority: 'high' });
                flushSync(() => {});
              },
            });
          },
        },
        'add descendant replacement',
      ),
      h('button', { onClick: () => add('timer', 'Timer', 50) }, 'add timer'),
      h(
        'button',
        {
          onClick: () => main.current?.querySelector<HTMLElement>('[data-testid=viewport]')?.blur(),
        },
        'blur viewport',
      ),
      h(
        'button',
        {
          onClick: () => {
            main.current?.querySelector<HTMLElement>('[data-testid=viewport]')?.blur();
            setShowViewport(false);
          },
        },
        'blur and hide viewport',
      ),
      h(
        'button',
        {
          onClick: () => {
            const viewport = main.current?.querySelector<HTMLElement>('[data-testid=viewport]');
            viewport?.blur();
            flushSync(() => {});
            viewport?.querySelector<HTMLElement>('[data-testid=root]')?.focus();
          },
        },
        'blur then focus root',
      ),
      h(
        'button',
        {
          onClick: () => {
            main.current?.querySelector<HTMLElement>('[data-testid=viewport]')?.blur();
            flushSync(() => setViewportKey((value) => value + 1));
            main.current?.querySelector<HTMLElement>('[data-testid=viewport]')?.focus();
          },
        },
        'blur and replace viewport',
      ),
      h('button', { onClick: () => setShowViewport(false) }, 'hide viewport'),
      h('button', { onClick: () => setShowViewport(true) }, 'show viewport'),
      showViewport
        ? h(
            Toast.Viewport,
            {
              key: viewportKey,
              ...testId('viewport'),
              style: { display: 'flex', flexDirection: 'column', width: 320 },
            },
            facade.toasts.map((toast, index) =>
              h(
                Toast.Root,
                {
                  key: scenario === 'lifecycle-index' ? index : toast.id,
                  toast,
                  swipeDirection: [],
                  id: `root-${toast.id}`,
                  ...testId('root'),
                  style: {
                    width: scenario === 'lifecycle-geometry' ? 180 : undefined,
                    padding: 8,
                    border: '1px solid #999',
                  },
                },
                h(Toast.Title),
                replacements
                  ? h(Toast.Action, { ...testId('action'), id: 'action-callback' })
                  : null,
                h(Toast.Close, { 'aria-label': `close ${toast.id}` }),
              ),
            ),
          )
        : null,
      h('output', { 'data-testid': 'synchronous-focus' }, synchronous),
      h('output', { 'data-testid': 'close-observations' }, JSON.stringify(closed)),
    );
  }
  function Fixture() {
    return h(
      'main',
      { 'data-hydrated': 'true' },
      h(
        Toast.Provider,
        { toastManager: external, timeout: 0, limit: scenario === 'lifecycle-limit' ? 1 : 3 },
        h(Contents),
      ),
    );
  }
  const root = createRoot(node);
  root.render(h(Fragment, null, h(Fixture)));
  return () => root.unmount();
}
