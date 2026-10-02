// Exact Base UI 1.8.0 paired fixture; immutable pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: parity/accordion/UPSTREAM_LICENSE.
import { createElement as h, useState, useEffect, forwardRef, Component, type ReactNode, type HTMLAttributes, type Ref } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Accordion } from '@base-ui/react/accordion';
import { accordionConfig, accordionCss } from './accordion-config.js';
export function mountAccordionReference(node: HTMLElement, scenario: string, part = 'Root', mode = 'default') {
  const config = accordionConfig(scenario);
  const states: Accordion.Item.State[] = []; const panelStatuses: string[] = [];
  const css = document.createElement('style'); css.textContent = accordionCss; document.head.appendChild(css);
  function Fixture() {
    const [owner, setOwner] = useState<(number | string)[] | undefined>(config.controlled ? scenario === 'controlled-custom' ? ['one'] : [] : undefined);
    const [triggerId, setTriggerId] = useState<string | undefined>(['manual-trigger', 'trigger-remove'].includes(scenario) ? 'custom-trigger-id' : undefined);
    const [panelId, setPanelId] = useState<string | undefined>(scenario === 'manual-panel' ? 'custom-panel-id' : undefined);
    const [triggerShown, setTriggerShown] = useState(true), [panelShown, setPanelShown] = useState(true), [alternate, setAlternate] = useState(false), [reverse, setReverse] = useState(false), [firstShown, setFirstShown] = useState(true);
    const [calls, setCalls] = useState<Record<string, unknown>[]>([]), [itemCalls, setItemCalls] = useState<Record<string, unknown>[]>([]), [order, setOrder] = useState<string[]>([]);
    useEffect(() => {
      const browser = window as Window & { accordionStates?: Accordion.Item.State[]; accordionPanelStatuses?: string[]; accordionFlush?: (action: string) => void };
      browser.accordionStates = states; browser.accordionPanelStatuses = panelStatuses;
      browser.accordionFlush = action => flushSync(() => { document.querySelector(`[data-testid="${action === 'beforematch' ? 'panel' : 'trigger'}-1"]`)?.dispatchEvent(action === 'beforematch' ? new Event('beforematch', { bubbles: true }) : new MouseEvent('click', { bubbles: true })); });
      return () => { delete browser.accordionStates; delete browser.accordionPanelStatuses; delete browser.accordionFlush; };
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
      ...{ 'data-testid': `panel-${index + 1}` }, id: index === 0 ? panelId : undefined, className: scenario === 'switch' || scenario === 'remove-close' ? 'accordion-motion' : scenario === 'important' ? 'accordion-mixed' : '',
      style: scenario === 'ssr-inline' ? { animationDuration: '100ms', animationName: 'accordion-down', animationTimingFunction: 'linear' } : scenario === 'important' ? { justifyContent: 'center' } : undefined,
      ref: host => { if (host && scenario === 'important' && !host.hasAttribute('data-open')) host.style.setProperty('justify-content', 'center', 'important'); },
      keepMounted: scenario === 'panel-warning' || scenario === 'root-hidden' && index === 1 ? false : config.keep ? true : undefined,
      hiddenUntilFound: scenario === 'root-hidden' && index === 1 ? false : config.hidden ? true : undefined, render: (props, state) => { if (panelStatuses.at(-1) !== String(state.transitionStatus)) panelStatuses.push(String(state.transitionStatus)); return scenario === 'remove-close' && !state.open ? h(RemovedPanel) : h(alternate ? 'section' : 'div', { ...props, 'data-status': state.transitionStatus }); },
    }, `Panel contents ${index + 1}`) : null));
    if (scenario === 'outside-item' || scenario === 'outside-header') return h('main', { 'data-hydrated': 'true' }, h(MissingContextBoundary, {}, scenario === 'outside-item' ? h(Accordion.Item) : h(Accordion.Header)));
    if (scenario === 'conformance') return conformance(part, mode);
    if (scenario === 'shared-host') return sharedHost();
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

