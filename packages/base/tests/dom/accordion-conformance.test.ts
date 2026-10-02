// Adapted shared helper assertions from Base UI v1.8.0; MIT: parity/accordion/UPSTREAM_LICENSE.
// Svelte snippets, bindings and attachments substitute for React elements and refs. No ordinary declaration credit.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './accordion/Conformance.svelte';
const mounted: ReturnType<typeof mount>[] = [];
const modes = ['default', 'function', 'element', 'style', 'function-style', 'element-style', 'class', 'wrapper-function', 'wrapper-element', 'wrapper-empty', 'ref-function', 'refs-element', 'merged-class', 'resolved-class'];
const tags = { Root: 'DIV', Item: 'DIV', Header: 'H3', Trigger: 'BUTTON', Panel: 'DIV' } as const;
afterEach(async () => { for (const component of mounted.splice(0)) await unmount(component); document.body.replaceChildren(); });
for (const part of ['Root', 'Item', 'Header', 'Trigger', 'Panel'] as const) for (const mode of modes) it(`conformance ${part} ${mode}`, async () => {
  const target = document.createElement('section'); document.body.append(target);
  const component = mount(Fixture, { target, props: { part, mode } }); mounted.push(component); await tick();
  const node = document.querySelector('[data-testid=conformance]') as HTMLElement;
  expect(node).not.toBe(null);
  if (['default', 'function', 'element'].includes(mode)) {
    expect(node.getAttribute('lang')).toBe('fr'); expect(node.getAttribute('data-foobar')).toBe('test-value');
  }
  if (mode.includes('style')) { expect(node.hasAttribute('style')).toBe(true); expect(node.getAttribute('style')).toContain('color: green'); }
  if (mode === 'class') expect(document.querySelector('.test-class')).not.toBe(null);
  if (mode.startsWith('wrapper')) {
    expect(document.querySelector('[data-testid=base-ui-wrapper]')).not.toBe(null);
    if (mode !== 'wrapper-empty') expect(node.getAttribute('data-test-value')).toBe('test-value');
  }
  if (mode === 'merged-class' || mode === 'resolved-class') {
    expect(node.classList.contains('render-prop-classname')).toBe(true);
    expect(node.classList.contains(mode === 'resolved-class' ? 'conditional-component-classname' : 'component-classname')).toBe(true);
  }
  const custom = ['function', 'element', 'function-style', 'element-style', 'wrapper-function', 'wrapper-element', 'wrapper-empty', 'ref-function', 'refs-element', 'merged-class', 'resolved-class'].includes(mode);
  const tag = custom ? 'DIV' : tags[part];
  if (mode === 'default') {
    const window = node.ownerDocument.defaultView!;
    const instance = part === 'Header' ? window.HTMLHeadingElement : part === 'Trigger' ? window.HTMLButtonElement : window.HTMLDivElement;
    expect(component.refs().ref).toBeInstanceOf(instance);
  }
  expect(component.refs().ref).toBe(node); expect(component.refs().ref!.tagName).toBe(tag);
  expect(component.refs().ref!.getAttribute('data-testid')).toBe('conformance');
  if (mode === 'refs-element') {
    expect(component.refs().renderRef).not.toBe(null); expect(component.refs().renderRef!.tagName).toBe(tag);
    expect(component.refs().renderRef!.getAttribute('data-testid')).toBe('conformance');
    expect(component.refs().renderRef).toBe(component.refs().ref);
  }
});
