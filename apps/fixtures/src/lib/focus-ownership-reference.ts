// Supplemental paired audit regressions against the real pinned Base UI v1.8.0.
import { createElement as h, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';
export function mountFocusOwnershipReference(node: HTMLElement, scenario: string) {
  function Fixture() {
    const [portalVisible, setPortalVisible] = useState(true);
    const [popupVisible, setPopupVisible] = useState(true);
    const actions = useRef<Dialog.Root.Actions>(null);
    const [requests, setRequests] = useState<
      { open: boolean; reason: string; trigger: string | null }[]
    >([]);
    const [returns, setReturns] = useState(0);
    return h(
      'main',
      {
        'data-hydrated': 'true',
        ref: (node) => {
          if (!node) return;
          const host = node as HTMLElement & {
            removeDialogPart?: () => void;
            closeDialog?: () => void;
            closeAndRemove?: () => void;
          };
          const remove = () => {
            if (scenario === 'popup-detach') setPopupVisible(false);
            else setPortalVisible(false);
          };
          host.removeDialogPart = remove;
          host.closeDialog = () => actions.current?.close();
          host.closeAndRemove = () => {
            actions.current?.close();
            remove();
          };
          return () => {
            delete host.removeDialogPart;
            delete host.closeDialog;
            delete host.closeAndRemove;
          };
        },
      },
      h('button', { id: 'outside' }, 'Outside'),
      h(
        Dialog.Root,
        {
          modal: scenario !== 'triggers' && !scenario.endsWith('external-focus'),
          disablePointerDismissal: scenario.endsWith('external-focus'),
          actionsRef: actions,
          onOpenChange: (open, details) =>
            setRequests((previous) => [
              ...previous,
              { open, reason: details.reason, trigger: details.trigger?.id ?? null },
            ]),
        },
        h(Dialog.Trigger, { id: 'focus-a' }, h('span', null, 'Trigger A')),
        h(Dialog.Trigger, { id: 'focus-b' }, h('span', null, 'Trigger B')),
        portalVisible
          ? h(
              Dialog.Portal,
              null,
              popupVisible
                ? h(
                    Dialog.Popup,
                    {
                      style: { position: 'relative', zIndex: 1 },
                      finalFocus:
                        scenario === 'external-focus' || scenario === 'default-detach'
                          ? undefined
                          : scenario === 'boolean-external-focus'
                            ? true
                            : () => {
                                setReturns((value) => value + 1);
                                if (scenario === 'final-false') return false;
                                if (scenario === 'final-none') return undefined;
                                return document.getElementById('focus-a');
                              },
                    },
                    scenario.startsWith('radio')
                      ? [
                          h('input', {
                            key: 'first',
                            id: 'radio-first',
                            'aria-label': 'First radio',
                            type: 'radio',
                            name: "choice'quoted",
                            tabIndex: scenario.endsWith('negative') ? -1 : undefined,
                            defaultChecked: scenario === 'radio' || scenario === 'radio-negative',
                          }),
                          h('input', {
                            key: 'second',
                            id: 'radio-second',
                            'aria-label': 'Second radio',
                            type: 'radio',
                            name: "choice'quoted",
                          }),
                        ]
                      : [
                          h('input', { key: 'inside', 'aria-label': 'Inside' }),
                          h(Dialog.Close, { key: 'close' }, 'Close'),
                        ],
                  )
                : null,
            )
          : null,
      ),
      h('output', { 'data-testid': 'requests' }, JSON.stringify(requests)),
      h('output', { 'data-testid': 'returns' }, returns),
    );
  }
  const root = createRoot(node);
  root.render(h(Fixture));
  return () => root.unmount();
}