function conformance(part: string, mode: string): ReactNode {
  const ref = (node: HTMLElement | null) => { if (node) { const view = node.ownerDocument.defaultView as Window & typeof globalThis; node.dataset.refInstance = String(node instanceof (part === 'Trigger' && !custom ? view.HTMLButtonElement : part === 'Header' && !custom ? view.HTMLHeadingElement : view.HTMLDivElement)); node.dataset.ref = node.tagName; node.dataset.refId = node.getAttribute('data-testid') ?? ''; } };
  const renderRef = (node: HTMLElement | null) => { if (node) { node.dataset.renderRef = node.tagName; node.dataset.renderRefId = node.getAttribute('data-testid') ?? ''; } };
  const custom = !['default', 'style', 'class'].includes(mode);
  const wrapped = mode.startsWith('wrapper');
  const render = !custom ? undefined : ['function', 'function-style', 'wrapper-function', 'ref-function'].includes(mode)
    ? (props: HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }) => wrapped ? h('div', { 'data-testid': 'wrapper' }, h('div', { ...props, 'data-test-value': 'test-value' })) : h('div', { ...props, ...(mode === 'function-style' ? { style: { color: 'green' } } : {}), 'data-test-value': 'test-value' })
    : h(wrapped ? Wrapper : 'div', { ref: renderRef, className: 'render-prop-classname', ...(mode === 'element-style' ? { style: { color: 'green' } } : {}), 'data-test-value': 'test-value' });
  const properties = { ref, render, 'data-testid': 'conformance', lang: 'fr', 'data-foobar': 'foobar', className: mode === 'resolved-class' ? () => 'conditional-component-classname' : mode === 'class' ? 'test-class' : 'component-classname', style: mode === 'style' ? { color: 'green' } : undefined };
  const tested = part === 'Root' ? h(Accordion.Root, properties) : part === 'Item' ? h(Accordion.Item, properties) : part === 'Header' ? h(Accordion.Header, properties) : part === 'Trigger' ? h(Accordion.Trigger, { ...properties, nativeButton: !custom }) : h(Accordion.Panel, { ...properties, keepMounted: true });
  return h('main', { 'data-hydrated': true }, part === 'Root' ? tested : part === 'Item' ? h(Accordion.Root, null, tested) : h(Accordion.Root, null, h(Accordion.Item, null, tested)));
}
const Wrapper = forwardRef<HTMLDivElement, Record<string, unknown>>(function Wrapper(props, ref) { return h('div', { 'data-testid': 'wrapper' }, h('div', { ...props, ref })); });
class MissingContextBoundary extends Component<{ children?: ReactNode }, { message: string }> {
  state = { message: '' };
  static getDerivedStateFromError(error: Error) { return { message: error.message }; }
  render() { return this.state.message ? h('output', { 'data-testid': 'context-error' }, this.state.message) : this.props.children; }
}

function RemovedPanel() { return null; }

function sharedHost(): ReactNode {
  const indexes = { outer: -1, inner: -1, sibling: -1 };
  (window as Window & { accordionSharedIndexes?: typeof indexes }).accordionSharedIndexes = indexes;
  const record = (part: keyof typeof indexes, state: Accordion.Item.State) => { indexes[part] = state.index; return `${part}-${state.index}`; };
  return h('main', { 'data-hydrated': true }, h(Accordion.Root, null,
    h(Accordion.Item, { value: 'outer', className: state => record('outer', state), render: props => h(Accordion.Item, { ...props, value: 'inner', className: state => record('inner', state), ...{ 'data-testid': 'shared-host' } }, h(Accordion.Trigger, null, 'Shared trigger'), h(Accordion.Panel, null, 'Shared panel')) }),
    h(Accordion.Item, { value: 'sibling', className: state => record('sibling', state), ...{ 'data-testid': 'sibling-host' } })));
}
