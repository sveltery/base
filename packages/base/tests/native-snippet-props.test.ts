// Pure Source prop business remains active after renderer API retirement; supplemental only.
import { expect, it, vi } from 'vitest';
import { mergeComponentProps } from '../src/lib/internals/mergeComponentProps.js';
it('keeps source state attributes, falsy omission, inherited keys and explicit mappings', () => {
  const state = Object.assign(Object.create({ inheritedName: 'yes' }), {
    camelCase: true,
    no: false,
    zero: 0,
    nan: NaN,
    blank: '',
    nil: null,
    custom: true,
  });
  const props = mergeComponentProps(state, {}, undefined, {
    custom: () => null,
  });
  expect(props['data-camelcase']).toBe('');
  expect(props['data-inheritedname']).toBe('yes');
  for (const key of ['no', 'zero', 'nan', 'blank', 'nil', 'custom'])
    expect(props).not.toHaveProperty(`data-${key}`);
  expect(
    mergeComponentProps({ active: true }, {}, { 'data-active': 'author' })['data-active'],
  ).toBe('author');
  expect(mergeComponentProps({ active: true }, {}, undefined, false)).toEqual({});
});
it('preserves exact state identity, source getter replacement and component class/style precedence', () => {
  const state = { active: true };
  const first = vi.fn(),
    second = vi.fn();
  const getter = vi.fn((previous) => {
    expect(previous.id).toBe('before');
    return {
      id: 'after',
      class: 'internal',
      style: 'padding:10px',
      onclick: second,
    };
  });
  const className = vi.fn((current) => {
    expect(current).toBe(state);
    return 'active';
  });
  const style = vi.fn((current) => {
    expect(current).toBe(state);
    return 'color:red';
  });
  const props = mergeComponentProps(state, { class: className, style }, [
    { id: 'before', onclick: first },
    getter,
  ]);
  expect(props.id).toBe('after');
  expect(props.class).toBe('active internal');
  expect(props.style).toBe('padding:10px;color:red');
  expect(props.onclick).toBe(second);
  (props.onclick as () => void)();
  expect(first).not.toHaveBeenCalled();
  expect(second).toHaveBeenCalledOnce();
});
