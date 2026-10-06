// Exact React Base UI 1.8.0 reference; pin 47b40521. MIT: parity/avatar/UPSTREAM_LICENSE.
import {
  createElement as h,
  forwardRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Avatar } from '@base-ui/react/avatar';
import {
  avatarConfig,
  avatarDataUri,
  avatarMockSource,
  avatarNextMockSource,
  avatarNextRealSource,
  registerAvatarCommit,
} from './avatar-harness.js';
const tid = (value: string) => ({ 'data-testid': value });
const DroppedRef = forwardRef<HTMLImageElement, ComponentProps<'img'>>((props, _ref) =>
  h('img', { alt: '', ...props }),
);
export function mountAvatarReference(
  node: HTMLElement,
  scenario: string,
  part = 'Root',
  mode = 'default',
) {
  function Fixture() {
    const initial = avatarConfig(scenario);
    const [src, setSrc] = useState(initial.src),
      [delay, setDelay] = useState<number | undefined>(initial.delay),
      [shown, setShown] = useState(true),
      [updated, setUpdated] = useState(false),
      [callback, setCallback] = useState('initial'),
      [host, setHost] = useState(0);
    const renderedSource = [
      'keep-render-source',
      'keep-callback-source',
      'real-keep-replacement',
      'dropped-ref',
    ].includes(scenario);
    const replacement =
      renderedSource || ['keep-order', 'real-keep-replacement', 'dropped-ref'].includes(scenario);
    const source = src ?? (initial.real ? avatarDataUri : avatarMockSource);
    const extras =
      scenario === 'keep-callback-source'
        ? { sizes: '48px', src: source, srcSet: `${source} 1x` }
        : renderedSource
          ? { src: source }
          : {};
    let render: ComponentProps<typeof Avatar.Image>['render'];
    if (replacement)
      render =
        scenario === 'keep-render-source' ||
        scenario === 'real-keep-replacement' ||
        scenario === 'dropped-ref'
          ? h(scenario === 'dropped-ref' ? DroppedRef : 'img', {
              ...extras,
              className: updated ? 'updated' : 'initial',
              key: host,
              ...tid('image'),
              alt: '',
            })
          : (props) => {
              window.avatarHarness.sourceKeys = Object.keys(props);
              return h('img', {
                alt: '',
                ...extras,
                ...props,
                ...tid('image'),
                'data-source-keys': Object.keys(props).join(','),
              });
            };
    const event = (
      kind: string,
      event: { preventBaseUIHandler(): void; preventDefault(): void },
    ) => {
      window.avatarHarness.events.push(kind);
      if (scenario === 'keep-prevent') event.preventBaseUIHandler();
      if (scenario === 'keep-default-prevent') event.preventDefault();
    };
    const button = (name: string, action: () => void) => h('button', { onClick: action }, name);
    if (scenario === 'conformance') return avatarConformance(part, mode);
    return h(
      'main',
      { 'data-hydrated': true },
      h(
        'style',
        {},
        `.avatar-animation { transition: opacity 30ms; opacity: 1; } .avatar-animation[data-starting-style] { opacity: 0; } .avatar-animation[data-ending-style] { animation: avatar-exit 400ms; } .avatar-fallback[data-ending-style] { animation: avatar-exit 2s; } @keyframes avatar-exit { to { opacity: 0; } }`,
      ),
      button('Set source', () =>
        setSrc(initial.real ? avatarNextRealSource : avatarNextMockSource),
      ),
      button('Show image', () => setSrc(initial.real ? avatarDataUri : avatarMockSource)),
      button('Clear source', () => setSrc(undefined)),
      button('Remove image', () => setShown(false)),
      button('Restore image', () => setShown(true)),
      button('Delay zero', () => setDelay(0)),
      button('Delay undefined', () => setDelay(undefined)),
      button('Delay number', () => setDelay(100)),
      button('Update props', () => setUpdated(true)),
      button('Replace host', () => setHost((old) => old + 1)),
      button('Replace callback', () => setCallback('updated')),
      h(
        Avatar.Root,
        { ...tid('root'), className: (state) => `root-${state.imageLoadingStatus}` },
        shown && scenario !== 'delay-idle'
          ? h(Avatar.Image, {
              ...tid('image'),
              alt: 'Jane Doe',
              keepMounted: initial.keepMounted,
              src: renderedSource ? undefined : src,
              srcSet: initial.srcSet,
              sizes: initial.sizes,
              crossOrigin:
                scenario === 'native' || scenario.endsWith('responsive') ? 'anonymous' : undefined,
              referrerPolicy:
                scenario === 'native' || scenario.endsWith('responsive')
                  ? 'no-referrer'
                  : undefined,
              loading: scenario === 'keep-order' ? 'lazy' : undefined,
              ...(scenario === 'keep-aria-override' ? { 'aria-hidden': false } : {}),
              className: scenario.startsWith('animation') ? 'avatar-animation' : undefined,
              render,
              onLoadingStatusChange: (status) => {
                window.avatarHarness.statuses.push(status);
                window.avatarHarness.callbacks.push(`${callback}:${status}`);
              },
              onLoad: (e) => event('load', e),
              onError: (e) => event('error', e),
              onTransitionEnd: () => window.avatarHarness.events.push('transitionend'),
            })
          : null,
        h(Avatar.Fallback, { delay, ...tid('fallback'), className: 'avatar-fallback' }, 'JD'),
      ),
    );
  }
  const root = createRoot(node);
  flushSync(() => root.render(h(Fixture)));
  const main = node.querySelector<HTMLElement>('main');
  if (!main) throw new Error('Avatar reference did not commit a fixture host');
  const unregister = registerAvatarCommit(main, (action) => flushSync(action));
  return () => {
    unregister();
    root.unmount();
  };
}
const Wrapper = forwardRef<HTMLElement, Record<string, unknown>>((props, ref) =>
  h('div', tid('wrapper'), h('div', { ...props, ref })),
);
function avatarConformance(part: string, mode: string): ReactNode {
  const Part = Avatar[part as 'Root' | 'Image' | 'Fallback'];
  const custom = !['default', 'style', 'class'].includes(mode),
    wrapped = mode.startsWith('wrapper');
  const capture = (node: HTMLElement | null) => {
    if (node) {
      node.dataset.ref = node.tagName;
      node.dataset.refId = node.getAttribute('data-testid') ?? '';
    }
  };
  const renderCapture = (node: HTMLElement | null) => {
    if (node) {
      node.dataset.renderRef = node.tagName;
      node.dataset.renderRefId = node.getAttribute('data-testid') ?? '';
    }
  };
  const extra = {
    ...(mode.includes('style') ? { style: { color: 'green' } } : {}),
    ...(mode.includes('class') ? { className: 'render-prop-classname' } : {}),
    'data-test-value': 'test-value',
  };
  const render = !custom
    ? undefined
    : mode.includes('function')
      ? (props: Record<string, unknown>) => h(wrapped ? Wrapper : 'div', { ...props, ...extra })
      : h(wrapped ? Wrapper : 'div', {
          ...(mode === 'wrapper-empty' ? {} : extra),
          ref: mode === 'refs-element' ? renderCapture : undefined,
        });
  const props = {
    lang: 'fr',
    'data-foobar': 'foobar',
    ...tid('conformance'),
    ref: capture,
    render,
    style: mode === 'style' ? { color: 'green' } : undefined,
    className:
      mode === 'class'
        ? 'test-class'
        : mode === 'merged-class'
          ? 'component-classname'
          : mode === 'resolved-class'
            ? () => 'conditional-component-classname'
            : undefined,
    ...(part === 'Image' ? { src: avatarMockSource } : {}),
  };
  // The common adapter intentionally uses a wider element type for replacement-host conformance.
  const content = h(
    Part as unknown as import('react').ComponentType<Record<string, unknown>>,
    props,
  );
  return h(
    'main',
    { 'data-hydrated': true },
    part === 'Root' ? content : h(Avatar.Root, {}, content),
  );
}
