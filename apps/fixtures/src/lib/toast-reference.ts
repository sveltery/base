// Full fixture adaptations from pinned Base UI v1.8.0. MIT: parity/toast/UPSTREAM_LICENSE.
import { createElement as h, Fragment, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Toast } from '@base-ui/react/toast';
import { mountToastLifecycleReference } from './toast-lifecycle-reference.js';
import { mountToastLabelFidelityReference } from './toast-label-fidelity-reference.js';

const testId = (value: string) => ({ 'data-testid': value });

export function mountToastReference(node: HTMLElement, scenario: string) {
  if (scenario.startsWith('label-fidelity'))
    return mountToastLabelFidelityReference(node, scenario);
  if (scenario.startsWith('lifecycle')) return mountToastLifecycleReference(node, scenario);
  const external = Toast.createToastManager();
  function ProviderContents({ label, title }: { label: string; title: string }) {
    const manager = Toast.useToastManager();
    const id = useRef<string | null>(null);
    return h(
      Fragment,
      null,
      h(
        Toast.Viewport,
        null,
        manager.toasts.map((toast) =>
          h(
            Toast.Root,
            { key: toast.id, toast, swipeDirection: [] },
            h(Toast.Title, null, toast.title),
          ),
        ),
      ),
      h(
        'button',
        {
          onClick: () => {
            id.current = manager.add({ title });
          },
        },
        `add ${label}`,
      ),
      h(
        'button',
        {
          onClick: () => {
            if (id.current) manager.update(id.current, { title: `${title} updated` });
          },
        },
        `update ${label}`,
      ),
    );
  }
  function Contents({
    setTimeoutOption,
    setLimit,
  }: {
    setTimeoutOption: (value: number) => void;
    setLimit: (value: number) => void;
  }) {
    const facade = Toast.useToastManager();
    const manager = scenario.startsWith('manager-') ? external : facade;
    const [count, setCount] = useState(0);
    const [ids, setIds] = useState(['', '']);
    const [mode, setMode] = useState('fallback');
    const limited = ['limit', 'unlimit', 'limit-sync', 'limited-upsert'].includes(scenario);
    function add() {
      if (scenario === 'manager-upsert') {
        const id = manager.add({ id: 'save', title: 'Saving…', timeout: 1000 });
        setIds((previous) => [id, previous[1]]);
      } else if (limited) {
        setCount(count + 1);
        manager.add({ title: `toast-${count + 1}` });
      } else
        manager.add({
          title: scenario === 'manager-add' ? 'title' : 'test',
          ...(scenario === 'basic-parts'
            ? { description: 'description', actionProps: { children: 'action' } }
            : {}),
        });
    }
    const controls = h(
      Fragment,
      null,
      scenario !== 'labels' && scenario !== 'limited-upsert'
        ? h('button', { onClick: add }, 'add')
        : null,
      scenario === 'manager-upsert'
        ? h(
            'button',
            {
              onClick: () => {
                const id = manager.add({ id: 'save', title: 'Saved', timeout: 1000 });
                setIds((previous) => [previous[0], id]);
              },
            },
            'upsert',
          )
        : null,
      ['close', 'close-all'].includes(scenario)
        ? h(
            'button',
            {
              onClick: () => manager.close(scenario === 'close' ? facade.toasts[0]?.id : undefined),
            },
            'close',
          )
        : null,
      scenario === 'timeout-sync'
        ? h('button', { onClick: () => setTimeoutOption(1000) }, 'timeout 1000')
        : null,
      scenario === 'limit-sync'
        ? [1, 2].map((value) =>
            h('button', { key: value, onClick: () => setLimit(value) }, `limit ${value}`),
          )
        : null,
      scenario === 'limited-upsert'
        ? h(
            Fragment,
            null,
            h(
              'button',
              { onClick: () => manager.add({ id: 'save', title: 'Saving…', timeout: 0 }) },
              'add save',
            ),
            h(
              'button',
              { onClick: () => manager.add({ id: 'other', title: 'Other toast', timeout: 0 }) },
              'add other',
            ),
            h(
              'button',
              { onClick: () => manager.add({ id: 'save', title: 'Saved', timeout: 0 }) },
              'upsert save',
            ),
          )
        : null,
    );
    return h(
      Fragment,
      null,
      scenario === 'labels'
        ? ['explicit', 'none', 'restore'].map((value) =>
            h(
              'button',
              { key: value, onClick: () => setMode(value === 'restore' ? 'restored' : value) },
              value,
            ),
          )
        : null,
      h(
        Toast.Viewport,
        {
          ...testId('viewport'),
          style: { display: 'flex', flexDirection: 'column', gap: 8, width: 320 },
        },
        scenario === 'labels'
          ? h(
              Toast.Root,
              {
                toast: { id: 'test', title: 'Toast title', description: 'Toast description' },
                swipeDirection: [],
                ...testId('root'),
              },
              mode !== 'none'
                ? h(
                    Fragment,
                    null,
                    h(
                      Toast.Title,
                      { id: undefined, ...testId('title') },
                      mode === 'explicit' ? 'Explicit title' : undefined,
                    ),
                    h(
                      Toast.Description,
                      { id: undefined, ...testId('description') },
                      mode === 'explicit' ? 'Explicit description' : undefined,
                    ),
                  )
                : null,
            )
          : facade.toasts.map((toast) =>
              h(
                Toast.Root,
                {
                  key: toast.id,
                  toast,
                  swipeDirection: [],
                  ...testId(limited ? String(toast.title) : 'root'),
                  style: { padding: 8, border: '1px solid #999' },
                },
                !limited || scenario === 'limited-upsert'
                  ? h(Toast.Title, { id: undefined, ...testId('title') })
                  : null,
                !limited && !['close', 'close-all'].includes(scenario)
                  ? h(Toast.Description, { id: undefined, ...testId('description') })
                  : null,
                !['close', 'close-all', 'limited-upsert'].includes(scenario)
                  ? h(Toast.Close, {
                      ...testId(limited ? `close-${toast.title}` : 'close'),
                      'aria-label': 'close-press',
                    })
                  : null,
                !limited && !['close', 'close-all'].includes(scenario)
                  ? h(Toast.Action, { id: undefined, ...testId('action') })
                  : null,
              ),
            ),
        limited ? controls : null,
      ),
      !limited ? controls : null,
      h('output', { ...testId('ids') }, JSON.stringify(ids)),
    );
  }
  function Fixture() {
    const [timeout, setTimeoutOption] = useState(5000);
    const [limit, setLimit] = useState(
      ['limit-sync', 'limited-upsert'].includes(scenario)
        ? 1
        : ['limit', 'unlimit'].includes(scenario)
          ? 2
          : 3,
    );
    return h(
      'main',
      { 'data-hydrated': 'true', style: { padding: 24 } },
      scenario === 'isolation'
        ? h(
            Fragment,
            null,
            h(Toast.Provider, null, h(ProviderContents, { label: 'first', title: 'First toast' })),
            h(
              Toast.Provider,
              null,
              h(ProviderContents, { label: 'second', title: 'Second toast' }),
            ),
          )
        : h(
            Toast.Provider,
            {
              timeout,
              limit,
              toastManager: scenario.startsWith('manager-') ? external : undefined,
            },
            h(Contents, { setTimeoutOption, setLimit }),
          ),
    );
  }
  const root = createRoot(node);
  root.render(h(Fixture));
  return () => root.unmount();
}
