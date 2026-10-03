// Complete native ordinary declaration adaptations; immutable source/assertion provenance: parity/field-form/fieldset-ports.json.
// DOM matcher substitutions use native attribute presence/value and the native :disabled selector.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './FieldsetSourceFixture.svelte';
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); vi.restoreAllMocks(); });
function render(scenario: string) {
  const host = document.createElement('div'); document.body.append(host); const component = mount(Fixture, { target: host, props: { scenario } }); cleanups.push(() => unmount(component)); flushSync();
  return { testId: (id: string) => host.querySelector<HTMLElement>(`[data-testid="${id}"]`)!, group: () => host.querySelector('fieldset')!, textbox: () => host.querySelector('input')!,
    click(name: string) { [...host.querySelectorAll('button')].find(button => button.textContent === name)!.click(); flushSync(); } };
}
describe('Fieldset.Root immutable ordinary native declarations', () => {
  it('sets the native disabled attribute', () => {
    const screen = render('native-disabled');
    expect(screen.testId('fieldset').hasAttribute('disabled')).toBe(true);
    expect(screen.textbox().matches(':disabled')).toBe(true);
  });
  it('keeps nested fieldsets disabled when an ancestor fieldset is disabled', () => {
    const screen = render('nested-disabled');
    expect(screen.testId('control').hasAttribute('disabled')).toBe(true);
  });
  it('updates nested disabled precedence in both directions', () => {
    const screen = render('nested-updates');
    expect(screen.testId('control').matches(':disabled')).toBe(true);
    expect(screen.testId('root').hasAttribute('data-disabled')).toBe(true);
    screen.click('Disable outer'); screen.click('Enable inner');
    expect(screen.testId('control').matches(':disabled')).toBe(true);
    expect(screen.testId('root').hasAttribute('data-disabled')).toBe(true);
    screen.click('Enable outer');
    expect(screen.testId('control').matches(':disabled')).toBe(false);
    expect(screen.testId('root').hasAttribute('data-disabled')).toBe(false);
  });
});
describe('Fieldset.Legend immutable ordinary native declarations', () => {
  it('should set aria-labelledby on the fieldset automatically', () => {
    const screen = render('generated-legend');
    expect(screen.group().getAttribute('aria-labelledby')).toBe(screen.testId('legend').id);
  });
  it('should set aria-labelledby on the fieldset with custom id', () => {
    const screen = render('custom-legend');
    expect(screen.group().getAttribute('aria-labelledby')).toBe('legend-id');
  });
  it('updates and clears the legend association', () => {
    const screen = render('updated-legend');
    expect(screen.group().getAttribute('aria-labelledby')).toBe('legend-a');
    screen.click('Change id'); expect(screen.group().getAttribute('aria-labelledby')).toBe('legend-b');
    screen.click('Remove legend'); expect(screen.group().hasAttribute('aria-labelledby')).toBe(false);
  });
  it('throws a descriptive error when rendered outside <Fieldset.Root>', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render('orphan-legend')).toThrow('Base UI: FieldsetRootContext is missing. Fieldset parts must be placed within <Fieldset.Root>.');
  });
});
