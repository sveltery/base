// Exact Base UI 1.8.0 paired fixture; immutable pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: parity/accordion/UPSTREAM_LICENSE.
import { createElement as h, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Accordion } from '@base-ui/react/accordion';
import { accordionConfig, accordionCss } from './accordion-config.js';
export function mountAccordionReference(node: HTMLElement, scenario: string) {
  const config = accordionConfig(scenario);
  const states: Accordion.Item.State[] = [];
  const css = document.createElement('style'); css.textContent = accordionCss; document.head.appendChild(css);
  function Fixture() {
    const [owner, setOwner] = useState<(number | string)[] | undefined>(config.controlled ? scenario === 'controlled-custom' ? ['one'] : [] : undefined);
    const [triggerId, setTriggerId] = useState<string | undefined>(['manual-trigger', 'trigger-remove'].includes(scenario) ? 'custom-trigger-id' : undefined);
    const [panelId, setPanelId] = useState<string | undefined>(scenario === 'manual-panel' ? 'custom-panel-id' : undefined);
    const [triggerShown, setTriggerShown] = useState(true), [panelShown, setPanelShown] = useState(true), [alternate, setAlternate] = useState(false), [reverse, setReverse] = useState(false), [firstShown, setFirstShown] = useState(true);
    const [calls, setCalls] = useState<Record<string, unknown>[]>([]), [itemCalls, setItemCalls] = useState<Record<string, unknown>[]>([]), [order, setOrder] = useState<string[]>([]);
    useEffect(() => {
      const browser = window as Window & { accordionStates?: Accordion.Item.State[]; accordionFlush?: (action: string) => void };
      browser.accordionStates = states;
      browser.accordionFlush = action => flushSync(() => { document.querySelector(`[data-testid="${action === 'beforematch' ? 'panel' : 'trigger'}-1"]`)?.dispatchEvent(action === 'beforematch' ? new Event('beforematch', { bubbles: true }) : new MouseEvent('click', { bubbles: true })); });
      return () => { delete browser.accordionStates; delete browser.accordionFlush; };
    }, []);
    const items = (reverse ? [1, 0] : [0, 1]).filter(index => index !== 0 || firstShown).map(index => h(Accordion.Item, {
      key: index, value: config.implicit ? undefined : config.values[index], disabled: config.itemDisabled && index === 0, ...{ 'data-testid': `item-${index + 1}` },
      className: state => { states.push({ ...state }); return `item-${state.index}`; },
      onOpenChange: (open, details) => { if (scenario === 'cancel-item' || scenario === 'cancel-item-controlled') details.cancel(); setOrder(previous => [...previous, 'item']); setItemCalls(previous => [...previous, { open, index, reason: details.reason, type: details.event.type, canceled: details.isCanceled }]); },
    }, h(Accordion.Header, { ...{ 'data-testid': `header-${index + 1}` }, id: undefined }, index !== 0 || triggerShown ? h(Accordion.Trigger, {
      ...{ 'data-testid': `trigger-${index + 1}` }, id: index === 0 ? triggerId : undefined, nativeButton: !config.custom, render: config.custom ? h('span') : undefined,
      disabled: scenario === 'disabled-root' || scenario === 'disabled-item' ? false : undefined,
      onMouseUp: scenario === 'mouseup' ? event => event.preventBaseUIHandler() : undefined,
    }, `Trigger ${index + 1}`) : null), index !== 0 || panelShown ? h(Accordion.Panel, {
      ...{ 'data-testid': `panel-${index + 1}` }, id: index === 0 ? panelId : undefined, className: scenario === 'switch' ? 'accordion-motion' : '',
      style: scenario === 'ssr-inline' ? { animationDuration: '100ms', animationName: 'accordion-down', animationTimingFunction: 'linear' } : undefined,
      keepMounted: scenario === 'panel-warning' || scenario === 'root-hidden' && index === 1 ? false : config.keep ? true : undefined,
      hiddenUntilFound: scenario === 'root-hidden' && index === 1 ? false : config.hidden ? true : undefined, render: h(alternate ? 'section' : 'div'),
    }, `Panel contents ${index + 1}`) : null));
    if (scenario === 'outside-item' || scenario === 'outside-header') return h('main', { 'data-hydrated': 'true' }, scenario === 'outside-item' ? h(Accordion.Item) : h(Accordion.Header));
    return h('main', { 'data-hydrated': 'true' }, h(Accordion.Root<number | string>, {
      ...{ 'data-testid': 'root' }, value: owner, defaultValue: config.initial ? [config.values[0]] : [], multiple: config.multiple, disabled: config.rootDisabled,
      keepMounted: scenario === 'root-warning' ? false : config.rootKeep ? true : undefined, hiddenUntilFound: config.rootHidden,
      orientation: scenario === 'no-roving' ? 'horizontal' : undefined, loopFocus: scenario === 'no-roving' ? true : undefined,
      onValueChange: (value, details) => {
        if (scenario.startsWith('cancel-root') || scenario.startsWith('cancel-multiple')) details.cancel();
        setOrder(previous => [...previous, 'root']); setCalls(previous => [...previous, { value, reason: details.reason, type: details.event.type, canceled: details.isCanceled, before: document.querySelector('[data-testid="trigger-1"]')?.getAttribute('aria-expanded'), defaultPrevented: details.event.defaultPrevented }]);
        if (scenario === 'controlled-accept' || scenario === 'cancel-root-controlled' && !details.isCanceled) setOwner(value);
      },
    }, items),
      h('button', { onClick: () => setOwner(owner?.length ? [] : [config.values[0]]) }, 'toggle externally'),
      h('button', { onClick: () => setTriggerId('custom-trigger-id-1') }, 'Set id 1'), h('button', { onClick: () => setTriggerId('custom-trigger-id-2') }, 'Set id 2'), h('button', { onClick: () => setTriggerId(undefined) }, 'Remove id'),
      h('button', { onClick: () => setTriggerShown(!triggerShown) }, 'Toggle trigger'), h('button', { onClick: () => setPanelShown(!panelShown) }, 'Toggle panel'), h('button', { onClick: () => setPanelId(panelId ? undefined : 'manual-panel') }, 'Change panel ID'),
      h('button', { onClick: () => setAlternate(!alternate) }, 'Replace host'), h('button', { onClick: () => setReverse(!reverse) }, 'Reverse items'), h('button', { onClick: () => setFirstShown(!firstShown) }, 'Toggle first item'),
      h('output', { 'data-testid': 'calls' }, JSON.stringify(calls)), h('output', { 'data-testid': 'item-calls' }, JSON.stringify(itemCalls)), h('output', { 'data-testid': 'order' }, JSON.stringify(order)));
  }
  const root = createRoot(node); root.render(h(Fixture)); return () => { root.unmount(); css.remove(); };
}
