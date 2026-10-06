// Seven exact upstream type assertions and one expected error, adapted to Svelte component calls.
// Source: AccordionRoot.spec.tsx, Base UI v1.8.0; MIT: parity/accordion/UPSTREAM_LICENSE.
import { Accordion, type AccordionRootProps } from '../src/lib/accordion/index.js';
import { expectType } from './expect-type.js';

// These calls are compile-time probes only. The internals argument is never used at runtime.
export function verifyAccordionTypes() {
  const internals = undefined as never;
  const stringValues = ['a'];
  const nullableValues: (string | null)[] = ['a', null];
  Accordion.Root(internals, {
    value: stringValues,
    onValueChange: (value) => {
      expectType<string[], typeof value>(value);
    },
  });
  Accordion.Root(internals, {
    defaultValue: [1],
    onValueChange: (value) => {
      expectType<number[], typeof value>(value);
    },
  });
  Accordion.Root<'a' | 'b'>(internals, { value: ['a'] });
  Accordion.Root<'a' | 'b'>(internals, {
    onValueChange: (value) => {
      expectType<('a' | 'b')[], typeof value>(value);
    },
  });
  Accordion.Root<string | null>(internals, {
    value: nullableValues,
    onValueChange: (value) => {
      expectType<(string | null)[], typeof value>(value);
    },
  });
  Accordion.Root(internals, {
    onValueChange: (value) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Preserve upstream's permissive generic default.
      expectType<any[], typeof value>(value);
    },
  });
  // @ts-expect-error value must match explicit generic type
  Accordion.Root<'a' | 'b'>(internals, { value: ['c'] });
  type AccordionChangeHandler = NonNullable<AccordionRootProps<'a'>['onValueChange']>;
  type AccordionDefaultChangeHandler = NonNullable<AccordionRootProps['onValueChange']>;
  const handleValueChange: AccordionChangeHandler = (value) => {
    expectType<'a'[], typeof value>(value);
  };
  Accordion.Root<'a'>(internals, { onValueChange: handleValueChange });
  const handleDefaultValueChange: AccordionDefaultChangeHandler = (value) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Preserve upstream's permissive generic default.
    expectType<any[], typeof value>(value);
  };
  Accordion.Root(internals, { onValueChange: handleDefaultValueChange });
}

export function Wrapper<Value>(props: AccordionRootProps<Value>) {
  return Accordion.Root(undefined as never, props);
}
