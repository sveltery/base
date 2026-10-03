/** Type-only SvelteKit remote-form integration. No Kit dependency is required by the library. */
import type { Component } from 'svelte';
import type { FieldRootProps } from '../field/types.js';

/** Keep the original remote object for its live, non-enumerable field metadata. */
export interface RemoteFormLike {
  readonly fields: object;
}

type FieldAccessor = { as(...args: never[]): unknown };
type IsAny<T> = 0 extends (1 & T) ? true : false;

/** Derive control choices and arguments from the accessor rather than duplicating Kit's type map. */
export type RemoteFieldArguments<Accessor> = Accessor extends {
  as: infer As extends (...args: never[]) => unknown;
} ? Parameters<As> : never;

type JoinPath<Path extends string, Key extends string | number> = Key extends number
  ? `${Path}[${Key}]`
  : Path extends '' ? `${Key}` : `${Path}.${Key}`;

type FieldSelections<Fields, Path extends string = ''> = IsAny<Fields> extends true
  ? { name: Path extends '' ? string : Path; as?: string | readonly unknown[]; value?: unknown }
  : string extends keyof Fields
    ? { name: Path extends '' ? string : `${Path}.${string}`; as?: string | readonly unknown[]; value?: unknown }
    : (Fields extends FieldAccessor
      ? Path extends '' ? never : { name: Path } & Selection<RemoteFieldArguments<Fields>>
      : never) | {
        [Key in keyof Fields & (string | number)]: Fields[Key] extends object
          ? FieldSelections<Fields[Key], JoinPath<Path, Key>>
          : never;
      }[keyof Fields & (string | number)];

type Shorthand<Arguments> = Arguments extends readonly [infer Type extends string, ...infer Rest]
  ? Rest extends []
    ? { as: Type; value?: never }
    : Rest extends [infer Value, ...infer Additional]
      ? [] extends Additional ? { as: Type; value: Value } : never
      : never
  : never;

type Selection<Arguments> = Arguments extends readonly unknown[]
  ? Shorthand<Arguments> | { as: Readonly<Arguments>; value?: never } | { as?: undefined; value?: never }
  : never;

/** Logical leaf names use Kit's dotted object paths and bracketed array indices. */
export type RemoteFieldName<Fields> = FieldSelections<Fields> extends infer Selected
  ? Selected extends { name: infer Name extends string } ? Name : never
  : never;

/** A field name selects the allowed `.as()` argument tuples for that exact accessor. */
export type RemoteFieldRootProps<Fields> = Omit<FieldRootProps, 'name' | 'as' | 'value'> & {
  name: string;
  as?: string | readonly unknown[];
  value?: unknown;
} & FieldSelections<Fields>;

/** Other parts keep their real component types; only Root is narrowed by the remote fields. */
export type TypedField<Fields, Namespace = typeof import('../field/index.parts.js')> = Omit<Namespace, 'Root'> & {
  Root: Component<RemoteFieldRootProps<Fields>>;
};
