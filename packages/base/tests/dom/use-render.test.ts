// Assertion ports from immutable Base UI v1.8.0 useRender/useRenderElement tests.
// MIT: parity/use-render/UPSTREAM_LICENSE. Supplements are named separately; no conformance/type credit.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount, type ComponentProps } from 'svelte';
import { createAttachmentKey } from 'svelte/attachments';
import Fixture from './UseRenderFixture.svelte';
import type { PreventableEvent } from '../../src/lib/merge-props/index.js';
import type { UseRenderRef } from '../../src/lib/use-render/types.js';

const apps: ReturnType<typeof mount>[] = [];
afterEach(async () => { for (const app of apps.splice(0)) await unmount(app); document.body.replaceChildren(); });
function render(props: ComponentProps<typeof Fixture> = {}) {
  const target = document.createElement('main'); document.body.append(target);
  const app = mount(Fixture, { target, props }); apps.push(app); flushSync();
  return { target, app, host: () => target.firstElementChild! };
}
function ref(): { current: Element | null } { return { current: null }; }

it('public: unspecified class preserves render-function-owned class', () => {
  const { host } = render({ replacement: true, owned: { class: 'my-span ' }, options: { props: { class: undefined } } });
  expect(host().getAttribute('class')).toBe('my-span ');
});
it('public: all refs resolve the actual replacement host', () => {
  const refs = [ref(), ref()]; const { host } = render({ replacement: true, options: { ref: refs } });
  expect(refs.map(ref => ref.current)).toEqual([host(), host()]);
});
it('public: div is the implicit default tag', () => { expect(render().host().tagName).toBe('DIV'); });
it('public: defaultTagName changes across rerenders', () => {
  const { app, host } = render(); app.setOptions({ defaultTagName: 'span' }); flushSync(); expect(host().tagName).toBe('SPAN');
});
it('public: replacement wins across defaultTagName changes', () => {
  const { app, host } = render({ replacement: true }); expect(host().tagName).toBe('SPAN');
  app.setOptions({ defaultTagName: 'a' }); flushSync(); expect(host().tagName).toBe('SPAN');
});
it('public: state becomes attributes automatically', () => {
  const host = render({ options: { state: { active: true, index: 42 } } }).host();
  expect(host.getAttribute('data-active')).toBe(''); expect(host.getAttribute('data-index')).toBe('42');
});
it('public: undefined state values disappear', () => {
  const host = render({ options: { state: { defined: 'value', notDefined: undefined } } }).host();
  expect(host.getAttribute('data-defined')).toBe('value'); expect(host.hasAttribute('data-notdefined')).toBe(false);
});
it('public: state merges with existing props', () => {
  const host = render({ options: { state: { form: 'login' }, props: { class: 'btn-primary', id: 'submit-btn', 'data-existing': 'prop' } } }).host();
  expect(host.getAttribute('data-form')).toBe('login'); expect(host.getAttribute('class')).toBe('btn-primary'); expect(host.id).toBe('submit-btn'); expect(host.getAttribute('data-existing')).toBe('prop');
});
it('public: props override state attributes', () => {
  expect(render({ options: { state: { active: true }, props: { 'data-active': 'false' } } }).host().getAttribute('data-active')).toBe('false');
});
it('public: empty state adds no attributes', () => {
  const host = render({ options: { state: {}, props: { class: 'test-class' } } }).host();
  expect(host.getAttribute('class')).toBe('test-class'); expect(host.getAttributeNames().filter(name => name.startsWith('data-'))).toEqual([]);
});
it('public: undefined state preserves props', () => {
  const host = render({ options: { state: undefined, props: { class: 'test-class', 'data-from-props': 'value' } } }).host();
  expect(host.getAttribute('class')).toBe('test-class'); expect(host.getAttribute('data-from-props')).toBe('value');
});
it('public: true is empty and false absent', () => {
  const host = render({ options: { state: { active: true, disabled: false } } }).host();
  expect(host.getAttribute('data-active')).toBe(''); expect(host.hasAttribute('data-disabled')).toBe(false);
});
it('public: zero is absent and nonzero numbers stringify', () => {
  const host = render({ options: { state: { count: 0, index: 42, percentage: 99.9 } } }).host();
  expect(host.hasAttribute('data-count')).toBe(false); expect(host.getAttribute('data-index')).toBe('42'); expect(host.getAttribute('data-percentage')).toBe('99.9');
});
it('public: explicit mappings control attribute spelling', () => {
  const host = render({ options: { state: { isActive: true, itemCount: 5, userName: 'John' }, stateAttributesMapping: {
    isActive: value => value ? { 'data-is-active': '' } : null, itemCount: value => ({ 'data-item-count': String(value) }), userName: value => ({ 'data-user-name': String(value) }),
  } } }).host();
  expect(host.getAttribute('data-is-active')).toBe(''); expect(host.getAttribute('data-item-count')).toBe('5'); expect(host.getAttribute('data-user-name')).toBe('John');
});

