// Exact npm 1.8.0 reference, source pin 47b40521. MIT: parity/meter/UPSTREAM_LICENSE.
import { createElement as h, forwardRef, useRef, useState, type ReactNode, type HTMLAttributes, type Ref, Component } from 'react';
import { createRoot } from 'react-dom/client';
import { Meter } from '@base-ui/react/meter';
import { meterConfig, rawValue } from './meter-config.js';
export function mountMeterReference(node: HTMLElement, scenario: string, part = 'Root', mode = 'default') {
  function Fixture() {
    const [config, setConfig] = useState(meterConfig(scenario));
    const [shown, setShown] = useState(true), [showLabel, setShowLabel] = useState(true), [labelId, setLabelId] = useState<string | undefined>(scenario === 'labels' ? 'label-a' : undefined), [tag, setTag] = useState('section'), [firstLabel, setFirstLabel] = useState(true), [secondaryId, setSecondaryId] = useState<string | undefined>('second');
    const ariaCalls = useRef<[string, number][]>([]).current, valueCalls = useRef<[string, number][]>([]).current;
    const refs = useRef<Record<string, HTMLElement | null>>({}).current;
    const replacement = scenario === 'replacement' || scenario === 'replacement-callback';
    const callback = scenario === 'callback' || scenario === 'raw-callback' || scenario.startsWith('formatted-');
    const valueCallback = scenario.startsWith('value-') || scenario === 'raw-callback' || scenario === 'replacement-callback';
    const render = replacement ? (props: HTMLAttributes<HTMLElement>, state: Meter.Root.State) => h(tag, { ...props, className: `${props.className ?? ''} replacement`, 'data-render-state': JSON.stringify(state) }) : undefined;
    const button = (name: string, fn: () => void) => h('button', { onClick: fn }, name);
    const update = (patch: Partial<typeof config>) => setConfig(previous => ({ ...previous, ...patch }));
    if (scenario === 'context') return h('main', { 'data-hydrated': true }, h(MissingContextBoundary, {}, h(Meter.Label)));
    if (scenario === 'conformance' || scenario === 'standalone-track') return conformance(part, mode, scenario === 'standalone-track');
    return h('main', { 'data-hydrated': true, ref: (el: HTMLElement | null) => { if (el) Object.assign(el, { meterAriaCalls: () => ariaCalls, meterValueCalls: () => valueCalls, meterRefs: () => ['Root', 'Label', 'Track', 'Indicator', 'Value'].map(key => refs[key]) }); } },
      button('Set 77', () => update({ value: 77 })), button('Reverse bounds', () => update({ min: 40, max: 20 })), button('NaN min', () => update({ min: NaN, max: 100 })), button('Infinite max', () => update({ min: 0, max: Infinity })), button('NaN custom range', () => update({ min: 20, max: 40, value: NaN })), button('Remove first', () => setFirstLabel(false)), button('Generate second id', () => setSecondaryId(undefined)), button('Set 60', () => update({ value: 60 })), button('Update range', () => update({ min: 20, max: 60, value: 50 })), button('Set Infinity', () => update({ value: Infinity })), button('Set -Infinity', () => update({ value: -Infinity })), button('Set NaN', () => update({ value: NaN })),
      button('Set EUR', () => update({ format: { style: 'currency', currency: 'EUR' } })), button('Set German', () => update({ locale: 'de-DE' })), button('Clear format', () => update({ format: undefined })),
      button('Change id', () => setLabelId('label-b')), button('Remove label', () => setShowLabel(false)), button('Remount label', () => setShowLabel(true)), button('Generate id', () => setLabelId(undefined)), button('Replace host', () => setTag('article')), button('Remove root', () => setShown(false)),
      scenario === 'nested' ? h(Meter.Root, { value: config.value, id: 'outer' }, firstLabel ? h(Meter.Label, { id: 'first' }, 'First') : null, h(Meter.Label, { id: secondaryId, ...{ 'data-testid': 'second-label' } }, 'Second'), h(Meter.Value, { id: 'outer-value' }), h(Meter.Root, { value: 100, id: 'inner' }, h(Meter.Label, { id: 'inner-label' }, 'Inner'), h(Meter.Value, { id: 'inner-value' }))) : shown ? h(Meter.Root, { ...config, id: 'tested-meter', render, ref: el => { refs.Root = el; },
        getAriaValueText: callback ? (formatted, raw) => { ariaCalls.push([formatted, raw]); return scenario === 'callback' ? `${raw} of 100 (${formatted})` : `${formatted} (raw: ${raw})`; } : undefined,
        ...(scenario === 'override' ? { role: 'progressbar', 'aria-valuenow': 123, 'aria-valuetext': 'consumer', 'aria-labelledby': 'external' } : {}),
        className: state => `root-state-${Object.keys(state).length}`, style: state => ({ opacity: Object.keys(state).length === 0 ? 0.5 : 1, ...(scenario === 'determinate' || scenario === 'zero' ? { width: 100 } : {}) }),
      }, showLabel ? h(Meter.Label, { id: labelId, ...{ 'data-testid': 'label' }, render, ref: el => { refs.Label = el; } }, 'Battery Level') : null,
      h(Meter.Value, { ...{ 'data-testid': 'value' }, render, ref: el => { refs.Value = el; }, children: valueCallback ? (formatted, raw) => { valueCalls.push([formatted, raw]); return `${formatted}|${rawValue(raw)}`; } : undefined }),
      h(Meter.Track, { ...{ 'data-testid': 'track' }, render, ref: el => { refs.Track = el; }, style: scenario === 'determinate' || scenario === 'zero' ? undefined : { width: 300, height: 12 } },
        h(Meter.Indicator, { ...{ 'data-testid': 'indicator' }, ref: el => { refs.Indicator = el; }, render: scenario === 'replacement-indicator' ? h('span') : render, style: scenario === 'replacement-indicator' ? { display: 'block' } : scenario === 'style-override' ? { width: 7, height: 9, insetInlineStart: 2 } : undefined }))) : null);
  }
  const root = createRoot(node); root.render(h(Fixture)); return () => root.unmount();
}
function conformance(part: string, mode: string, standalone = false): ReactNode {
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
  const tested = part === 'Root' ? h(Meter.Root, { ...properties, value: 40 }) : part === 'Label' ? h(Meter.Label, properties) : part === 'Track' ? h(Meter.Track, properties) : part === 'Indicator' ? h(Meter.Indicator, properties) : h(Meter.Value, properties);
  return h('main', { 'data-hydrated': true }, part === 'Root' || standalone ? tested : h(Meter.Root, { value: 40 }, tested));
}

const Wrapper = forwardRef<HTMLDivElement, Record<string, unknown>>(function Wrapper(props, ref) { return h('div', { 'data-testid': 'wrapper' }, h('div', { ...props, ref })); });

class MissingContextBoundary extends Component<{ children?: ReactNode }, { message: string }> {
  state = { message: '' };
  static getDerivedStateFromError(error: Error) { return { message: error.message }; }
  render() { return this.state.message ? h('output', { 'data-testid': 'context-error' }, this.state.message) : this.props.children; }
}
