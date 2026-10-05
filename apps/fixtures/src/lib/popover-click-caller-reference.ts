// Actual pinned Base UI1.8.0 real Popover caller, React19.2.8; zero ordinary credit.
import * as React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Popover } from '@base-ui/react/popover';
const h = React.createElement;
const testId = (value: string): Pick<React.HTMLAttributes<HTMLDivElement>, 'id'> & { 'data-testid': string } => ({ 'data-testid': value });
export function mountPopoverClickCallerReference(target: HTMLElement) {
  const first = Popover.createHandle();
  const second = Popover.createHandle();
  const changes: { owner: string; open: boolean }[] = [];
  function Fixture() {
    const [selected, setSelected] = React.useState(first);
    const popup = (handle: typeof first, owner: string) => h(Popover.Root, { handle, onOpenChange: open => { changes.push({ owner, open }); } },
      h(Popover.Portal, null, h(Popover.Positioner, null, h(Popover.Popup, testId(`${owner}-popup`), `${owner} owner`))));
    return h(React.Fragment, null,
      h(Popover.Trigger, { handle: selected, id: 'caller-trigger', onClick: () => flushSync(() => setSelected(second)) }, 'Switch handle during click'),
      popup(first, 'first'), popup(second, 'second'));
  }
  const root = createRoot(target);
  flushSync(() => root.render(h(Fixture)));
  return { snapshot: () => changes, stop: () => root.unmount() };
}
