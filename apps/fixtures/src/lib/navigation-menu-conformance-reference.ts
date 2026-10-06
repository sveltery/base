// Full selected Base UI conformance helper protocols at the immutable v1.8.0 pin; MIT.
import * as React from 'react';
import { NavigationMenu } from '@base-ui/react/navigation-menu';
const h = React.createElement;
type PartName = keyof typeof NavigationMenu;
export function NavigationMenuConformanceReference({
  part,
  probe,
}: {
  part: PartName;
  probe: string;
}) {
  const refA = React.useRef<HTMLElement | null>(null);
  const refB = React.useRef<HTMLElement | null>(null);
  const customized = probe.includes('custom') || probe.startsWith('render-');
  const wrapping = probe.startsWith('render-') && !probe.includes('class');
  const componentClass =
    probe === 'class'
      ? 'test-class'
      : probe === 'render-class'
        ? 'component-classname'
        : probe === 'render-class-function'
          ? () => 'conditional-component-classname'
          : undefined;
  const extraClass =
    probe.includes('class') && probe !== 'class' ? 'render-prop-classname' : undefined;
  const Wrapper = React.forwardRef<HTMLElement, Record<string, unknown>>(
    function Wrapper(props, forwardedRef) {
      const node = h('div', {
        ...props,
        ref: forwardedRef,
        'data-testid':
          probe.startsWith('props') || probe.startsWith('style') ? 'custom-root' : 'wrapped',
      });
      return wrapping ? h('div', { 'data-testid': 'base-ui-wrapper' }, node) : node;
    },
  );
  React.useEffect(() => {
    const api = {
      snapshot: (instance = 'HTMLElement') => ({
        refAInstance:
          refA.current instanceof
          (window as unknown as Record<string, typeof HTMLElement>)[instance],
        refATag: refA.current?.tagName ?? null,
        refBTag: refB.current?.tagName ?? null,
        sameRef: refA.current === refB.current,
        refATestId: refA.current?.dataset.testid ?? null,
        refBTestId: refB.current?.dataset.testid ?? null,
      }),
    };
    Object.assign(window, { navigationMenuConformance: api });
    return () => {
      delete (window as unknown as { navigationMenuConformance?: unknown })
        .navigationMenuConformance;
    };
  }, []);
  const customizedProps = {
    ...(['render-function', 'render-element'].includes(probe)
      ? { 'data-test-value': 'conformance-token' }
      : {}),
    ...(probe.startsWith('style-custom') ? { style: { color: 'green' } } : {}),
    ...(extraClass ? { className: extraClass } : {}),
  };
  const render =
    probe.endsWith('-element') ||
    probe === 'render-element-empty' ||
    probe.includes('class') ||
    probe === 'render-ref-merge'
      ? h(Wrapper, { ...customizedProps, ref: refB })
      : (props: Record<string, unknown>) => h(Wrapper, { ...props, ...customizedProps });
  const Part = NavigationMenu[part] as unknown as React.ComponentType<Record<string, unknown>>;
  const node = h(Part, {
    ref: refA,
    lang: 'fr',
    'data-foobar': 'conformance-token',
    'data-testid': customized ? 'wrapped' : 'root',
    className: componentClass,
    style: probe === 'style-component' ? { color: 'green' } : undefined,
    ...(part === 'Trigger' && customized ? { nativeButton: false } : {}),
    ...(customized ? { render } : {}),
  });
  if (part === 'Root') return node;
  if (part === 'Portal') return h(NavigationMenu.Root, { value: 'item' }, node);
  if (part === 'Arrow' || part === 'Popup')
    return h(
      NavigationMenu.Root,
      { value: 'test' },
      h(NavigationMenu.Portal, null, h(NavigationMenu.Positioner, null, node)),
    );
  if (part === 'Positioner')
    return h(NavigationMenu.Root, { value: 'test' }, h(NavigationMenu.Portal, null, node));
  if (part === 'Icon') return h(NavigationMenu.Root, null, h(NavigationMenu.Item, null, node));
  if (part === 'Trigger')
    return h(
      NavigationMenu.Root,
      null,
      h(NavigationMenu.List, null, h(NavigationMenu.Item, null, node)),
    );
  if (part === 'Link') return h(NavigationMenu.Root, null, h(NavigationMenu.List, null, node));
  return h(NavigationMenu.Root, null, node);
}
