// Exact npm 1.8.0 reference, source pin 47b40521. MIT: parity/progress/UPSTREAM_LICENSE.
import { createElement as h, forwardRef, useState, type ReactNode, type HTMLAttributes, type Ref, Component } from 'react';
import { createRoot } from 'react-dom/client';
import { Progress } from '@base-ui/react/progress';
import { progressConfig, rawValue } from './progress-config.js';
export function mountProgressReference(node: HTMLElement, scenario: string, part = 'Root', mode = 'default') {
  function Fixture() {
    const [config, setConfig] = useState(progressConfig(scenario));
    const [shown, setShown] = useState(true), [showLabel, setShowLabel] = useState(true), [labelId, setLabelId] = useState<string | undefined>(scenario === 'labels' ? 'label-a' : undefined), [tag, setTag] = useState('section');
    const ariaCalls: [string, number | null][] = [], valueCalls: [string | null, number | null][] = [];
    const refs: Record<string, HTMLElement | null> = {};
    const replacement = scenario === 'replacement' || scenario === 'replacement-callback';
    const callback = scenario === 'callback' || scenario.startsWith('formatted-');
    const valueCallback = scenario.startsWith('value-') || scenario === 'replacement-callback';
    const render = replacement ? h(tag, { className: 'replacement' }) : undefined;
    const button = (name: string, fn: () => void) => h('button', { onClick: fn }, name);
    const update = (patch: Partial<typeof config>) => setConfig(previous => ({ ...previous, ...patch }));
    if (scenario === 'context') return h('main', { 'data-hydrated': true }, h(MissingContextBoundary, {}, h(Progress.Label)));
    if (scenario === 'conformance') return conformance(part, mode);
    return h('main', { 'data-hydrated': true, ref: (el: HTMLElement | null) => { if (el) Object.assign(el, { progressAriaCalls: () => ariaCalls, progressValueCalls: () => valueCalls }); } },
      button('Set 77', () => update({ value: 77 })), button('Set 50', () => update({ value: 50 })), button('Set 100', () => update({ value: 100 })), button('Set null', () => update({ value: null })), button('Set NaN', () => update({ value: NaN })),
      button('Set EUR', () => update({ format: { style: 'currency', currency: 'EUR' } })), button('Set German', () => update({ locale: 'de-DE' })),
      button('Change id', () => setLabelId('label-b')), button('Remove label', () => setShowLabel(false)), button('Replace host', () => setTag('article')), button('Remove root', () => setShown(false)),
      shown ? h(Progress.Root, { ...config, id: 'tested-progress', render, ref: el => { refs.Root = el; },
        getAriaValueText: callback ? (formatted, raw) => { ariaCalls.push([formatted, raw]); return raw == null ? 'Waiting to start' : scenario.startsWith('formatted-') ? `${formatted} (raw: ${raw})` : `${formatted} uploaded`; } : undefined,
        ...(scenario === 'override' ? { role: 'meter', 'aria-valuenow': 123, 'aria-valuetext': 'consumer', 'aria-labelledby': 'external', 'data-complete': 'consumer' } : {}),
        className: state => `root-${state.status}`, style: state => ({ opacity: state.status === 'complete' ? 1 : 0.5 }),
      }, showLabel ? h(Progress.Label, { id: labelId, ...{ 'data-testid': 'label' }, render, ref: el => { refs.Label = el; } }, 'Downloading') : null,
      h(Progress.Value, { ...{ 'data-testid': 'value' }, render, ref: el => { refs.Value = el; }, children: valueCallback ? (formatted, raw) => { valueCalls.push([formatted, raw]); return `${formatted}|${rawValue(raw)}`; } : undefined }),
      h(Progress.Track, { ...{ 'data-testid': 'track' }, render, ref: el => { refs.Track = el; }, style: { width: 300, height: 12 } },
        h(Progress.Indicator, { ...{ 'data-testid': 'indicator' }, ref: el => { refs.Indicator = el; }, render: scenario === 'determinate' ? h('span') : render, style: scenario === 'style-override' ? { width: 7, height: 9, insetInlineStart: 2 } : undefined }))) : null);
  }
  const root = createRoot(node); root.render(h(Fixture)); return () => root.unmount();
}
function conformance(part: string, mode: string): ReactNode {
  const ref = (node: HTMLElement | null) => { if (node) { node.dataset.ref = node.tagName; node.dataset.refId = node.getAttribute('data-testid') ?? ''; } };
  const renderRef = (node: HTMLElement | null) => { if (node) { node.dataset.renderRef = node.tagName; node.dataset.renderRefId = node.getAttribute('data-testid') ?? ''; } };
  const custom = mode !== 'default' && mode !== 'style' && mode !== 'class';
  const wrapped = mode.startsWith('wrapper');
  const render = !custom ? undefined : mode === 'function' || mode === 'function-style' || mode === 'wrapper-function' || mode === 'ref-function'
    ? (props: HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }) => wrapped ? h('div', { 'data-testid': 'wrapper' }, h('div', { ...props, 'data-test-value': 'test-value' })) : h('div', { ...props, ...(mode === 'function-style' ? { style: { color: 'green' } } : {}), 'data-test-value': 'test-value' })
    : h(wrapped ? Wrapper : 'div', { ref: renderRef, className: 'render-prop-classname', ...(mode === 'element-style' ? { style: { color: 'green' } } : {}), 'data-test-value': 'test-value' });
  const properties = {
    ref, render, 'data-testid': 'conformance', lang: 'fr', 'data-foobar': 'foobar',
    className: mode === 'resolved-class' ? () => 'conditional-component-classname' : mode === 'class' ? 'test-class' : 'component-classname',
    style: mode === 'style' ? { color: 'green' } : undefined,
  };
  const tested = part === 'Root' ? h(Progress.Root, { ...properties, value: 40 }) : part === 'Label' ? h(Progress.Label, properties) : part === 'Track' ? h(Progress.Track, properties) : part === 'Indicator' ? h(Progress.Indicator, properties) : h(Progress.Value, properties);
  return h('main', { 'data-hydrated': true }, part === 'Root' ? tested : h(Progress.Root, { value: 40 }, tested));
}

const Wrapper = forwardRef<HTMLDivElement, Record<string, unknown>>(function Wrapper(props, ref) { return h('div', { 'data-testid': 'wrapper' }, h('div', { ...props, ref })); });

class MissingContextBoundary extends Component<{ children?: ReactNode }, { message: string }> {
  state = { message: '' };
  static getDerivedStateFromError(error: Error) { return { message: error.message }; }
  render() { return this.state.message ? h('output', { 'data-testid': 'context-error' }, this.state.message) : this.props.children; }
}
