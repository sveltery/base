// Supplemental actual Base UI v1.8.0 reference, not complete upstream leaf ports.
import { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';
export function mountModalIsolationReference(node: HTMLElement, scenario: string) {
  function Fixture() {
    const [open, setOpen] = useState(false);
    const [secondOpen, setSecondOpen] = useState(false);
    const [visible, setVisible] = useState(true);
    const [popupVisible, setPopupVisible] = useState(true);
    const [modal, setModal] = useState<boolean | 'trap-focus'>(true);
    function second() {
      return h(
        Dialog.Root,
        { open: secondOpen, onOpenChange: setSecondOpen },
        h(Dialog.Trigger, null, 'Open second'),
        h(
          Dialog.Portal,
          { container: scenario === 'nested-body' ? node.ownerDocument.body : undefined },
          h(
            Dialog.Popup,
            { ...{ 'data-testid': 'second' }, style: { position: 'relative', zIndex: 2 } },
            h(Dialog.Title, null, 'Second dialog'),
            h(Dialog.Close, null, 'Close second'),
          ),
        ),
      );
    }
    return h(
      'main',
      {
        'data-hydrated': 'true',
        ref: (element) => {
          if (!element) return;
          const host = element as HTMLElement & { isolationCommand?: (command: string) => void };
          host.isolationCommand = (command) => {
            if (command === 'open') setOpen(true);
            if (command === 'second') setSecondOpen(true);
            if (command === 'close') setOpen(false);
            if (command === 'close-second') setSecondOpen(false);
            if (command === 'remove') setVisible(false);
            if (command === 'remove-popup') setPopupVisible(false);
            if (command === 'false') setModal(false);
            if (command === 'trap-focus') setModal('trap-focus');
            if (command === 'true') setModal(true);
          };
          return () => {
            delete host.isolationCommand;
          };
        },
      },
      h(
        'div',
        { 'data-testid': 'outside-wrapper' },
        h('button', null, 'Outside'),
        h('div', { 'data-testid': 'owned-hidden', 'aria-hidden': 'true' }, 'Hidden before open'),
        h('div', { 'data-testid': 'owned-false', 'aria-hidden': 'false' }, 'Initially exposed'),
        h(
          'div',
          {
            'data-testid': 'owned-empty',
            ref: (element) => {
              element?.setAttribute('aria-hidden', '');
            },
          },
          'Existing empty value',
        ),
        h('div', { 'data-testid': 'owned-inert', inert: true }, 'Inert before open'),
        h(
          'div',
          { 'data-testid': 'live-wrapper' },
          h('div', { 'data-testid': 'live', 'aria-live': 'polite' }, 'Announcement'),
          h('button', null, 'Live sibling'),
        ),
      ),
      h(
        Dialog.Root,
        { open, modal, onOpenChange: setOpen },
        h(Dialog.Trigger, null, 'Open first'),
        visible
          ? h(
              Dialog.Portal,
              null,
              popupVisible
                ? h(
                    Dialog.Popup,
                    { ...{ 'data-testid': 'first' }, style: { position: 'relative', zIndex: 1 } },
                    h(Dialog.Title, null, 'First dialog'),
                    h(Dialog.Close, null, 'Close first'),
                    scenario !== 'sibling' ? second() : null,
                  )
                : null,
            )
          : null,
      ),
      scenario === 'sibling' ? second() : null,
    );
  }
  const root = createRoot(node);
  root.render(h(Fixture));
  return () => root.unmount();
}
