// Actual native control business invalidation; supplemental, zero unchanged Source credit.
import { expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import LateField from './NativeLateFieldFixture.svelte';
import GroupedCheckbox from './NativeGroupedIndeterminateFixture.svelte';

it('refreshes a later mounted Field control name, explicit invalidity and live validity in Form registration', async () => {
  const target = document.createElement('main');
  document.body.append(target);
  const app = mount(LateField, { target });
  flushSync();
  await tick();
  const form = target.querySelector<HTMLFormElement>('#native-late-form')!;
  function submit() {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    flushSync();
  }
  try {
    expect(app.snapshot().input).toBeUndefined();
    app.show();
    flushSync();
    await tick();
    const input = target.querySelector<HTMLInputElement>('#native-late-control')!;
    expect(app.snapshot().input).toBe(input);
    expect(target.querySelector('label')?.htmlFor).toBe(input.id);
    submit();
    expect(app.snapshot().submitted).toEqual([{ first: 'seed' }]);
    app.rename('second');
    flushSync();
    await tick();
    expect(input.name).toBe('second');
    submit();
    expect(app.snapshot().submitted).toEqual([{ first: 'seed' }, { second: 'seed' }]);
    app.setInvalid(true);
    flushSync();
    await tick();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    submit();
    expect(app.snapshot().submitted).toHaveLength(2);
    app.setInvalid(undefined);
    flushSync();
    await tick();
    input.value = 'blocked';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    flushSync();
    await tick();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(target.querySelector('#native-late-error')?.textContent).toBe('Blocked value');
    submit();
    expect(app.snapshot().submitted).toHaveLength(2);
    input.value = 'accepted';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    flushSync();
    await tick();
    submit();
    expect(app.snapshot().submitted.at(-1)).toEqual({ second: 'accepted' });
    app.hide();
    flushSync();
    await tick();
    expect(app.snapshot().input).toBeNull();
    submit();
    expect(app.snapshot().submitted.at(-1)).toEqual({});
  } finally {
    await unmount(app);
    target.remove();
  }
});

it('reasserts grouped indeterminate state after real native checkbox activation changes checked state', async () => {
  const target = document.createElement('main');
  document.body.append(target);
  const app = mount(GroupedCheckbox, { target });
  flushSync();
  await tick();
  try {
    const input = app.snapshot().input!;
    const host = target.querySelector<HTMLElement>('[role=checkbox]')!;
    expect(input.indeterminate).toBe(true);
    expect(input.checked).toBe(false);
    expect(host.getAttribute('aria-checked')).toBe('mixed');
    input.click();
    flushSync();
    await tick();
    expect(input.checked).toBe(true);
    expect(input.indeterminate).toBe(true);
    expect(host.getAttribute('aria-checked')).toBe('mixed');
    expect(app.snapshot().changes).toEqual([['choice']]);
    input.click();
    flushSync();
    await tick();
    expect(input.checked).toBe(false);
    expect(input.indeterminate).toBe(true);
    expect(app.snapshot().changes).toEqual([['choice'], []]);
  } finally {
    await unmount(app);
    target.remove();
  }
});
