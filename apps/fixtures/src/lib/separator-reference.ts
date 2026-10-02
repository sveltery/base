// Pinned Base UI 1.8.0 ordinary/conformance adapters; MIT: parity/separator/UPSTREAM_LICENSE.
import { createElement as h, forwardRef, useEffect, useRef, useState, type ComponentProps } from 'react';
import { createRoot } from 'react-dom/client';
import { Separator } from '@base-ui/react/separator';
const testId = (value: string) => ({ 'data-testid': value });
const Wrapper = forwardRef<HTMLDivElement, Record<string, unknown>>((props, ref) => h('div', testId('base-ui-wrapper'), h('div', { ...props, ref, ...testId('wrapped') })));
export function mountSeparatorReference(node: HTMLElement, scenario: string) {
  function Fixture() {
    const [hydrated, setHydrated] = useState(false); const [mounted, setMounted] = useState(true); const [mode, setMode] = useState('initial');
    const [orientation, setOrientation] = useState<ComponentProps<typeof Separator>['orientation']>(scenario === 'vertical' ? 'vertical' : scenario === 'horizontal' ? 'horizontal' : undefined);
    const [tag, setTag] = useState('section'); const [calls, setCalls] = useState<string[]>([]);
    const ref = useRef<HTMLDivElement | null>(null); const renderRef = useRef<HTMLElement | null>(null);
    useEffect(() => { setHydrated(true); }, []);
    const customized = scenario.startsWith('props-') && scenario !== 'props-default' && scenario !== 'props-style' || scenario.startsWith('render-') || ['lifecycle', 'events', 'events-prevent', 'render-override'].includes(scenario);
    const wrapped = scenario.startsWith('render-') && !scenario.includes('class') && scenario !== 'render-override';
    const className = scenario === 'class' ? 'test-class' : scenario === 'render-class' ? 'component-classname' : scenario === 'render-class-resolved' ? () => 'conditional-component-classname' : ['reactive', 'lifecycle', 'override', 'render-override'].includes(scenario) ? (state: Separator.State) => `orientation-${state.orientation}` : undefined;
    const style = scenario === 'props-style' ? { color: 'green' } : scenario === 'reactive' ? (state: Separator.State) => ({ color: state.orientation === 'vertical' ? 'red' : 'green' }) : undefined;
    let render: ComponentProps<typeof Separator>['render'];
    const renderProps = {
      ...(scenario.includes('class') ? { className: 'render-prop-classname' } : {}), ...(scenario.includes('style') ? { style: { color: 'green' } } : {}),
      ...(scenario === 'render-override' ? { role: 'presentation', 'aria-orientation': 'vertical', 'data-orientation': 'replacement' } : {}),
      ...(scenario.startsWith('events') ? { onClick: (event: { preventBaseUIHandler(): void }) => { setCalls(previous => [...previous, 'render']); if (scenario === 'events-prevent') event.preventBaseUIHandler(); } } : {}),
      ...testId(scenario.includes('class') ? 'test-component' : 'custom-root')
    };
    if (customized) {
      const Type = wrapped ? Wrapper : scenario === 'lifecycle' ? tag : 'div';
      const extras = wrapped ? scenario === 'render-empty-element' ? {} : { 'data-test-value': 'source-value' } : renderProps;
      render = scenario.endsWith('element') || scenario.startsWith('events') || scenario === 'render-merge-ref' || scenario.includes('class') || scenario === 'render-override'
        ? h(Type, { ...extras, ref: (element: HTMLElement | null) => { renderRef.current = element; } })
        : (props, state) => h(Type, { ...props, ...extras, 'data-render-state': state.orientation, ref: (element: HTMLElement | null) => { if (typeof props.ref === 'function') props.ref(element); renderRef.current = element; } });
    }
    return h('main', { 'data-hydrated': hydrated },
      h('button', { onClick: () => setOrientation('vertical') }, 'vertical'), h('button', { onClick: () => setOrientation('horizontal') }, 'horizontal'),
      h('button', { onClick: () => setMode('updated') }, 'update props'), h('button', { onClick: () => setTag('article') }, 'replace host'),
      h('button', { onClick: () => setMounted(false) }, 'remove'), h('button', { onClick: () => setMounted(true) }, 'restore'),
      h('output', testId('events'), JSON.stringify(calls)),
      h('output', { ...testId('refs'), ref: (output: HTMLOutputElement | null) => { if (output) Object.assign(output, { readSeparatorRefs: () => ({ present: !!ref.current, instanceofDiv: ref.current instanceof HTMLDivElement, renderPresent: !!renderRef.current, tag: ref.current?.tagName, testid: ref.current?.getAttribute('data-testid'), renderTag: renderRef.current?.tagName, renderTestid: renderRef.current?.getAttribute('data-testid'), same: !!ref.current && ref.current === renderRef.current }) }); } }),
      mounted ? h(Separator, { orientation, ref, render, className, style,
        ...(scenario === 'override' ? { role: 'presentation', 'aria-orientation': 'vertical' as const, 'data-orientation': 'consumer' } : {}),
        id: mode === 'updated' ? 'updated-separator' : 'tested-separator', onClick: () => setCalls(previous => [...previous, mode === 'updated' ? 'updated-part' : 'part']),
        ...testId(scenario === 'props-style' ? 'custom-root' : 'root'), lang: scenario.startsWith('props-') ? 'fr' : undefined,
        ...{ 'data-foobar': scenario.startsWith('props-') ? 'source-value' : undefined, 'data-mode': mode } }, ['lifecycle', 'reactive'].includes(scenario) ? 'Separator content' : undefined) : null);
  }
  const root = createRoot(node); root.render(h(Fixture)); return () => root.unmount();
}