for (const [title, classProp, expected] of [
  ['class function', (state: Record<string, unknown>) => state.active ? 'active-class' : 'inactive-class', 'active-class test-component'],
  ['undefined class function', () => undefined, 'test-component'],
] as const) it(`internal: ${title}`, () => {
  expect(render({ internal: true, options: { state: { active: true }, class: classProp, props: { class: 'test-component' } } }).host().getAttribute('class')).toBe(expected);
});
for (const [title, style, color] of [
  ['style function', (state: Record<string, unknown>) => state.active ? 'color:rgb(255,0,0)' : 'color:rgb(0,255,0)', 'rgb(255, 0, 0)'],
  ['undefined style function', () => undefined, ''],
] as const) it(`internal: ${title}`, () => {
  const host = render({ internal: true, options: { state: { active: true }, style, props: { style: 'padding:10px' } } }).host() as HTMLElement;
  expect(host.style.padding).toBe('10px'); expect(host.style.color).toBe(color);
});
for (const event of ['mousedown', 'contextmenu']) for (const array of [false, true]) it(`internal: ${event} is preventable in ${array ? 'array' : 'object'} props`, () => {
  const handler = vi.fn((event: PreventableEvent) => event.preventBaseUIHandler());
  const props = { [`on${event}`]: handler }; const host = render({ internal: true, options: { props: array ? [props, { class: 'test-component' }] : props } }).host();
  host.dispatchEvent(new MouseEvent(event, { bubbles: true })); expect(handler).toHaveBeenCalledTimes(1);
});
it('internal: disabled skips prop getter resolution', () => {
  const getter = vi.fn(() => ({ onmousedown() {} })); const { target } = render({ internal: true, options: { enabled: false, props: [getter] } });
  expect(target.firstElementChild).toBeNull(); expect(getter).not.toHaveBeenCalled();
});
it('internal: enabled toggles mount and clear refs', () => {
  const primary = ref(), handler = vi.fn(); const options = { ref: primary, props: { id: 'rerender-target', onclick: handler } };
  const { app, target, host } = render({ internal: true, options: { ...options, enabled: false } });
  expect(target.firstElementChild).toBeNull(); expect(primary.current).toBeNull();
  app.setOptions(options); flushSync(); expect(primary.current).toBe(host()); host().dispatchEvent(new MouseEvent('click', { bubbles: true })); expect(handler).toHaveBeenCalledTimes(1);
  app.setOptions({ ...options, enabled: false }); flushSync(); expect(primary.current).toBeNull(); expect(app.getElement()).toBeNull(); expect(target.firstElementChild).toBeNull();
});
it('internal: ref shapes and current event handlers update', () => {
  const primary = ref(), secondary = ref(), first = vi.fn(), second = vi.fn();
  const { app, host } = render({ internal: true, options: { ref: primary, props: { onclick: first } } });
  expect(primary.current).toBe(host()); expect(secondary.current).toBeNull();
  app.setOptions({ ref: [primary, secondary], props: { onclick: second } }); flushSync();
  expect(primary.current).toBe(host()); expect(secondary.current).toBe(host()); host().dispatchEvent(new MouseEvent('click', { bubbles: true })); expect(first).not.toHaveBeenCalled(); expect(second).toHaveBeenCalledTimes(1);
  app.setOptions({ ref: secondary, props: { onclick: second } }); flushSync(); expect(primary.current).toBeNull(); expect(secondary.current).toBe(host());
});
it('internal: snippet receives complete props and exact state', () => {
  const state = { active: true }, observe = vi.fn(); const host = render({ internal: true, replacement: true, observe, options: { state, props: { class: 'test-component', style: 'padding:10px', 'data-testid': 'custom' } }, owned: { 'data-active': 'true' } }).host();
  expect(observe.mock.calls[0][0]).toMatchObject({ class: 'test-component', style: 'padding:10px', 'data-testid': 'custom' }); expect(observe.mock.calls[0][1]).toBe(state);
  expect(host.tagName).toBe('SPAN'); expect(host.getAttribute('data-testid')).toBe('custom'); expect(host.getAttribute('data-active')).toBe('true');
});
it('internal: replacement snippet composes its owned props last', () => {
  const host = render({ internal: true, replacement: true, options: { state: { active: true }, props: { 'data-testid': 'custom', 'data-active': '' } }, owned: { 'data-active': 'true' } }).host();
  expect(host.tagName).toBe('SPAN'); expect(host.getAttribute('data-testid')).toBe('custom'); expect(host.getAttribute('data-active')).toBe('true');
});
it('internal: replacement host forwards supplied ref', () => {
  const primary = ref(); const host = render({ internal: true, replacement: true, options: { ref: primary } }).host(); expect(primary.current).toBe(host);
});
for (const callback of [false, true]) it(`internal: replacement composes ${callback ? 'function' : 'string'} class`, () => {
  const host = render({ internal: true, replacement: true, options: { state: { active: true }, class: callback ? state => state.active ? 'active-class' : '' : 'component-class', props: { class: 'test-component' } }, owned: { class: 'render-class' } }).host();
  expect(host.getAttribute('class')).toBe(`render-class ${callback ? 'active-class' : 'component-class'} test-component`);
});
for (const callback of [false, true]) it(`internal: replacement composes ${callback ? 'function' : 'string'} style`, () => {
  const host = render({ internal: true, replacement: true, options: { state: { active: true }, style: callback ? state => state.active ? 'color:rgb(255,0,0)' : '' : 'color:rgb(255,0,0)', props: { style: 'padding:10px' } }, owned: { style: 'font-size:16px' } }).host() as HTMLElement;
  expect(host.style.padding).toBe('10px'); expect(host.style.color).toBe('rgb(255, 0, 0)'); expect(host.style.fontSize).toBe('16px');
});
it('internal: supplied and replacement-owned refs resolve the same host', () => {
  const primary = ref(), owned = ref(); const host = render({ internal: true, replacement: true, options: { ref: primary }, ownedRef: owned }).host();
  expect(primary.current).toBe(host); expect(owned.current).toBe(host);
});
for (const property of ['class', 'style'] as const) it(`internal: minimal frozen empty state accepts ${property}`, () => {
  const host = render({ internal: true, options: { state: Object.freeze({}), [property]: property === 'class' ? 'test-class' : 'color:red' } }).host() as HTMLElement;
  expect(property === 'class' ? host.className : host.style.color).toBe(property === 'class' ? 'test-class' : 'red');
});

