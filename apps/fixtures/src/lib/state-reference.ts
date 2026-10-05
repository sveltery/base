// Base UI v1.8.0 R:239/431 and C:25/55/89/118/137. MIT: parity/dialog/UPSTREAM_LICENSE.
import { createElement as h, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';

export function mountStateReference(node: HTMLElement, scenario: string) {
  function Fixture() {
    const [secondTrigger, setSecondTrigger] = useState(false);
    const actions = useRef<Dialog.Root.Actions>(null);
    const [calls, setCalls] = useState<{ open: boolean; reason: string; trigger: string | null; triggerIsUndefined: boolean }[]>([]);
    const [clicks, setClicks] = useState(0);
    const [owner, setOwner] = useState(false);
    const [controlled, setControlled] = useState(true);
    const [cancel, setCancel] = useState(false);
    const [order, setOrder] = useState<object[]>([]);
    return h('main', { 'data-hydrated': 'true', ref: node => {
      if (!node) return;
      const host = node as HTMLElement & { closeDialog?: () => void; controlOwner?: (name: string) => void };
      host.closeDialog = () => actions.current?.close();
      host.controlOwner = name => {
        if (name === 'Owner open') setOwner(true);
        else if (name === 'Owner close') setOwner(false);
        else if (name === 'Toggle cancel') setCancel(value => !value);
        else if (name === 'Release control') setControlled(false);
        else throw new Error(`Unknown owner control: ${name}`);
      };
      return () => { delete host.closeDialog; delete host.controlOwner; };
    } },
      h(Dialog.Root, {
        modal: ['native', 'custom', 'undefined'].includes(scenario),
        defaultOpen: scenario === 'missing' || scenario === 'prevent',
        defaultTriggerId: scenario === 'missing' ? 'missing-trigger' : undefined,
        open: scenario === 'closed' ? false : scenario === 'controlled' && controlled ? owner : undefined,
        actionsRef: actions,
        onOpenChange: (open, details) => {
          if (cancel) details.cancel();
          setCalls(previous => [...previous, { open, reason: details.reason, trigger: details.trigger?.id ?? null, triggerIsUndefined: details.trigger === undefined }]);
          if (scenario === 'controlled') setOrder(previous => [...previous, { channel: 'consumer', open, before: document.getElementById('state-trigger')?.getAttribute('aria-expanded') ?? null, reason: details.reason, canceled: details.isCanceled }]);
        },
      },
      scenario === 'ownership' ? h(Dialog.Trigger, { id: 'trigger-1' }, 'Trigger 1') : !['missing', 'prevent', 'closed'].includes(scenario) ? h(Dialog.Trigger, { id: 'state-trigger' }, 'Open') : null,
      scenario === 'ownership' && secondTrigger ? h(Dialog.Trigger, { id: 'trigger-2' }, 'Trigger 2') : null,
      h(Dialog.Portal, { keepMounted: scenario === 'closed' },
        h(Dialog.Popup, { style: { position: 'relative', zIndex: 1 } },
          scenario === 'ownership' ? h('button', { onClick: () => setSecondTrigger(true) }, 'Mount trigger 2') :
          scenario === 'missing' ? 'Dialog' :
          h(Dialog.Close, {
            disabled: scenario === 'native' || scenario === 'custom',
            nativeButton: scenario !== 'custom',
            render: scenario === 'custom' ? h('span') : undefined,
            onClick: scenario === 'undefined' ? undefined : event => {
              if (scenario === 'prevent') event.preventBaseUIHandler();
              if (scenario === 'closed') setClicks(value => value + 1);
            },
          }, 'Close')))),
      h('output', { 'data-testid': 'calls' }, JSON.stringify(calls)),
      h('output', { 'data-testid': 'clicks' }, clicks),
      h('output', { 'data-testid': 'owner' }, String(owner)),
      h('output', { 'data-testid': 'order' }, JSON.stringify(order)));
  }
  const root = createRoot(node);
  root.render(h(Fixture));
  return () => root.unmount();
}
