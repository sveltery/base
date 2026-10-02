// Actual npm @base-ui/react 1.8.0 hooks. Immutable behavior pin 47b40521 (MIT).
import { createElement as h, useState, useEffect, useRef, type CSSProperties, type Ref, type HTMLAttributes } from 'react';
import { createRoot } from 'react-dom/client';
import { useRender } from '@base-ui/react/use-render';
import { useRenderElement, type UseRenderElementParameters } from '@base-ui/react/internals/useRenderElement';
import { createUseRenderCase, publicCases, type State } from './use-render-cases.js';
import type { UseRenderHostProps, UseRenderPropSource, UseRenderTagName } from '../../../../packages/base/src/lib/use-render/types.js';
function css(value: unknown): CSSProperties | undefined {
  if (typeof value !== 'string') return undefined;
  return Object.fromEntries(value.split(';').filter(property => property.trim()).map(property => { const colon = property.indexOf(':'); const key = property.slice(0, colon).trim().replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()); return [key, property.slice(colon + 1).trim()]; }));
}
function nativeProps(props: UseRenderHostProps): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const inherited: Record<string, unknown> = {};
  for (const key in props) {
    const destination = Object.prototype.hasOwnProperty.call(props, key) ? result : inherited;
    const name = key === 'class' ? 'className' : key === 'onclick' ? 'onClick' : key === 'onmousedown' ? 'onMouseDown' : key === 'oncontextmenu' ? 'onContextMenu' : key;
    let owner = props, descriptor: PropertyDescriptor | undefined;
    while (owner && !descriptor) { descriptor = Object.getOwnPropertyDescriptor(owner, key); owner = Object.getPrototypeOf(owner); }
    if (descriptor?.get || descriptor?.set) {
      // Do not eagerly resolve property getters before the real hook's enabled/merge boundary.
      Object.defineProperty(destination, name, { enumerable: true, configurable: descriptor.configurable,
        get: descriptor.get ? () => key === 'style' ? css(props[key]) : props[key] : undefined,
        set: descriptor.set ? value => descriptor!.set!.call(props, value) : undefined });
    } else {
      Object.defineProperty(destination, name, { enumerable: true, configurable: descriptor?.configurable ?? true, writable: descriptor?.writable ?? true, value: key === 'style' ? css(props[key]) : props[key] });
    }
  }
  if (Object.keys(inherited).length) Object.setPrototypeOf(result, inherited);
  if (Object.isFrozen(props)) Object.freeze(result);
  return result;
}
function source(value: UseRenderPropSource) {
  if (typeof value !== 'function') return nativeProps(value);
  return (previous: Record<string, unknown>) => nativeProps(value(previous));
}
export function mountUseRenderReference(node: HTMLElement, scenario: string) {
  function Fixture() {
    const controller = useRef(createUseRenderCase(scenario)).current;
    const [stage, setStage] = useState(0), [hydrated, setHydrated] = useState(false);
    useEffect(() => { setHydrated(true); }, []);
    const config = controller.configuration(stage), options = config.options;
    const inputProps = Array.isArray(options.props) ? options.props.map(value => value === undefined ? undefined : source(value)) : options.props ? source(options.props as UseRenderPropSource) : undefined;
    const internal = !publicCases.includes(scenario);
    const render = !config.replacement ? undefined : scenario === 'render-function' || scenario === 'public-class' || scenario === 'public-refs' || scenario === 'all-gating'
      ? (props: HTMLAttributes<Element> & { ref?: Ref<Element> }, state: State) => {
        controller.observe({ ...props, class: props.className, style: props.style ? Object.entries(props.style).map(([key, value]) => `${key}:${value}`).join(';') : undefined }, state);
        return h(config.tag, { ...props, ...nativeProps(config.owned) });
      }
      : h(config.tag, { ...nativeProps(config.owned), ref: config.ownRef as Ref<Element> | undefined });
    const params = { enabled: options.enabled, state: options.state, props: inputProps, stateAttributesMapping: options.stateAttributesMapping, ref: options.ref as Ref<Element> | Ref<Element>[] | undefined };
    const componentProps = { render, className: typeof options.class === 'function' ? (state: State) => options.class instanceof Function ? options.class(state) as string | undefined : undefined : options.class as string | undefined, style: typeof options.style === 'function' ? (state: State) => css(options.style instanceof Function ? options.style(state) : undefined) : css(options.style) };
    // These two hooks share the same source closure; the selected hook stays fixed for a mounted case.
    const privateProps = (typeof inputProps === 'function' ? [inputProps] : inputProps) as UseRenderElementParameters<State, Element, UseRenderTagName, boolean>['props'];
    const element = internal ? useRenderElement(options.defaultTagName ?? 'div', componentProps, { ...params, props: privateProps }) : useRender({ ...params, render, defaultTagName: options.defaultTagName, props: inputProps as Record<string, unknown> | undefined });
    return h('main', { 'data-hydrated': hydrated, ref: (main: HTMLElement | null) => { if (main) Object.assign(main, { renderProbe: () => ({ calls: controller.calls, renders: controller.renders, refs: controller.refs.map(ref => ref.current ? { tag: ref.current.tagName, id: ref.current.id, connected: ref.current.isConnected } : null), element: node.querySelector('#tested-render') ? { tag: node.querySelector('#tested-render')!.tagName, id: 'tested-render', connected: true } : null }) }); } }, h('button', { type: 'button', onClick: () => setStage(value => value + 1) }, 'Advance'), element);
  }
  const root = createRoot(node); root.render(h(Fixture)); return () => root.unmount();
}