it('supplement: disabled skips all callbacks and symbol attachments but tears down prior refs', () => {
  const getter = vi.fn(() => ({})), className = vi.fn(() => 'active'), style = vi.fn(() => 'color:red'), mapping = vi.fn(() => ({ 'data-active': '' })), observe = vi.fn(), callback = vi.fn();
  const options = { enabled: false, state: { active: true }, stateAttributesMapping: { active: mapping }, props: [getter], class: className, style, ref: callback };
  const { app } = render({ internal: true, replacement: true, observe, options });
  for (const probe of [getter, className, style, mapping, observe, callback]) expect(probe).not.toHaveBeenCalled();
  app.setOptions({ ...options, enabled: true }); flushSync(); expect(callback).toHaveBeenCalledTimes(1);
  app.setOptions(options); flushSync(); expect(callback.mock.calls.at(-1)).toEqual([null]);
});
it('supplement: ref memoization, callback cleanups and actual SVG host swap/teardown', async () => {
  const cleanup = vi.fn(), callback = vi.fn(() => cleanup), legacy = vi.fn(), object = ref(); const refs: UseRenderRef[] = [callback, legacy, object];
  const { app, host } = render({ options: { ref: refs } }); expect(callback).toHaveBeenCalledTimes(1);
  app.setOptions({ ref: [...refs], props: { class: 'changed' } }); flushSync(); expect(callback).toHaveBeenCalledTimes(1); expect(cleanup).not.toHaveBeenCalled();
  const previous = host(); app.setOptions({ ref: refs, defaultTagName: 'svg' }); flushSync(); expect(host()).toBeInstanceOf(SVGElement); expect(previous.isConnected).toBe(false); expect(object.current).toBe(host()); expect(cleanup).toHaveBeenCalledTimes(1); expect(legacy.mock.calls[1]).toEqual([null]);
  await unmount(app); apps.splice(apps.indexOf(app), 1); expect(cleanup).toHaveBeenCalledTimes(2); expect(callback).toHaveBeenCalledTimes(2); expect(object.current).toBeNull(); expect(app.getElement()).toBeNull();
});
it('supplement: intrinsic defaults apply only to default tags with explicit props winning', () => {
  expect((render({ options: { defaultTagName: 'button' } }).host() as HTMLButtonElement).type).toBe('button');
  expect(render({ options: { defaultTagName: 'img' } }).host().getAttribute('alt')).toBe('');
  expect(render({ options: { defaultTagName: 'button', props: { type: 'submit' } } }).host().getAttribute('type')).toBe('submit');
  expect(render({ replacement: true, replacementTag: 'button', options: { defaultTagName: 'button' } }).host().hasAttribute('type')).toBe(false);
});
it('supplement: native cancellation and Base UI handler suppression are independent', () => {
  for (const prevent of ['default', 'base', 'none']) {
    const order: string[] = []; const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    const host = render({ internal: true, options: { props: [{ onmousedown: () => order.push('internal') }, { onmousedown: (event: PreventableEvent) => { order.push('consumer'); if (prevent === 'default') event.preventDefault(); if (prevent === 'base') event.preventBaseUIHandler(); } }] } }).host();
    host.dispatchEvent(event); expect(order).toEqual(prevent === 'base' ? ['consumer'] : ['consumer', 'internal']); expect(event.defaultPrevented).toBe(prevent === 'default');
  }
});
it('supplement: getters replace accumulated props and own their handler chaining', () => {
  const first = vi.fn(), second = vi.fn(), getter = vi.fn(previous => { expect(previous.id).toBe('old'); return { id: 'new', onclick: second }; });
  const host = render({ internal: true, options: { props: [{ id: 'old', onclick: first }, getter] } }).host();
  host.dispatchEvent(new MouseEvent('click', { bubbles: true })); expect(host.id).toBe('new'); expect(first).not.toHaveBeenCalled(); expect(second).toHaveBeenCalledTimes(1);
});
it('supplement: attributes use source falsy/lowercase/inherited/custom-null rules and stay live', () => {
  const state = Object.assign(Object.create({ inheritedName: 'yes' }), { camelCase: true, no: false, zero: 0, nan: NaN, blank: '', nil: null, custom: true });
  const { app, host } = render({ options: { state, stateAttributesMapping: { custom: () => null } } });
  expect(host().getAttribute('data-camelcase')).toBe(''); expect(host().getAttribute('data-inheritedname')).toBe('yes'); for (const key of ['no', 'zero', 'nan', 'blank', 'nil', 'custom']) expect(host().hasAttribute(`data-${key}`)).toBe(false);
  app.setOptions({ state: { camelCase: false, inheritedName: 'changed' } }); flushSync(); expect(host().hasAttribute('data-camelcase')).toBe(false); expect(host().getAttribute('data-inheritedname')).toBe('changed');
});
it('supplement: consumer attachment symbols survive replacement prop merging and teardown', async () => {
  const cleanup = vi.fn(), attach = vi.fn(() => cleanup), key = createAttachmentKey();
  const { app, host } = render({ replacement: true, options: { props: { [key]: attach } }, owned: { id: 'owned' } });
  expect(attach).toHaveBeenCalledWith(host()); expect(host().id).toBe('owned'); await unmount(app); apps.splice(apps.indexOf(app), 1); expect(cleanup).toHaveBeenCalledTimes(1);
});
