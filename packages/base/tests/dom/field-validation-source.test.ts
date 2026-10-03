// Complete ordinary native declaration bodies; immutable mapping: parity/field-form/validation-ports.json.
// Every source assertion and ordered input/submit interaction is retained. MIT: parity/field-form/UPSTREAM_LICENSE.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount, type ComponentProps } from 'svelte';
import Fixture from './FieldValidationSourceFixture.svelte';
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); });
function isVisible(element: HTMLElement | null): boolean {
  if (!element) return false;
  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    const style = getComputedStyle(current);
    if (current.hidden || style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || style.opacity === '0') return false;
  }
  return true;
}
function render(scenario: string, props: Partial<ComponentProps<typeof Fixture>> = {}) {
  const host = document.createElement('div'); document.body.append(host);
  const component = mount(Fixture, { target: host, props: { scenario, ...props } }); cleanups.push(() => unmount(component)); flushSync();
  return { textbox: () => host.querySelector<HTMLInputElement>('input')!,
    testId: (id: string) => host.querySelector<HTMLElement>(`[data-testid="${id}"]`),
    text: (text: string) => Array.from(host.querySelectorAll<HTMLElement>('*')).find(node => node.textContent === text && !Array.from(node.children).some(child => child.textContent === text)) ?? null,
    submit() { host.querySelector('button')!.click(); flushSync(); },
    focus() { host.querySelector<HTMLInputElement>('input')!.focus(); flushSync(); },
    blur() { host.querySelector<HTMLInputElement>('input')!.blur(); flushSync(); },
    change(value: string) { const input = host.querySelector<HTMLInputElement>('input')!; input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); flushSync(); },
  };
}
describe('Field.Error immutable ordinary native declarations', () => {
  it('should set aria-describedby on the control automatically', () => {
    const screen = render('error-aria'); expect(screen.textbox().getAttribute('aria-describedby')).toBe(screen.text('Message')!.id);
  });
  it('should show error messages by default', () => {
    const screen = render('error-show'); expect(screen.text('Message')).toBe(null);
    screen.focus(); screen.change('a'); screen.change(''); screen.blur(); expect(screen.text('Message')).toBe(null);
    screen.submit(); expect(screen.text('Message')).not.toBe(null);
  });
  it('should only render when `match` matches constraint validation', () => {
    const screen = render('error-constraint'); expect(screen.text('Message')).toBe(null);
    screen.submit(); expect(screen.text('Message')).not.toBe(null);
    screen.focus(); screen.change('a'); expect(screen.text('Message')).toBe(null);
    screen.change(''); expect(screen.text('Message')).not.toBe(null);
  });
  it('should show custom errors', () => {
    const screen = render('error-custom'); screen.focus(); screen.change('a'); screen.blur(); expect(screen.text('Message')).toBe(null);
    screen.submit(); expect(screen.text('Message')).not.toBe(null);
  });
  it('uses `match={false}` as the default slot for Form errors', () => {
    const screen = render('error-form-false'); expect(screen.text('Username is required.')).toBe(null);
    expect(screen.text('Username must be at least 8 characters.')).toBe(null); expect(screen.text('Username can only include lowercase letters.')).toBe(null);
    expect(screen.testId('default-error')!.textContent).toBe('Username is reserved');
  });
  it('uses an omitted `match` as the default slot for Form errors', () => {
    const screen = render('error-form-omitted'); expect(screen.text('Username is required.')).toBe(null);
    expect(screen.text('Username must be at least 8 characters.')).toBe(null); expect(screen.text('Username can only include lowercase letters.')).toBe(null);
    expect(screen.testId('default-error')!.textContent).toBe('Username is reserved');
  });
  it('uses the Field.Control name fallback for Form errors', () => {
    const screen = render('error-fallback'); expect(screen.textbox().getAttribute('aria-invalid')).toBe('true');
    expect(screen.testId('default-error')!.textContent).toBe('Email is already taken'); screen.change('next@example.com');
    expect(screen.textbox().hasAttribute('aria-invalid')).toBe(false); expect(screen.testId('default-error')).toBe(null);
  });
  it('ignores inherited Form error properties', () => {
    const screen = render('error-inherited'); expect(screen.textbox().hasAttribute('aria-invalid')).toBe(false); expect(screen.testId('default-error')).toBe(null);
  });
  it('renders Form error arrays as a list', () => {
    const screen = render('error-form-list'), list = screen.testId('default-error')!.querySelector('ul');
    expect(list).not.toBe(null); expect(list?.querySelectorAll('li')).toHaveLength(2);
    expect(screen.text('Username is reserved')).not.toBe(null); expect(screen.text('Username is too short')).not.toBe(null);
  });
  it('renders single-item Form error arrays as text', () => {
    const screen = render('error-form-single'); expect(screen.testId('default-error')!.querySelector('ul')).toBe(null); expect(screen.testId('default-error')!.textContent).toBe('Username is reserved');
  });
  it('renders client validation error arrays as a list', () => {
    const screen = render('error-client-list'); screen.submit(); const list = screen.testId('default-error')!.querySelector('ul');
    expect(list).not.toBe(null); expect(list?.querySelectorAll('li')).toHaveLength(2);
    expect(screen.text('First error')).not.toBe(null); expect(screen.text('Second error')).not.toBe(null);
  });
  it('does not register an empty error id', () => {
    const screen = render('error-empty-id'); expect(screen.textbox().getAttribute('aria-describedby')).toBe('external-description');
  });
  it('ignores empty Form error arrays', () => {
    const screen = render('error-empty-list'); expect(screen.testId('default-error')).toBe(null); expect(screen.textbox().hasAttribute('aria-invalid')).toBe(false);
  });
  it('uses `match={false}` as the default slot for client validation errors', () => {
    const screen = render('error-client-false'); expect(screen.testId('default-error')).toBe(null); screen.submit(); expect(screen.testId('default-error')).not.toBe(null);
  });
  it('uses the client validation path for specific matches when Form errors are present', () => {
    const screen = render('error-client-specific'); screen.submit(); expect(screen.testId('custom-error')!.textContent).toBe('Client validation error');
    expect(screen.testId('custom-error')!.textContent).not.toContain('Username is reserved'); expect(screen.testId('default-error')!.textContent).toBe('Username is reserved');
  });
  it('always renders the error message when `match` is true', () => {
    const screen = render('error-always'); expect(screen.text('Message')).not.toBe(null);
  });
});
describe('Field.Item immutable ordinary native declarations', () => {
  it('reflects disabled state on the item', () => {
    const renderItem = vi.fn(), screen = render('item-disabled', { renderItem });
    expect(screen.testId('item')!.hasAttribute('data-disabled')).toBe(true); expect(renderItem.mock.lastCall?.[0].disabled).toBe(true);
  });
});
describe('Field.Validity immutable ordinary native declarations', () => {
  for (const validationMode of ['onBlur', 'onSubmit'] as const) {
    it(`surfaces valueMissing immediately after a stale custom error in ${validationMode} mode`, () => {
      const handleValidity = vi.fn(), validate = vi.fn(() => 'custom error'); const screen = render('validity-stale', { handleValidity, validate, validationMode });
      const establishInvalidState = () => { if (validationMode === 'onBlur') screen.blur(); else screen.submit(); };
      screen.focus(); screen.change('invalid'); establishInvalidState();
      expect(handleValidity.mock.lastCall?.[0].value).toBe('invalid'); expect(handleValidity.mock.lastCall?.[0].validity.customError).toBe(true);
      expect(handleValidity.mock.lastCall?.[0].validity.valueMissing).toBe(false); expect(validate).toHaveBeenCalledTimes(1);
      screen.focus(); screen.change('');
      expect(handleValidity.mock.lastCall?.[0].value).toBe(''); expect(handleValidity.mock.lastCall?.[0].validity.customError).toBe(validationMode === 'onSubmit');
      expect(handleValidity.mock.lastCall?.[0].validity.valueMissing).toBe(true); expect(isVisible(screen.text('Required'))).toBe(true);
      expect(validate).toHaveBeenCalledTimes(validationMode === 'onBlur' ? 1 : 2);
      if (validationMode === 'onBlur') screen.blur(); else screen.submit();
      expect(handleValidity.mock.lastCall?.[0].value).toBe(''); expect(handleValidity.mock.lastCall?.[0].validity.customError).toBe(validationMode === 'onSubmit');
      expect(handleValidity.mock.lastCall?.[0].validity.valueMissing).toBe(true); expect(isVisible(screen.text('Required'))).toBe(true);
    });
  }
  describe('validationMode=onSubmit', () => {
    it('should pass validity data', () => {
      const handleValidity = vi.fn(), screen = render('validity-required', { handleValidity });
      expect(handleValidity.mock.lastCall?.[0].validity.valid).toBe(null); screen.submit();
      expect(handleValidity.mock.lastCall?.[0].validity.valid).toBe(false); expect(handleValidity.mock.lastCall?.[0].validity.valueMissing).toBe(true);
      expect(handleValidity.mock.lastCall?.[0]).toHaveProperty('transitionStatus'); screen.focus(); screen.change('test');
      expect(handleValidity.mock.lastCall?.[0].value).toBe('test'); expect(handleValidity.mock.lastCall?.[0].validity.valid).toBe(true); expect(handleValidity.mock.lastCall?.[0].validity.valueMissing).toBe(false);
    });
  });
  describe('validationMode=onBlur', () => {
    it('should pass validity data', () => {
      const handleValidity = vi.fn(), screen = render('validity-required', { handleValidity, validationMode: 'onBlur' });
      expect(handleValidity.mock.lastCall?.[0].validity.valid).toBe(null); screen.focus(); screen.change('test'); screen.blur();
      expect(handleValidity.mock.lastCall?.[0].value).toBe('test'); expect(handleValidity.mock.lastCall?.[0].validity.valid).toBe(true); expect(handleValidity.mock.lastCall?.[0].validity.valueMissing).toBe(false);
    });
    it('should correctly pass errors when validate function returns a string', () => {
      const handleValidity = vi.fn(), screen = render('validity-custom', { handleValidity, validationMode: 'onBlur', validate: () => 'error' }); screen.focus(); screen.blur();
      expect(handleValidity.mock.lastCall?.[0].error).toBe('error'); expect(handleValidity.mock.lastCall?.[0].errors).toEqual(['error']);
    });
    it('should correctly pass errors when validate function returns an array of strings', () => {
      const handleValidity = vi.fn(), screen = render('validity-custom', { handleValidity, validationMode: 'onBlur', validate: () => ['1', '2'] }); screen.focus(); screen.blur();
      expect(handleValidity.mock.lastCall?.[0].error).toBe('1'); expect(handleValidity.mock.lastCall?.[0].errors).toEqual(['1', '2']);
    });
  });
});
