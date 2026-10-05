// Actual pinned React Dialog counterpart. MIT: parity/dialog/UPSTREAM_LICENSE.
import { createElement as h, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';

export function mountDialogSourceBusinessReference(target: HTMLElement, log: (channel: string, open?: boolean) => void, keep = false, defer = false) {
  let changeModal: (modal: boolean | 'trap-focus') => void = () => {};
  let unmountPopup = () => {};
  function Fixture() {
    const [modal, setModal] = useState<boolean | 'trap-focus'>(true);
    const actions = useRef<Dialog.Root.Actions | null>(null);
    changeModal = setModal;
    unmountPopup = () => actions.current?.unmount();
    return h(Dialog.Root, { modal, actionsRef: actions, onOpenChange: (open, details) => { log('consumer', open); if (defer && !open) details.preventUnmountOnClose(); }, onOpenChangeComplete: open => log('complete', open) },
      h(Dialog.Trigger, { id: 'opener' }, 'Open'),
      h(Dialog.Portal, { keepMounted: keep },
        h(Dialog.Popup, null, h(Dialog.Close, { id: 'closer' }, 'Close'))));
  }
  const root = createRoot(target);
  root.render(h(Fixture));
  return { stop: () => root.unmount(), setModal: (modal: boolean | 'trap-focus') => changeModal(modal), unmountPopup: () => unmountPopup() };
}

export function mountDialogSourcePayloadReference(target: HTMLElement) {
  const handle = Dialog.createHandle<number>();
  const root = createRoot(target);
  root.render(h('div', null,
    h(Dialog.Trigger, { handle, id: 'parts-trigger', payload: 7 }, 'Open'),
    h(Dialog.Root<number>, { handle, modal: false, children: ({ payload }: { payload: number | undefined }) => h(Dialog.Portal, null,
      h(Dialog.Popup, null, h('output', null, payload), h(Dialog.Close, { id: 'parts-close' }, 'Close'))) })));
  return { handle, stop: () => root.unmount() };
}
