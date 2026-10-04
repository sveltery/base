// Actual React19.2.8/ReactDOM19.2.8 with installed pinned @base-ui/react1.8.0; MIT.
import { createElement as h, useState, useEffect, useRef, version as reactVersion, forwardRef, type HTMLAttributes, type SyntheticEvent } from 'react';
import { flushSync, version as reactDomVersion } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { ScrollArea } from '@base-ui/react/scroll-area';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { CSPProvider } from '@base-ui/react/csp-provider';
import { defaultScrollAreaOptions, type ScrollAreaOptions } from './scroll-area-harness.js';
const WithoutRef = forwardRef<HTMLDivElement,HTMLAttributes<HTMLDivElement>>(function WithoutRef(props,_ref){return h('article',props);});
export function mountScrollAreaReference(node: HTMLElement, options: Partial<ScrollAreaOptions>) {
  const root = createRoot(node);
  function Fixture() {
    const [settings, setSettings] = useState({ ...defaultScrollAreaOptions, ...options });
    const [mounted, setMounted] = useState(true);
    const [hydrated, setHydrated] = useState(false);
    const [calls, setCalls] = useState<string[]>([]);
    const rootRef = useRef<HTMLDivElement>(null), viewportRef = useRef<HTMLDivElement>(null), contentRef = useRef<HTMLDivElement>(null), verticalRef = useRef<HTMLDivElement>(null), horizontalRef = useRef<HTMLDivElement>(null), thumbRef = useRef<HTMLDivElement>(null), cornerRef = useRef<HTMLDivElement>(null);
    function consumer(name: string, event: SyntheticEvent & { preventBaseUIHandler?: () => void }) {
      setCalls(previous => [...previous, name]);
      if (settings.suppress === name) event.preventBaseUIHandler?.();
      if (settings.unmountOn === name) flushSync(() => setSettings(previous => ({ ...previous, ...(name === 'scroll' || name === 'up' ? { viewportMounted: false } : { scrollbarMounted: false }) })));
    }
    useEffect(() => {
      setHydrated(true);
      window.scrollAreaHarness = {
        configure(patch) { flushSync(() => setSettings(previous => ({ ...previous, ...patch }))); },
        destroy() { flushSync(() => setMounted(false)); },
        refs() { return Object.fromEntries(Object.entries({ root: rootRef, viewport: viewportRef, content: contentRef, vertical: verticalRef, horizontal: horizontalRef, thumb: thumbRef, corner: cornerRef }).map(([name, ref]) => [name, ref.current !== null])); },
      };
      return () => { delete window.scrollAreaHarness; };
    }, []);
    const render = settings.customRender ? h('article') : undefined;
    const noRef = settings.dropRef ? h(WithoutRef) : render;
    const aria = settings.ariaOverride ? { 'aria-hidden': undefined } : {};
    return h('main', { 'data-hydrated': hydrated, 'data-renderer': `${reactVersion}/${reactDomVersion}` },
      h('button', { id: 'outside' }, 'outside focus'), h('output', { id: 'calls' }, JSON.stringify(calls)),
      mounted && h(DirectionProvider, { direction: settings.direction },
        h(CSPProvider, { nonce: settings.nonce, disableStyleElements: settings.disableStyleElements },
          h('div', { style: { display: settings.hidden ? 'none' : undefined } },
            h(ScrollArea.Root, { ...{ 'data-testid': 'root' }, ref: rootRef, overflowEdgeThreshold: settings.threshold, render, className: 'root-class', style: { width: settings.viewportSize, height: settings.viewportSize, direction: settings.direction } },
              settings.viewportMounted && h(ScrollArea.Viewport, { ...{ 'data-testid': 'viewport' }, ref: viewportRef, render, onScroll: event => consumer('scroll', event), style: { width: '100%', height: '100%', scrollSnapType: settings.snap, pointerEvents: 'none' } },
                settings.contentMounted && h(ScrollArea.Content, { ...{ 'data-testid': 'content' }, ref: contentRef, render: noRef }, settings.snapItems ? h('div',{style:{display:'flex'}},...Array.from({length:10},(_,index)=>h('div',{key:index,style:{flexShrink:0,width:200,height:100,scrollSnapAlign:'start'}}))) : h('div', { ...{ 'data-testid': 'large' }, style: { width: settings.contentWidth, height: settings.contentHeight } }))),
              settings.scrollbarMounted && h(ScrollArea.Scrollbar, { orientation: 'vertical', ...{ 'data-testid': 'vertical' }, ref: verticalRef, render: noRef, keepMounted: settings.keepMounted, ...aria, onPointerDown: event => consumer('track', event), style: { width: settings.trackThickness, display: 'flex', paddingBlock: settings.padding, marginInline: settings.margin, ...(settings.trackHeight !== null ? { height: settings.trackHeight, bottom: 'auto' } : {}) } },
                settings.thumbMounted && h(ScrollArea.Thumb, { ...{ 'data-testid': 'vertical-thumb' }, ref: thumbRef, render, onPointerDown: event => consumer('down', event), onPointerMove: event => consumer('move', event), onPointerUp: event => consumer('up', event), style: { width: '100%', marginBlock: settings.thumbMargin } })),
              settings.scrollbarMounted && h(ScrollArea.Scrollbar, { orientation: 'horizontal', ...{ 'data-testid': 'horizontal' }, ref: horizontalRef, render, keepMounted: settings.keepMounted, ...aria, style: { height: settings.trackThickness, display: 'flex', paddingInline: settings.padding, marginBlock: settings.margin } },
                settings.thumbMounted && h(ScrollArea.Thumb, { ...{ 'data-testid': 'horizontal-thumb' }, render, style: { height: '100%', marginInline: settings.thumbMargin } })),
              settings.cornerMounted && h(ScrollArea.Corner, { ...{ 'data-testid': 'corner' }, ref: cornerRef, render, ...aria }))), settings.repeated && h(ScrollArea.Root,{...{'data-testid':'second-root'},style:{width:200,height:200}},h(ScrollArea.Viewport,{...{'data-testid':'second-viewport'},style:{width:'100%',height:'100%'}},h(ScrollArea.Content,{},h('div',{style:{width:1000,height:1000}})))))));
  }
  root.render(h(Fixture));
  return () => root.unmount();
}
