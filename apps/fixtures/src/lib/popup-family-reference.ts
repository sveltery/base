// Authored real Original Base UI 1.8.0 counterpart; supplement only, zero Original credit.
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Popover } from '@base-ui/react/popover';
import { PreviewCard } from '@base-ui/react/preview-card';
import { Tooltip } from '@base-ui/react/tooltip';
const h = React.createElement;
export interface PopupFamilyFixtureOptions {
  family?: 'popover' | 'preview-card' | 'tooltip'; mode?: string; defaultOpen?: boolean; keepMounted?: boolean; cancel?: string; delay?: number; closeDelay?: number; disabled?: boolean; trackCursorAxis?: 'none' | 'x' | 'y' | 'both'; modal?: boolean | 'trap-focus'; log?: (kind: string, value: unknown, reason?: string, triggerId?: string) => void;
}
const testId = (value: string): Pick<React.HTMLAttributes<HTMLElement>, 'id'> & { 'data-testid': string } => ({ 'data-testid': value });
export function mountPopupFamilyReference(target: HTMLElement, options: PopupFamilyFixtureOptions = {}) {
  const { family = 'popover', mode = 'ordinary', defaultOpen = false, keepMounted = false, cancel = '', delay = 0, closeDelay = 0, disabled = false, trackCursorAxis = 'none', modal = false, log = () => {} } = options;
  const popover = Popover.createHandle<number>();
  const previewCard = PreviewCard.createHandle<number>();
  const tooltip = Tooltip.createHandle<number>();
  const handle = family === 'popover' ? popover : family === 'preview-card' ? previewCard : tooltip;
  let actions: { close(): void; unmount(): void } | null = null;
  let controlledSetter: ((open: boolean, triggerId: string | null) => void) | undefined;
  function Fixture() {
    const [controlledOpen, setControlledOpen] = React.useState(defaultOpen);
    const [triggerId, setTriggerId] = React.useState<string | null>(null);
    const actionRef = React.useRef<{ close(): void; unmount(): void } | null>(null);
    React.useLayoutEffect(() => { actions = actionRef.current; controlledSetter = (value, id) => { setControlledOpen(value); setTriggerId(id); }; return () => { actions = null; controlledSetter = undefined; }; });
    const onOpenChange = (open: boolean, details: { reason: string; isCanceled: boolean; cancel(): void; preventUnmountOnClose(): void; trigger?: Element | undefined }) => {
      if (mode === 'retain' && !open) details.preventUnmountOnClose();
      if ((open && cancel === 'open') || (!open && cancel === 'close')) details.cancel();
      if (mode === 'controlled' && !details.isCanceled) { setControlledOpen(open); setTriggerId(details.trigger?.id ?? null); }
      log('open', open, details.reason, details.trigger?.id);
    };
    let content: React.ReactNode;
    if (family === 'popover') {
      const triggers = () => h(React.Fragment, null, h(Popover.Trigger<number>, { handle: popover, payload: 7, id: 'opener', delay, closeDelay, openOnHover: mode === 'hover', disabled }, 'Open'), h(Popover.Trigger<number>, { handle: popover, payload: 9, id: 'second', delay, closeDelay, openOnHover: mode === 'hover', disabled }, 'Second'));
      const popup = (payload?: number) => h(Popover.Portal, { keepMounted }, h(Popover.Backdrop, testId('backdrop')), h(Popover.Positioner, { ...testId('positioner'), collisionAvoidance: { side: 'none', align: 'none' } }, h(Popover.Popup, testId('popup'), h(Popover.Arrow, testId('arrow')), h(Popover.Title, { id: 'title' }, 'Popup title'), h(Popover.Description, { id: 'description' }, 'Popup description'), mode === 'viewport' ? h(Popover.Viewport, testId('viewport'), h('output', { id: 'payload' }, `Content ${payload ?? 'none'}`), h('button', { id: 'inside' }, 'Inside')) : h(React.Fragment, null, h('output', { id: 'payload' }, `Content ${payload ?? 'none'}`), h('button', { id: 'inside' }, 'Inside')), h(Popover.Close, { id: 'close' }, 'Close'))));
      content = h(React.Fragment, null, mode === 'detached' ? triggers() : null, h(Popover.Root<number>, { handle: popover, defaultOpen, defaultTriggerId: defaultOpen ? 'opener' : undefined, open: mode === 'controlled' ? controlledOpen : undefined, triggerId: mode === 'controlled' ? triggerId : undefined, actionsRef: actionRef, onOpenChange, onOpenChangeComplete: open => log('complete', open), modal, children: ({ payload }) => h(React.Fragment, null, mode !== 'detached' ? triggers() : null, popup(payload)) }));
    }
    else if (family === 'preview-card') {
      const triggers = () => h(React.Fragment, null, h(PreviewCard.Trigger<number>, { handle: previewCard, payload: 7, id: 'opener', delay, closeDelay, href: '#popup' }, 'Open'), h(PreviewCard.Trigger<number>, { handle: previewCard, payload: 9, id: 'second', delay, closeDelay, href: '#popup' }, 'Second'));
      const popup = (payload?: number) => h(PreviewCard.Portal, { keepMounted }, h(PreviewCard.Backdrop, testId('backdrop')), h(PreviewCard.Positioner, { ...testId('positioner'), collisionAvoidance: { side: 'none', align: 'none' } }, h(PreviewCard.Popup, testId('popup'), h(PreviewCard.Arrow, testId('arrow')), mode === 'viewport' ? h(PreviewCard.Viewport, testId('viewport'), h('output', { id: 'payload' }, `Content ${payload ?? 'none'}`), h('button', { id: 'inside' }, 'Inside')) : h(React.Fragment, null, h('output', { id: 'payload' }, `Content ${payload ?? 'none'}`), h('button', { id: 'inside' }, 'Inside')))));
      content = h(React.Fragment, null, mode === 'detached' ? triggers() : null, h(PreviewCard.Root<number>, { handle: previewCard, defaultOpen, defaultTriggerId: defaultOpen ? 'opener' : undefined, open: mode === 'controlled' ? controlledOpen : undefined, triggerId: mode === 'controlled' ? triggerId : undefined, actionsRef: actionRef, onOpenChange, onOpenChangeComplete: open => log('complete', open), children: ({ payload }) => h(React.Fragment, null, mode !== 'detached' ? triggers() : null, popup(payload)) }));
    }
    else if (family === 'tooltip') {
      const triggers = () => h(React.Fragment, null, h(Tooltip.Trigger<number>, { handle: tooltip, payload: 7, id: 'opener', delay, closeDelay, disabled }, 'Open'), h(Tooltip.Trigger<number>, { handle: tooltip, payload: 9, id: 'second', delay, closeDelay, disabled }, 'Second'));
      const popup = (payload?: number) => h(Tooltip.Portal, { keepMounted }, h(Tooltip.Positioner, { ...testId('positioner'), collisionAvoidance: { side: 'none', align: 'none' } }, h(Tooltip.Popup, testId('popup'), h(Tooltip.Arrow, testId('arrow')), mode === 'viewport' ? h(Tooltip.Viewport, testId('viewport'), h('output', { id: 'payload' }, `Content ${payload ?? 'none'}`), h('button', { id: 'inside' }, 'Inside')) : h(React.Fragment, null, h('output', { id: 'payload' }, `Content ${payload ?? 'none'}`), h('button', { id: 'inside' }, 'Inside')))));
      content = h(React.Fragment, null, mode === 'detached' ? triggers() : null, h(Tooltip.Root<number>, { handle: tooltip, defaultOpen, defaultTriggerId: defaultOpen ? 'opener' : undefined, open: mode === 'controlled' ? controlledOpen : undefined, triggerId: mode === 'controlled' ? triggerId : undefined, actionsRef: actionRef, onOpenChange, onOpenChangeComplete: open => log('complete', open), disabled, trackCursorAxis, children: ({ payload }) => h(React.Fragment, null, mode !== 'detached' ? triggers() : null, popup(payload)) }));
      content = h(Tooltip.Provider, { delay, closeDelay }, content);
    }
    return h(React.Fragment, null, h('button', { id: 'before' }, 'Before'), content, h('button', { id: 'outside' }, 'Outside'));
  }
  const root = createRoot(target); root.render(h(Fixture));
  return { stop: () => root.unmount(), command(value: string) {
    if (value === 'open') handle.open('opener'); if (value === 'second') handle.open('second'); if (value === 'close') actions?.close(); if (value === 'unmount') actions?.unmount();
    if (value === 'controlled-open') controlledSetter?.(true, 'opener'); if (value === 'controlled-close') controlledSetter?.(false, 'opener');
  }, snapshot() { return { isOpen: handle.isOpen, actions: !!actions }; } };
}
