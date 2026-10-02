// Base UI v1.8.0 Input/Field.Control characterization. MIT: parity/input/UPSTREAM_LICENSE.
import { createElement as h, forwardRef, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Input } from '@base-ui/react/input';
const HelperWrapper = forwardRef<HTMLDivElement, Record<string, unknown>>((props, ref) => h('div', { 'data-testid': 'base-ui-wrapper' }, h('div', { ...props, ref, 'data-testid': 'wrapped' })));
export function mountInputReference(node: HTMLElement, scenario: string) {
  function Conformance() {
    const kind = scenario.replace('conformance-', '');
    const ref = useRef<HTMLElement | null>(null); const renderRef = useRef<HTMLDivElement | null>(null);
    const [hydrated, setHydrated] = useState(false); useEffect(() => { setHydrated(true); }, []);
    const [disabled, setDisabled] = useState(false);
    const wrapped = kind.startsWith('render-') && !kind.includes('class');
    const customized = kind.startsWith('props-') && !['props-default', 'props-style'].includes(kind) || kind.startsWith('render-');
    // React's string classes are the observable comparator for Svelte's native ClassValue API.
    const className: React.ComponentProps<typeof Input>['className'] = kind === 'class' ? 'test-class' : kind === 'render-class' ? 'component-classname' : kind === 'render-class-resolved' ? () => 'conditional-component-classname'
      : kind === 'render-class-object' ? 'component-classname object-class'
      : kind === 'render-class-array' ? 'component-classname nested-class object-class'
      : kind === 'render-class-object-callback' ? state => `${state.disabled ? 'disabled-class' : 'enabled-class'} object-class`
      : kind === 'render-class-array-callback' ? state => `nested-class object-class ${state.disabled ? 'disabled-class' : 'enabled-class'}` : undefined;
    const replacement = wrapped ? h(HelperWrapper, { ref: renderRef, 'data-test-value': 'source-value' }) : h('div', { ref: renderRef, 'data-testid': kind.includes('class') ? 'test-component' : 'custom-root', ...(kind.includes('class') ? { className: 'render-prop-classname' } : {}), ...(kind.includes('style') ? { style: { color: 'green' } } : {}) });
    const render: React.ComponentProps<typeof Input>['render'] = customized ? kind.includes('element') || kind.includes('class') || kind === 'render-merge-ref' ? replacement : props => wrapped ? h(HelperWrapper, { ...props, 'data-test-value': 'source-value' }) : h('div', { ...props, 'data-testid': 'custom-root', ...(kind.includes('style') ? { style: { color: 'green' } } : {}) }) : undefined;
    return h('main', { 'data-hydrated': hydrated }, h(Input, {
      ref, render, className, disabled, ...(kind === 'props-style' ? { style: { color: 'green' } } : {}),
      ...{ 'data-testid': kind === 'props-style' ? 'custom-root' : 'root' },
      ...(kind.startsWith('props-') ? { lang: 'fr', 'data-foobar': 'source-value' } : {}),
    }), h('output', { 'data-testid': 'refs' }, JSON.stringify({ instanceofInput: hydrated && ref.current instanceof HTMLInputElement, present: !!ref.current, renderPresent: !!renderRef.current, tag: ref.current?.tagName, testid: ref.current?.getAttribute('data-testid'), renderTag: renderRef.current?.tagName, renderTestid: renderRef.current?.getAttribute('data-testid'), same: !!ref.current && ref.current === renderRef.current })), kind.includes('callback') ? h('button', { onClick: () => setDisabled(previous => !previous) }, 'Toggle disabled class') : null);
  }
  function Fixture() {
    const [value, setValue] = useState('owner');
    const [disabled, setDisabled] = useState(scenario === 'disabled');
    const [id, setId] = useState<string | undefined>(scenario === 'generated' ? undefined : 'tested-input');
    const [name, setName] = useState('field');
    const [seed, setSeed] = useState('seed');
    const [alternate, setAlternate] = useState(false);
    const [calls, setCalls] = useState<{ value: string; reason: string; type: string; canceled: boolean; defaultPrevented: boolean }[]>([]);
    const [order, setOrder] = useState<string[]>([]);
    const controlled = scenario.startsWith('controlled');
    const append = (item: string) => setOrder(previous => [...previous, item]);
    const [hydrated, setHydrated] = useState(false); useEffect(() => { setHydrated(true); }, []);
    return h('main', { 'data-hydrated': hydrated },
      h('form', { 'data-testid': 'form', onReset: event => { if (scenario === 'reset-cancel') event.preventDefault(); } },
        h(Input, {
          id, name, disabled, required: scenario === 'required', type: scenario === 'email' ? 'email' : 'text',
          ...(controlled ? { value, ...(scenario.includes('default') ? { defaultValue: seed } : {}) } : { defaultValue: seed }),
          onChange: event => { append('consumer'); if (scenario.endsWith('prevent-base')) event.preventBaseUIHandler(); if (scenario.endsWith('prevent-default')) event.preventDefault(); },
          onValueChange: (next, details) => {
            append('value'); if (scenario === 'cancel' || scenario === 'controlled-cancel') details.cancel();
            if (scenario.startsWith('controlled') && scenario.endsWith('accept')) setValue(next);
            if (scenario.startsWith('controlled') && scenario.endsWith('rewrite')) setValue(next.toUpperCase());
            setCalls(previous => [...previous, { value: next, reason: details.reason, type: details.event.type, canceled: details.isCanceled, defaultPrevented: details.event.defaultPrevented }]);
          },
          className: state => state.disabled ? 'disabled-class' : 'enabled-class',
          style: state => ({ opacity: state.disabled ? 0.5 : 1 }),
          render: (props, state) => h(alternate ? 'textarea' : 'input', { ...props, 'data-state': JSON.stringify(state), 'data-testid': 'input', ...(scenario === 'render-order' ? { onChange: (event: React.ChangeEvent<HTMLInputElement>) => { append('render'); props.onChange?.(event); } } : {}) }),
        }), h('button', { type: 'reset' }, 'Reset')),
      h('button', { onClick: () => setValue('programmatic') }, 'Programmatic'),
      h('button', { onClick: () => { setDisabled(previous => !previous); setId(previous => previous ? undefined : 'new-id'); setName('renamed'); setSeed('new-seed'); } }, 'Props'),
      h('button', { onClick: () => setAlternate(previous => !previous) }, 'Replace'),
      h('output', { 'data-testid': 'value' }, value), h('output', { 'data-testid': 'calls' }, JSON.stringify(calls)), h('output', { 'data-testid': 'order' }, JSON.stringify(order)));
  }
  const root = createRoot(node); root.render(h(scenario.startsWith('conformance-') ? Conformance : Fixture)); return () => root.unmount();
}
