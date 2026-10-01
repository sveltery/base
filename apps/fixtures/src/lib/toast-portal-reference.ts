// Pinned Base UI 1.8.0 conformance/portal adapters; MIT: parity/toast/UPSTREAM_LICENSE.
import { createElement as h, Fragment, forwardRef, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Toast } from '@base-ui/react/toast';
import { Dialog } from '@base-ui/react/dialog';
export function mountToastPortalReference(node: HTMLElement, scenario: string) {
  const external = Toast.createToastManager();
  function Contents() {
    const manager = Toast.useToastManager();
    return h(Toast.Viewport, { 'data-testid': 'viewport' }, manager.toasts.map(toast => h(Toast.Root, { key: toast.id, toast, swipeDirection: [] }, h(Toast.Title), h(Toast.Close, null, 'Close toast'))));
  }
  function Fixture() {
    const [hydrated, setHydrated] = useState(false);
    const [mounted, setMounted] = useState(true);
    const [mode, setMode] = useState('initial');
    const targetA = useRef<HTMLDivElement>(null); const targetB = useRef<HTMLDivElement>(null); const host = useRef<HTMLDivElement>(null);
    const [shadow, setShadow] = useState<ShadowRoot>();
    const objectRef = useRef<HTMLElement | ShadowRoot | null>(null);
    const refA = useRef<HTMLDivElement | null>(null); const refB = useRef<HTMLDivElement | null>(null);
    const [refs, setRefs] = useState({});
    useEffect(() => { setShadow(host.current!.attachShadow({ mode: 'open' })); setHydrated(true); }, []);
    useEffect(() => { setRefs({ tag: refA.current?.tagName, testid: refA.current?.getAttribute('data-testid'), renderTag: refB.current?.tagName, renderTestid: refB.current?.getAttribute('data-testid'), same: !!refA.current && refA.current === refB.current }); }, [mode, mounted, hydrated]);
    let container;
    if (mode === 'null' || scenario === 'null' && mode === 'initial') container = null;
    else if (mode === 'a' || scenario === 'element' && mode === 'initial') container = targetA.current;
    else if (mode === 'b') container = targetB.current;
    else if (scenario === 'shadow') container = shadow ?? null;
    else if (scenario === 'ref' || scenario === 'ref-null') container = mode === 'ref-a' ? { current: targetA.current } : objectRef;
    const customized = scenario.startsWith('props-') && scenario !== 'props-default' && scenario !== 'props-style' || scenario.startsWith('render-');
    const wrapped = scenario.startsWith('render-') && !scenario.includes('class');
    const Wrapper = forwardRef<HTMLDivElement, Record<string, unknown>>((props, ref) => h('div', { 'data-testid': 'base-ui-wrapper' }, h('div', { ...props, ref, 'data-testid': 'wrapped' })));
    let render;
    const renderProps = { ...(scenario.includes('class') ? { className: 'render-prop-classname' } : {}), ...(scenario.includes('style') ? { style: { color: 'green' } } : {}), 'data-testid': scenario.includes('class') ? 'test-component' : 'custom-root' };
    if (customized) {
      const Type = wrapped ? Wrapper : 'div';
      const extras = wrapped ? { 'data-test-value': 'source-value' } : renderProps;
      const mergedRef = (el: HTMLDivElement | null) => { refB.current = el; };
      render = scenario.endsWith('element') || scenario === 'render-merge-ref' || scenario.includes('class')
        ? h(Type, { ...extras, ref: mergedRef })
        : (props: Record<string, unknown>) => h(Type, { ...props, ...extras, ref: (el: HTMLDivElement | null) => { (props.ref as ((el: HTMLDivElement | null) => void) | undefined)?.(el); refB.current = el; } });
    }
    const portal = h(Toast.Portal, { container, ref: refA, render,
      className: scenario === 'class' ? 'test-class' : scenario === 'render-class' ? 'component-classname' : scenario === 'render-class-resolved' ? () => 'conditional-component-classname' : undefined,
      style: scenario === 'props-style' ? { color: 'green' } : undefined,
      id: mode === 'update' ? 'updated-portal' : undefined, 'data-testid': scenario === 'props-style' ? 'custom-root' : 'root',
      lang: scenario.startsWith('props-') ? 'fr' : undefined, 'data-foobar': scenario.startsWith('props-') ? 'source-value' : undefined, 'data-mode': mode },
      scenario === 'nested' ? h(Toast.Portal, { 'data-testid': 'nested' }, 'Nested') : null, h(Contents));
    return h('main', { 'data-hydrated': hydrated },
      h('div', { id: 'target-a', ref: targetA }), h('div', { id: 'target-b', ref: targetB }), h('div', { id: 'shadow-host', ref: host }),
      ...[['target a', 'a'], ['target b', 'b'], ['wait', 'null'], ['default', 'default'], ['resolve ref', 'ref-a'], ['update props', 'update']].map(([label, value]) => h('button', { key: label, onClick: () => setMode(value) }, label)),
      h('button', { onClick: () => { objectRef.current = targetA.current; setMode('mutated'); } }, 'mutate same ref'),
      h('button', { onClick: () => setMounted(false) }, 'remove'), h('button', { onClick: () => external.add({ id: 'portal-toast', title: 'Portal toast', timeout: 0 }) }, 'add toast'),
      h('output', { 'data-testid': 'refs' }, JSON.stringify(refs)),
      h(Toast.Provider, { toastManager: external }, mounted ? scenario === 'dialog' || scenario === 'dialog-ref-null'
        ? h(Dialog.Root, { defaultOpen: true }, h(Dialog.Portal, { 'data-testid': 'dialog-portal' }, h(Dialog.Popup, null, h(Dialog.Title, null, 'Dialog title'), h('button', null, 'Dialog control')), h(Toast.Portal, { container: scenario === 'dialog-ref-null' ? objectRef : undefined, 'data-testid': 'root' }, h(Contents))))
        : portal : null));
  }
  const root = createRoot(node); root.render(h(Fixture)); return () => root.unmount();
}
