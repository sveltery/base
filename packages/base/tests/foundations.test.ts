import { describe, expect, it } from 'vitest';
import { createChangeEventDetails, createGenericEventDetails } from '../src/lib/index.js';
import { mergeProps, type PreventableEvent } from '../src/lib/merge-props/index.js';

describe('event details (new Sveltery regression coverage)', () => {
  it('preserves event, reason, trigger, and independent cancellation/propagation', () => {
    const event = new Event('keydown');
    const details = createChangeEventDetails('escape-key', event as KeyboardEvent);
    expect(details.event).toBe(event);
    expect(details.reason).toBe('escape-key');
    expect(details.trigger).toBeUndefined();
    expect(details.isCanceled).toBe(false);
    expect(details.isPropagationAllowed).toBe(false);
    details.cancel();
    expect(details.isCanceled).toBe(true);
    expect(details.isPropagationAllowed).toBe(false);
    details.allowPropagation();
    expect(details.isPropagationAllowed).toBe(true);
    expect(event.defaultPrevented).toBe(false);
  });
  it('preserves custom properties and creates generic details', () => {
    expect(createGenericEventDetails('keyboard', undefined, { value: 3 })).toMatchObject({
      reason: 'keyboard',
      value: 3,
    });
  });
});

describe('mergeProps (new Sveltery regression coverage; upstream ports pending)', () => {
  it('runs handlers right to left and preserves their result', () => {
    const log: string[] = [];
    const props = mergeProps(
      {
        onclick: () => {
          log.push('internal');
        },
      },
      {
        onclick: () => {
          log.push('external');
          return 42;
        },
      },
    );
    const handler = props.onclick as (event: Event) => unknown;
    expect(handler(new Event('click'))).toBe(42);
    expect(log).toEqual(['external', 'internal']);
  });
  it('cancels internal handling separately from preventDefault', () => {
    let called = false;
    const props = mergeProps(
      {
        onclick: () => {
          called = true;
        },
      },
      { onclick: (event: PreventableEvent) => event.preventBaseUIHandler() },
    );
    const event = new Event('click', { cancelable: true });
    (props.onclick as (event: Event) => void)(event);
    expect(called).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });
  it('preventDefault does not prevent the internal handler', () => {
    let called = false;
    const props = mergeProps(
      {
        onclick: () => {
          called = true;
        },
      },
      { onclick: (event: Event) => event.preventDefault() },
    );
    (props.onclick as (event: Event) => void)(new Event('click', { cancelable: true }));
    expect(called).toBe(true);
  });
  it('runs all custom-payload callbacks without adding event cancellation methods', () => {
    const log: string[] = [];
    const payload = { target: 'custom model', preventDefault() {} };
    const props = mergeProps(
      {
        onChange: () => {
          log.push('internal');
        },
      },
      {
        onChange: (value: typeof payload & Partial<PreventableEvent>) => {
          log.push('external');
          value.preventBaseUIHandler?.();
          return 42;
        },
      },
    );
    expect((props.onChange as (value: typeof payload) => unknown)(payload)).toBe(42);
    expect(log).toEqual(['external', 'internal']);
    expect(Object.hasOwn(payload, 'preventBaseUIHandler')).toBe(false);
    expect(Object.hasOwn(payload, 'baseUIHandlerPrevented')).toBe(false);
  });
  it('accepts frozen custom payloads that resemble native events', () => {
    const log: string[] = [];
    const payload = Object.freeze({ target: 'custom model', preventDefault() {} });
    const props = mergeProps(
      {
        onChange: (value: unknown) => {
          expect(value).toBe(payload);
          log.push('internal');
        },
      },
      {
        onChange: (value: unknown) => {
          expect(value).toBe(payload);
          log.push('external');
        },
      },
    );
    expect(() => (props.onChange as (value: unknown) => void)(payload)).not.toThrow();
    expect(log).toEqual(['external', 'internal']);
  });
  it('concatenates class in right-to-left order, merges style and overwrites ordinary props', () => {
    expect(
      mergeProps(
        { class: 'internal', style: { color: 'blue', display: 'block' }, id: 'old' },
        { class: 'external', style: { color: 'red' }, id: 'new' },
      ),
    ).toEqual({ class: 'external internal', style: { color: 'red', display: 'block' }, id: 'new' });
  });
  it('retains handlers when the external handler is undefined', () => {
    let called = false;
    const props = mergeProps(
      {
        onclick: () => {
          called = true;
        },
      },
      { onclick: undefined },
    );
    (props.onclick as () => void)();
    expect(called).toBe(true);
  });
  it('lets prop getters own handler chaining', () => {
    const external = () => 42;
    const props = mergeProps({ id: 'internal', onclick: () => 0 }, (previous) => ({
      ...previous,
      onclick: external,
    }));
    expect(props.onclick).toBe(external);
    expect(props.id).toBe('internal');
  });
});
