// Actual pinned implementation and private event channel; complete Root helper topology.
// Relative imports keep the source namespace and private RootContext in the same ESM family.
// MIT: parity/dialog/UPSTREAM_LICENSE; immutable47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
import { createElement as h, Fragment, StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from '../../node_modules/@base-ui/react/dialog/index.mjs';
import { useDialogRootContext } from '../../node_modules/@base-ui/react/dialog/root/DialogRootContext.mjs';
import type { RootFixtureApi, RootVariant } from './dialog-root-cases.js';
function Spy({ observe }: { observe: (details: { open: boolean; reason: string }) => void }) {
  const store = useDialogRootContext();
  const context = store.useState('floatingRootContext');
  useEffect(() => {
    context.context.events.on('openchange', observe);
    return () => {
      context.context.events.off('openchange', observe);
    };
  }, [context, observe]);
  return null;
}
function Labels() {
  const [phase, setPhase] = useState(0);
  return h(
    Fragment,
    null,
    phase < 2 ? h(Dialog.Title, { key: `title-${phase}` }, `Title ${phase + 1}`) : null,
    phase < 2
      ? h(Dialog.Description, { key: `description-${phase}` }, `Description ${phase + 1}`)
      : null,
    h('button', { type: 'button', onClick: () => setPhase((value) => value + 1) }, 'Change labels'),
  );
}
export function mountRootHandlesReference(node: HTMLElement, line: number, variant: RootVariant) {
  (
    globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED: boolean }
  ).BASE_UI_ANIMATIONS_DISABLED = true;
  function App() {
    const [handle] = useState(() => Dialog.createHandle());
    const [api] = useState<RootFixtureApi>(() => ({ calls: [], events: [], completions: [] }));
    const [open, setOpen] = useState(line === 1319);
    const controlled = [306, 333, 1319, 1399].includes(line);
    const trigger = () =>
      h(
        Dialog.Trigger,
        {
          children: undefined,
          handle: variant === 'contained' ? undefined : handle,
          ...{ 'data-testid': 'trigger' },
        },
        'Open',
      );
    return h(
      'main',
      {
        'data-hydrated': 'true',
        ref: (host: HTMLElement | null) => {
          if (host) Object.assign(host, { api });
        },
      },
      line === 1319 || line === 1399
        ? h(
            'button',
            { type: 'button', onClick: () => setOpen(line === 1399) },
            line === 1319 ? 'Close externally' : 'Open externally',
          )
        : null,
      variant !== 'contained' ? trigger() : null,
      variant === 'multiple'
        ? h(
            Dialog.Trigger,
            { children: undefined, handle, ...{ 'data-testid': 'trigger-2' } },
            'Open another',
          )
        : null,
      h(
        Dialog.Root,
        {
          handle: variant === 'contained' ? undefined : handle,
          defaultOpen: [459, 472, 485, 555, 582].includes(line),
          open: controlled ? ([306, 333].includes(line) ? true : open) : undefined,
          modal: [280, 306, 333, 485].includes(line) ? false : true,
          onOpenChange(value, details) {
            api.calls.push({
              open: value,
              reason: details.reason,
              hasTrigger: details.trigger !== undefined,
            });
            if ((line === 535 && value) || (line === 582 && !value)) details.cancel();
          },
          onOpenChangeComplete: (value) => api.completions.push(value),
        },
        variant === 'contained' ? trigger() : null,
        h(
          Dialog.Portal,
          null,
          line === 306
            ? h(Dialog.Backdrop, {
                children: undefined,
                style: { position: 'fixed', zIndex: 10, inset: 0 },
                ...{ 'data-testid': 'backdrop' },
              })
            : null,
          h(
            Dialog.Popup,
            {
              children: undefined,
              style: { position: 'fixed', zIndex: 10 },
              ...{ 'data-testid': 'dialog-popup' },
            },
            line === 306
              ? h(
                  Fragment,
                  null,
                  h(Dialog.Title, null, 'title text'),
                  h(Dialog.Description, null, 'description text'),
                )
              : line === 333
                ? h(Labels)
                : h(
                    Fragment,
                    null,
                    line === 555 || line === 582
                      ? h(Spy, { observe: (details) => api.events.push(details) })
                      : null,
                    h('p', null, 'Dialog content'),
                    h(Dialog.Close, null, 'Close'),
                  ),
          ),
        ),
      ),
    );
  }
  // The pin's @mui/internal-test-utils createRenderer defaults strict/strictEffects to true.
  const root = createRoot(node);
  root.render(h(StrictMode, null, h(App)));
  return () => root.unmount();
}
