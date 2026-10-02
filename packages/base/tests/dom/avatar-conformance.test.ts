// Separate helper closure for AvatarImage.test.tsx:95, AvatarFallback.test.tsx:30,
// AvatarRoot.test.tsx:8, Base UI 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c (MIT).
// Helper leaf assertions adapt conformanceTests/{propForwarding,refForwarding,renderProp,className}.tsx.
// Element/function React render forms become distinct Svelte snippets. No ordinary declaration credit.
import { expect, it } from 'vitest';
import { flushSync, mount, unmount, type ComponentProps } from 'svelte';
import Fixture from './avatar-conformance-fixture.svelte';
import { cleanupWith, mockImageLoading } from './avatar-test-utils.js';
function setup(props: ComponentProps<typeof Fixture>) {
  mockImageLoading({ completeOnSet: true }); const host = document.createElement('main'); document.body.append(host);
  const component = mount(Fixture, { target: host, props }); cleanupWith(() => unmount(component)); flushSync(); return { host, component };
}
for (const [part, source] of [['Root', 'R:8'], ['Image', 'I:95'], ['Fallback', 'F:30']] as const) {
  it(`${source} helper refForwarding attaches the ref`, () => {
    const { component } = setup({ part }); expect(component.refs()[0]).toBeInstanceOf(part === 'Image' ? HTMLImageElement : HTMLSpanElement);
  });
  it(`${source} helper propsSpread custom props reach default host`, () => {
    const { host } = setup({ part, lang: 'fr', foobar: 'test-value' }); const node = host.querySelector('[data-testid=default]')!;
    expect(node.getAttribute('lang')).toBe('fr'); expect(node.getAttribute('data-foobar')).toBe('test-value');
  });
  for (const mode of ['function', 'element'] as const) {
    it(`${source} helper propsSpread custom props reach ${mode} replacement`, () => {
      const { host } = setup({ part, mode, lang: 'fr', foobar: 'test-value' }); const node = host.querySelector('[data-testid=wrapped]')!;
      expect(node.getAttribute('lang')).toBe('fr'); expect(node.getAttribute('data-foobar')).toBe('test-value');
    });
    it(`${source} helper propsSpread ${mode} replacement-owned style forwards`, () => {
      const { host } = setup({ part, mode, ownStyle: 'color: green' }); const node = host.querySelector('[data-testid=wrapped]')!;
      expect(node.hasAttribute('style')).toBe(true); expect(node.getAttribute('style')).toContain('color: green');
    });
    it(`${source} helper renderProp custom ${mode} host receives custom props`, () => {
      const { host } = setup({ part, mode, value: 'test-value' }); expect(host.querySelector('[data-testid=base-ui-wrapper]')).not.toBe(null); const node = host.querySelector('[data-testid=wrapped]');
      expect(node).not.toBe(null); expect(node!.getAttribute('data-test-value')).toBe('test-value');
    });
  }
  it(`${source} helper propsSpread component style forwards`, () => {
    const { host } = setup({ part, style: 'color: green' }); const node = host.querySelector('[data-testid=default]')!;
    expect(node.hasAttribute('style')).toBe(true); expect(node.getAttribute('style')).toContain('color: green');
  });
  it(`${source} helper renderProp element replacement wrapper renders`, () => {
    const { host } = setup({ part, mode: 'element' }); expect(host.querySelector('[data-testid=base-ui-wrapper]')).not.toBe(null);
  });
  it(`${source} helper renderProp custom host receives the component ref`, () => {
    const { component } = setup({ part, mode: 'function' }); const ref = component.refs()[0]!;
    expect(ref.tagName).toBe('DIV'); expect(ref.getAttribute('data-testid')).toBe('wrapped');
  });
  it(`${source} helper renderProp component and replacement refs merge`, () => {
    const { component } = setup({ part, mode: 'element' }); const [refA, refB] = component.refs();
    expect(refA).not.toBe(null); expect(refA!.tagName).toBe('DIV'); expect(refA!.getAttribute('data-testid')).toBe('wrapped');
    expect(refB).not.toBe(null); expect(refB!.tagName).toBe('DIV'); expect(refB!.getAttribute('data-testid')).toBe('wrapped');
  });
  it(`${source} helper renderProp component and replacement class merge`, () => {
    const { host } = setup({ part, mode: 'element', componentClass: 'component-classname', renderClass: 'render-prop-classname' }); const node = host.querySelector('[data-testid=wrapped]')!;
    expect(node.classList.contains('component-classname')).toBe(true); expect(node.classList.contains('render-prop-classname')).toBe(true);
  });
  it(`${source} helper renderProp resolved component and replacement class merge`, () => {
    const { host } = setup({ part, mode: 'element', componentClass: () => 'conditional-component-classname', renderClass: 'render-prop-classname' }); const node = host.querySelector('[data-testid=wrapped]')!;
    expect(node.classList.contains('conditional-component-classname')).toBe(true); expect(node.classList.contains('render-prop-classname')).toBe(true);
  });
  it(`${source} helper className applies a string class`, () => {
    setup({ part, componentClass: 'test-class' }); expect(document.querySelector('.test-class')).not.toBe(null);
  });
}
