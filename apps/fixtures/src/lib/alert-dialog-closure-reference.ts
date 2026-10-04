// Actual Base UI 1.8 public Dialog/AlertDialog/ShadowRoot counterpart (MIT).
import { createElement as h, StrictMode, useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';
import { AlertDialog } from '@base-ui/react/alert-dialog';
export function mountAlertDialogClosureReference(target: HTMLElement, variant: 'dialog-parent' | 'alert-parent' | 'shadow') {
  const Outer = variant === 'dialog-parent' ? Dialog : AlertDialog;
  const Inner = variant === 'dialog-parent' ? AlertDialog : Dialog;
  function Fixture() {
    const [container, setContainer] = useState<ShadowRoot | null>(null);
    const [visible, setVisible] = useState(true);
    const hostRef = useCallback((node: HTMLElement | null) => { if (node) setContainer(node.shadowRoot ?? node.attachShadow({ mode: 'open' })); }, []);
    return h('main', { 'data-hydrated': variant !== 'shadow' || !!container, ref: (node: HTMLElement | null) => { if (node) Object.assign(node, { removeAlertClosure: () => setVisible(false) }); } },
      h('button', { type: 'button', id: 'closure-outside' }, 'Outside'), variant === 'shadow' ? h('div', { id: 'closure-shadow', ref: hostRef }) : null,
      visible ? h(Outer.Root, null, h(Outer.Trigger, { id: 'closure-outer-trigger' }, 'Open outer'),
        h(Outer.Portal, { container: variant === 'shadow' ? container : undefined },
          h(Outer.Backdrop, { id: 'closure-backdrop', ...{ 'data-testid': 'closure-backdrop' } }),
          h(Outer.Viewport, { id: 'closure-viewport', ...{ 'data-testid': 'closure-viewport' } },
            h(Outer.Popup, { id: 'closure-parent', ...{ 'data-testid': 'closure-parent' } },
              h(Outer.Title, null, 'Outer confirmation'), h(Outer.Description, null, 'Closure parent'),
              variant !== 'shadow' ? h(Inner.Root, null, h(Inner.Trigger, null, 'Open inner'), h(Inner.Portal, null, h(Inner.Backdrop),
                h(Inner.Popup, { id: 'closure-inner', ...{ 'data-testid': 'closure-inner' } }, h(Inner.Title, null, 'Inner confirmation'), h(Inner.Close, null, 'Close inner')))) : null,
              h(Outer.Close, { id: 'closure-outer-close' }, 'Close outer'))))) : null);
  }
  const root = createRoot(target); root.render(h(StrictMode, null, h(Fixture))); return () => root.unmount();
}
