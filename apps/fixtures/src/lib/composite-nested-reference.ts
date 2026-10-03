// Actual pinned Base UI1.8.0 nested Composite source fixture; MIT: parity/radio/UPSTREAM_LICENSE.
import {
  createElement as h,
  forwardRef,
  useState,
  useMemo,
  version,
} from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync, version as reactDomVersion } from 'react-dom';
import {
  CompositeItem,
  CompositeRoot,
} from '@base-ui/react/internals/composite';
type NestedMetadata = {
  disabled: boolean;
  focusableWhenDisabled: boolean;
  owner: string;
  revision?: number;
};
const Root = CompositeRoot<NestedMetadata, Record<string, never>>;
const outer = { disabled: true, focusableWhenDisabled: true, owner: 'outer' };
export function flushNestedComposite(action: () => void) {
  flushSync(action);
}
export function mountNestedComposite(
  host: HTMLElement,
  onMap: (map: Map<Element, Record<string, unknown>>) => void,
) {
  let changeInner: () => void = () => {};
  let changeVisible: (value: boolean) => void = () => {};
  let changeHost: () => void = () => {};
  const Nested = forwardRef<
    HTMLElement,
    { revision: number; hostTag: 'button' | 'span' }
  >(({ revision, hostTag, ...props }, ref) => {
    const inner = useMemo(
      () => ({
        disabled: true,
        focusableWhenDisabled: false,
        owner: 'inner',
        revision,
      }),
      [revision],
    );
    return h(
      CompositeItem,
      {
        tag: hostTag,
        metadata: inner,
        refs: [ref],
        ...props,
        ...{ 'data-testid': 'shared' },
      },
      'Shared',
    );
  });
  function Fixture() {
    const [revision, setRevision] = useState(0);
    changeInner = () => setRevision((v) => v + 1);
    const [visible, setVisible] = useState(true);
    changeVisible = setVisible;
    const [hostTag, setHostTag] = useState<'button' | 'span'>('button');
    changeHost = () => setHostTag((v) => (v === 'button' ? 'span' : 'button'));
    const [map, setMap] = useState(new Map<Element, Record<string, unknown>>());
    const disabledIndices = useMemo(
      () =>
        [...map.values()]
          .filter((x) => x.disabled && !x.focusableWhenDisabled)
          .map((x) => x.index as number),
      [map],
    );
    return h(
      'main',
      {
        'data-hydrated': 'true',
        'data-renderer': `${version}/${reactDomVersion}`,
      },
      h(
        'button',
        { id: 'update-inner', onClick: () => changeInner() },
        'Update inner',
      ),
      h(
        'button',
        { id: 'toggle-shared', onClick: () => changeVisible(!visible) },
        'Toggle shared',
      ),
      h(
        'button',
        { id: 'replace-host', onClick: () => changeHost() },
        'Replace host',
      ),
      h(
        'output',
        { id: 'nested-map' },
        JSON.stringify(
          [...map].map(([node, metadata]) => ({
            testId: node.getAttribute('data-testid'),
            tag: node.tagName,
            ...metadata,
          })),
        ),
      ),
      h(
        Root,
        {
          orientation: 'horizontal',
          disabledIndices,
          onMapChange: (m) => {
            const elementMap = m as Map<
              Element,
              NestedMetadata & { index: number }
            >;
            setMap(elementMap);
            onMap(elementMap);
          },
        },
        h(
          CompositeItem,
          { tag: 'button', metadata: outer, ...{ 'data-testid': 'first' } },
          'First',
        ),
        visible
          ? h(CompositeItem, {
              tag: 'button',
              metadata: outer,
              render: h(Nested, { revision, hostTag }),
            })
          : null,
        h(
          CompositeItem,
          { tag: 'button', metadata: outer, ...{ 'data-testid': 'last' } },
          'Last',
        ),
      ),
    );
  }
  const root = createRoot(host);
  flushSync(() => root.render(h(Fixture)));
  return {
    version,
    reactDomVersion,
    updateInner: () => flushSync(changeInner),
    setVisible: (v: boolean) => flushSync(() => changeVisible(v)),
    replaceHost: () => flushSync(changeHost),
    unmount: () => flushSync(() => root.unmount()),
  };
}
