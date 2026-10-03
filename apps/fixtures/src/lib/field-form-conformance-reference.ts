// Actual pinned React helper reference; MIT. No helper assertion earns ordinary declaration credit.
import { createElement as h, forwardRef, useEffect, useState, type ElementType } from 'react';
import { createRoot } from 'react-dom/client';
import { Field } from '@base-ui/react/field';
import { Fieldset } from '@base-ui/react/fieldset';
import { Form } from '@base-ui/react/form';
export function mountFieldFormConformanceReference(node: HTMLElement, part: string, scenario: string) {
  const parts: Record<string, ElementType> = { 'Field.Root': Field.Root, 'Field.Control': Field.Control, 'Field.Label': Field.Label, 'Field.Description': Field.Description,
    'Field.Error': Field.Error, 'Field.Item': Field.Item, 'Fieldset.Root': Fieldset.Root, 'Fieldset.Legend': Fieldset.Legend, Form };
  const Part = parts[part]; const Element = part === 'Field.Label' ? 'label' : 'div';
  const wrapped = scenario.startsWith('render-') && !scenario.includes('class');
  const customized = scenario.startsWith('props-') && !['props-default', 'props-style'].includes(scenario) || scenario.startsWith('render-');
  let ref: HTMLElement | null = null, renderRef: HTMLElement | null = null;
  const Wrapper = forwardRef<HTMLElement, Record<string, unknown>>((props, forwardedRef) => h('div', { 'data-testid': 'base-ui-wrapper' }, h(Element, { ...props, ref: forwardedRef, 'data-testid': 'wrapped' })));
  function Fixture() {
    const [hydrated, setHydrated] = useState(false), [refs, setRefs] = useState<Record<string, unknown>>({});
    useEffect(() => {
      const constructor = part === 'Field.Control' ? HTMLInputElement : part === 'Field.Description' ? HTMLParagraphElement : part === 'Field.Label' ? HTMLLabelElement : part === 'Fieldset.Root' ? HTMLFieldSetElement : part === 'Form' ? HTMLFormElement : HTMLDivElement;
      setRefs({ native: ref instanceof constructor, present: !!ref, renderPresent: !!renderRef, tag: ref?.tagName, testid: ref?.getAttribute('data-testid'), renderTag: renderRef?.tagName, renderTestid: renderRef?.getAttribute('data-testid') });
      setHydrated(true);
    }, []);
    const render = !customized ? undefined : wrapped ? scenario === 'render-function' || scenario === 'render-ref'
      ? (props: Record<string, unknown>) => h(Wrapper, { ...props, 'data-test-value': scenario === 'render-function' ? 'source-value' : undefined })
      : h(Wrapper, { ...(scenario === 'render-element' ? { 'data-test-value': 'source-value' } : {}), ref: scenario === 'render-merge-ref' ? (node: HTMLElement | null) => { renderRef = node; } : undefined })
      : scenario === 'props-function' || scenario === 'props-style-function'
        ? (props: Record<string, unknown>) => h(Element, { ...props, ...(scenario.includes('style') ? { style: { color: 'green' } } : {}), 'data-testid': 'custom-root' })
        : h(Element, { ...(scenario.includes('class') ? { className: 'render-prop-classname' } : {}), ...(scenario.includes('style') ? { style: { color: 'green' } } : {}), 'data-testid': scenario.includes('class') ? 'test-component' : 'custom-root' });
    const tested = h(Part, { ...(part === 'Field.Error' ? { match: true } : {}), ref: (node: HTMLElement | null) => { ref = node; }, render,
      className: scenario === 'class' ? 'test-class' : scenario === 'render-class' ? 'component-classname' : scenario === 'render-class-resolved' ? () => 'conditional-component-classname' : undefined,
      style: scenario === 'props-style' ? { color: 'green' } : undefined, 'data-testid': scenario === 'props-style' ? 'custom-root' : 'root',
      ...(scenario.startsWith('props-') ? { lang: 'fr', 'data-foobar': 'source-value' } : {}) });
    const wrappedTested = part === 'Fieldset.Legend' ? h(Fieldset.Root, null, tested) : ['Field.Control', 'Field.Label', 'Field.Description', 'Field.Error', 'Field.Item'].includes(part) ? h(Field.Root, { invalid: part === 'Field.Error' }, tested) : tested;
    return h('main', { 'data-hydrated': hydrated }, wrappedTested, h('output', { 'data-testid': 'refs' }, JSON.stringify(refs)));
  }
  const root = createRoot(node); root.render(h(Fixture)); return () => root.unmount();
}
