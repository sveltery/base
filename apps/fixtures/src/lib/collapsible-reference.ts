// Pinned Base UI v1.8.0 fixtures. MIT: parity/collapsible/UPSTREAM_LICENSE.
import { createElement as h, useState, useEffect, useLayoutEffect, forwardRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Collapsible } from '@base-ui/react/collapsible';
import { collapsibleConfig, collapsibleCss } from './collapsible-config.js';
export function mountCollapsibleReference(node: HTMLElement, scenario: string) {
  const config = collapsibleConfig(scenario);
  const statuses: string[] = [];
  function ResolveOnClose({ open }: { open: boolean }) { useLayoutEffect(() => { const browser = window as Window & { race?: Animation; raceStarted?: boolean }; if (!open && browser.raceStarted) browser.race?.finish(); }, [open]); return null; }
  const css = document.createElement('style'); css.textContent = collapsibleCss; document.head.appendChild(css);
  let panel: HTMLElement | null = null;
  const RenderedPanel = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { open: boolean; transitionStatus: string | undefined; alternate: boolean }>(function RenderedPanel({ open, transitionStatus, alternate, children, ...props }, ref) {
    if (scenario === 'remove-close' && !open || scenario === 'ending-host' && !open && transitionStatus !== 'ending') return null;
    return h(alternate ? 'section' : 'div', { ...props, ref, 'data-status': transitionStatus }, scenario === 'race-open' ? h(ResolveOnClose, { open }) : null, children);
  });
  function Fixture() {
    const [ownerOpen, setOwner] = useState<boolean | undefined>(config.controlled ? false : undefined);
    const [defaultOpen, setDefault] = useState(config.initialOpen), [disabled, setDisabled] = useState(config.disabled), [shown, setShown] = useState(true), [panelShown, setPanelShown] = useState(true), [alternate, setAlternate] = useState(false), [explicitId, setId] = useState<string | undefined>(scenario === 'manual-id' ? 'custom-panel-id' : undefined);
    const [motionEnabled, setMotion] = useState(scenario !== 'beforematch-no-motion');
    const [calls, setCalls] = useState<Record<string, unknown>[]>([]), [order, setOrder] = useState<string[]>([]), [callbackOwners, setCallbackOwners] = useState<string[]>([]), [switched, setSwitched] = useState(false);
    const [submitted, setSubmitted] = useState(0), [reset, setReset] = useState(0), [externalSubmitted, setExternalSubmitted] = useState(0);
    const record = (entry: string) => setOrder(previous => [...previous, entry]);
    const style = Object.fromEntries((motionEnabled ? config.panelStyle : '').split(';').filter(Boolean).map(entry => { const [name, value] = entry.split(':'); return [name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()), value.replace('!important', '')]; }));
    useEffect(() => {
      const browser = window as Window & { collapsibleFlush?: (action: string) => void };
      browser.collapsibleFlush = action => flushSync(() => { if (action === 'beforematch') panel?.dispatchEvent(new Event('beforematch', { bubbles: true })); else document.getElementById('tested-trigger')?.click(); });
      return () => { delete browser.collapsibleFlush; };
    }, []);
    return h('main', { 'data-hydrated': 'true' }, scenario === 'outside-trigger' ? h(Collapsible.Trigger) : shown ? h(Collapsible.Root, { ...{ 'data-testid': 'root' }, className: state => scenario === 'state-callbacks' ? state.open ? 'root-open' : 'root-closed' : '', style: state => scenario === 'state-callbacks' ? { opacity: state.open ? 1 : 0.5 } : {}, open: ownerOpen, defaultOpen, disabled, onOpenChange: (open, details) => {
      if (scenario === 'beforematch-cancel' && details.reason === 'none' || ['cancel', 'cancel-close'].includes(scenario)) details.cancel();
      if (scenario.startsWith('callback-')) setCallbackOwners(previous => [...previous, switched ? 'new' : 'old']);
      record('change'); setCalls(previous => [...previous, { open, reason: details.reason, type: details.event.type, before: document.getElementById('tested-trigger')?.getAttribute('aria-expanded'), canceled: details.isCanceled, defaultPrevented: details.event.defaultPrevented, mouse: details.event instanceof MouseEvent, cancelType: typeof details.cancel, allowType: typeof details.allowPropagation }]);
      if (['controlled-accept', 'controlled-consumer', 'controlled-render', 'controlled-keep'].includes(scenario)) setOwner(open);
    } }, h('form', { id: 'collapsible-form', onSubmit: event => { event.preventDefault(); setSubmitted(previous => previous + 1); }, onReset: () => setReset(previous => previous + 1) },
    h('input', { 'aria-label': 'Reset field', defaultValue: 'initial' }),
    h(Collapsible.Trigger, { id: scenario === 'trigger-id' ? 'custom-trigger-id' : 'tested-trigger', className: state => scenario === 'state-callbacks' ? state.open ? 'trigger-open' : 'trigger-closed' : '', style: state => scenario === 'state-callbacks' ? { opacity: state.open ? 1 : 0.5 } : {}, nativeButton: !config.custom, disabled: scenario === 'disabled-override' ? false : undefined,
      ...(scenario === 'submit' ? { type: 'submit', name: 'collapsible', value: 'sent' } : scenario === 'reset' ? { type: 'reset' } : scenario === 'external-form' ? { type: 'submit', form: 'external-form', name: 'collapsible', value: 'sent' } : {}),
      render: scenario === 'link' ? h('a', { href: '#target' }) : config.custom ? h('span', { onClick: (event: React.MouseEvent & { preventBaseUIHandler(): void }) => { record('render'); if (scenario === 'controlled-render') setOwner(true); if (scenario === 'callback-render') setSwitched(true); if (scenario === 'render-cancel') event.preventBaseUIHandler(); } }) : undefined,
      onClick: () => { record('consumer'); if (scenario === 'controlled-consumer') setOwner(true); if (scenario === 'callback-consumer') setSwitched(true); },
    }, 'Trigger'), panelShown ? h(Collapsible.Panel, { id: explicitId, ...{ 'data-testid': 'panel' }, className: state => scenario === 'state-callbacks' ? state.open ? 'panel-open' : 'panel-closed' : motionEnabled ? config.motionClass : '', style: state => scenario === 'state-callbacks' ? { opacity: state.open ? 1 : 0.5 } : style, keepMounted: scenario === 'hidden-warning' ? false : config.keep, hiddenUntilFound: config.hidden,
      ref: (host: HTMLDivElement | null) => { panel = host; if (host && scenario === 'important' && !host.hasAttribute('data-open')) host.style.setProperty('justify-content', 'center', 'important'); },
      render: (props, state) => { if (statuses.at(-1) !== String(state.transitionStatus)) statuses.push(String(state.transitionStatus)); (window as Window & { collapsibleStatuses?: string[] }).collapsibleStatuses = statuses; return h(RenderedPanel, { ...props, open: state.open, transitionStatus: state.transitionStatus, alternate }); },
    }, scenario === 'zero' ? null : 'This is panel content') : null)) : null,
      h('form', { id: 'external-form', onSubmit: event => { event.preventDefault(); setExternalSubmitted(previous => previous + 1); } }),
      h('button', { onClick: () => setOwner(!ownerOpen) }, 'toggle externally'), h('button', { onClick: () => setDefault(!defaultOpen) }, 'Change default'), h('button', { onClick: () => setDisabled(!disabled) }, 'Change disabled'),
      h('button', { onClick: () => setShown(!shown) }, 'Toggle mounting'), h('button', { onClick: () => setPanelShown(!panelShown) }, 'Toggle panel'), h('button', { onClick: () => setAlternate(!alternate) }, 'Replace host'), h('button', { onClick: () => setId(explicitId ? undefined : 'manual-panel') }, 'Change ID'), h('button', { onClick: () => setMotion(true) }, 'enable motion'),
      h('output', { 'data-testid': 'calls' }, JSON.stringify(calls)), h('output', { 'data-testid': 'order' }, JSON.stringify(order)), h('output', { 'data-testid': 'callback-owners' }, JSON.stringify(callbackOwners)), h('output', { 'data-testid': 'forms' }, JSON.stringify({ submitted, reset, externalSubmitted })), h('div', { id: 'target' }, 'Link target'));
  }
  const root = createRoot(node); root.render(h(Fixture)); return () => { root.unmount(); css.remove(); };
}
