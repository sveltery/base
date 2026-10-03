// Complete native ordinary declarations; immutable assertions/body mapping: parity/field-form/primitive-ports.json.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './FieldPrimitiveSourceFixture.svelte';
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); vi.restoreAllMocks(); });
function render(scenario: string) {
  const host = document.createElement('div'); document.body.append(host); const component = mount(Fixture, { target: host, props: { scenario } }); cleanups.push(() => unmount(component)); flushSync();
  return { textbox: () => host.querySelector<HTMLInputElement>('input')!, testId: (id: string) => host.querySelector<HTMLElement>(`[data-testid="${id}"]`)!, message: () => host.querySelector<HTMLElement>('p')!,
    rerender(options: { first?: boolean; second?: boolean }) { component.rerenderControls(options); flushSync(); } };
}
describe('Field.Description immutable ordinary native declarations', () => {
  it('should set aria-describedby on the control automatically', () => {
    const screen = render('description-auto');
    expect(screen.textbox().getAttribute('aria-describedby')).toBe(screen.message().id);
  });
  it('should preserve user aria-describedby values on the control', () => {
    const screen = render('description-external');
    expect(screen.textbox().getAttribute('aria-describedby')).toBe(`external-description ${screen.message().id}`);
  });
  it('does not register an empty description id', () => {
    const screen = render('description-empty');
    expect(screen.textbox().getAttribute('aria-describedby')).toBe('external-description');
  });
  it('reflects the disabled state from Field.Item', () => {
    const screen = render('description-item');
    expect(screen.testId('description').hasAttribute('data-disabled')).toBe(true);
  });
});
describe('Field.Label immutable ordinary native declarations', () => {
  it('should set htmlFor referencing the control automatically', () => {
    const screen = render('label-auto');
    expect(screen.testId('label').getAttribute('for')).toBe(screen.textbox().id);
  });
  it('when nativeLabel={false}, clicking focuses the associated control', () => {
    const screen = render('label-focus'), label = screen.testId('label'), control = screen.testId('control');
    expect(label.hasAttribute('for')).toBe(false);
    label.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true })); label.click(); flushSync();
    expect(document.activeElement).toBe(control);
  });
  it('keeps the selected control id when another control unmounts', () => {
    const screen = render('label-controls');
    expect(screen.testId('label').getAttribute('for')).toBe('a');
    screen.rerender({ second: false }); expect(screen.testId('label').getAttribute('for')).toBe('a');
  });
  it('falls over to the remaining control when the selected one unmounts', () => {
    const screen = render('label-controls');
    expect(screen.testId('label').getAttribute('for')).toBe('a');
    screen.rerender({ first: false }); expect(screen.testId('label').getAttribute('for')).toBe('b');
  });
  it('reflects the disabled state from Field.Item', () => {
    const screen = render('label-item');
    expect(screen.testId('label').hasAttribute('data-disabled')).toBe(true);
  });
  it('does not warn by default', () => {
    const errorSpy = vi.spyOn(console, 'error').mockName('console.error').mockImplementation(() => {});
    render('label-default-warning'); expect(errorSpy).not.toHaveBeenCalled(); errorSpy.mockRestore();
  });
  it('does not warn when the render function returns no element', () => {
    const errorSpy = vi.spyOn(console, 'error').mockName('console.error').mockImplementation(() => {});
    render('label-empty'); expect(errorSpy).not.toHaveBeenCalled(); errorSpy.mockRestore();
  });
  it('errors if nativeLabel=true but ref is not a label', () => {
    const errorSpy = vi.spyOn(console, 'error').mockName('console.error').mockImplementation(() => {});
    try {
      render('label-wrong-native'); expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Base UI: <Field.Label> expected a <label> element because the `nativeLabel` prop is true. Rendering a non-<label> disables native label association, so `htmlFor` will not work. Use a real <label> in the `render` prop, or set `nativeLabel` to `false`.'));
    } finally { errorSpy.mockRestore(); }
  });
  it('errors if nativeLabel=false but ref is a label', () => {
    const errorSpy = vi.spyOn(console, 'error').mockName('console.error').mockImplementation(() => {});
    try {
      render('label-wrong-nonnative'); expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Base UI: <Field.Label> expected a non-<label> element because the `nativeLabel` prop is false. Rendering a <label> assumes native label behavior while Base UI treats it as non-native, which can cause unexpected pointer behavior. Use a non-<label> in the `render` prop, or set `nativeLabel` to `true`.'));
    } finally { errorSpy.mockRestore(); }
  });
});
