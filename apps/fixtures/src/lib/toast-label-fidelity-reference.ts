// Supplemental fixture using the pinned Original Toast components; MIT: parity/toast/UPSTREAM_LICENSE.
import { createElement as h, Fragment, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Toast } from '@base-ui/react/toast';

export function mountToastLabelFidelityReference(node: HTMLElement, scenario: string) {
  const sameId = scenario !== 'label-fidelity-distinct';
  const customRender = scenario === 'label-fidelity-render';
  function Fixture() {
    const [old, setOld] = useState(true);
    const [newer, setNewer] = useState(false);
    const [oldContent, setOldContent] = useState<string | number | boolean | null>('Old label');
    const [newContent, setNewContent] = useState<string | number | boolean | null>('New label');
    const [rendered, setRendered] = useState(true);
    return h(
      'main',
      { 'data-hydrated': 'true' },
      h(
        Toast.Provider,
        { timeout: 0 },
        h(
          Toast.Viewport,
          null,
          h(
            Toast.Root,
            {
              toast: { id: 'labels', title: 'Fallback title', description: 'Fallback description' },
              swipeDirection: [],
              'data-testid': 'label-root',
            },
            old
              ? h(
                  Fragment,
                  null,
                  h(
                    Toast.Title,
                    {
                      id: sameId ? 'shared-title' : 'old-title',
                      'data-testid': 'old-title',
                      render: customRender
                        ? (props) => (rendered ? h('h3', props) : null)
                        : undefined,
                    },
                    oldContent,
                  ),
                  h(
                    Toast.Description,
                    {
                      id: sameId ? 'shared-description' : 'old-description',
                      'data-testid': 'old-description',
                      render: customRender
                        ? (props) => (rendered ? h('section', props) : null)
                        : undefined,
                    },
                    oldContent,
                  ),
                )
              : null,
            newer
              ? h(
                  Fragment,
                  null,
                  h(
                    Toast.Title,
                    { id: sameId ? 'shared-title' : 'new-title', 'data-testid': 'new-title' },
                    newContent,
                  ),
                  h(
                    Toast.Description,
                    {
                      id: sameId ? 'shared-description' : 'new-description',
                      'data-testid': 'new-description',
                    },
                    newContent,
                  ),
                )
              : null,
          ),
        ),
      ),
      h('button', { onClick: () => setNewer(true) }, 'show newer'),
      h('button', { onClick: () => setOld(false) }, 'remove older'),
      h('button', { onClick: () => setOld(true) }, 'restore older'),
      h('button', { onClick: () => setNewContent('Changed visible text') }, 'change newer text'),
      h('button', { onClick: () => setNewContent('') }, 'empty newer'),
      h('button', { onClick: () => setNewContent(0) }, 'zero newer'),
      h('button', { onClick: () => setRendered(false) }, 'hide custom host'),
      h('button', { onClick: () => setRendered(true) }, 'show custom host'),
      h('button', { onClick: () => setOldContent(false) }, 'false older'),
      h('button', { onClick: () => setOldContent(null) }, 'fallback older'),
    );
  }
  const root = createRoot(node);
  root.render(h(Fixture));
  return () => root.unmount();
}
