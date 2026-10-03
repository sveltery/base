/** Type-only SvelteKit remote-form integration. No Kit dependency is required by the library. */
import type { Component, ComponentConstructorOptions, SvelteComponent } from 'svelte';
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

// Only recurse through the finite part of a schema. A recursive branch remains a candidate
// prefix; Root validates its actual supplied name by looking up that path below.
type FieldPaths<Fields, Path extends string = '', Ancestors = never> = IsAny<Fields> extends true
  ? Path extends '' ? string : Path | `${Path}.${string}`
  : string extends keyof Fields
    ? Path extends '' ? string : `${Path}.${string}`
    : (Fields extends FieldAccessor ? Path extends '' ? never : Path : never) |
      (Fields extends Ancestors
        ? `${Path}.${string}`
        : {
          [Key in keyof Fields & (string | number)]: Fields[Key] extends object
            ? FieldPaths<Fields[Key], JoinPath<Path, Key>, Ancestors | Fields>
            : never;
        }[keyof Fields & (string | number)]);

type FieldAtNumber<Fields, Key extends string> = Key extends `${infer Index extends number}`
  ? Index extends keyof Fields ? Fields[Index] : never
  : never;

type FieldAtKey<Fields, Key extends string> = Key extends keyof Fields ? Fields[Key]
  : Key extends `${CanonicalIndex}`
    ? number extends keyof Fields ? Fields[number] : FieldAtNumber<Fields, Key>
    : FieldAtNumber<Fields, Key>;

type HasOnly<Text extends string, Characters extends string> = Text extends '' ? true
  : Text extends `${infer Character}${infer Rest}`
    ? Characters extends `${string}${Character}${string}` ? HasOnly<Rest, Characters> : false
    : false;

// Public name unions suggest Kit's canonical serialized index spelling. The literal
// lookup below still accepts every digit-only spelling allowed by Kit's parser.
type CanonicalIndex = `${bigint}` & ('0' | `${'1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'}${string}`);
type CanonicalName<Path extends string> = Path extends `${infer Head}[${infer Index}]${infer Rest}`
  ? `${Head}[${`${number}` extends Index ? CanonicalIndex : Index}]${CanonicalName<Rest>}`
  : Path;

type IsIdentifier<Text extends string> = string extends Text ? true
  : Text extends `${infer First}${infer Rest}`
    ? 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$' extends `${string}${First}${string}`
      ? HasOnly<Rest, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789'> : false
    : false;

// Kit's logical paths use identifiers and digit-only bracket indices. Keep the symbolic
// number index for autocomplete; each concrete Root name is checked again on lookup.
type IsIndex<Index extends string> = Index extends `${CanonicalIndex}` ? true : `${number}` extends Index ? true
  : Index extends '' ? false : HasOnly<Index, '0123456789'>;

type FieldAtBrackets<Fields, Brackets extends string> = Brackets extends '' ? Fields
  : Brackets extends `[${infer Index}]${infer Rest}`
    ? IsIndex<Index> extends true ? FieldAtBrackets<FieldAtKey<Fields, Index>, Rest> : never
    : never;

type FieldAtSegment<Fields, Segment extends string> = Segment extends `${infer Key}[${infer Rest}`
  ? IsIdentifier<Key> extends true ? FieldAtBrackets<FieldAtKey<Fields, Key>, `[${Rest}`> : never
  : IsIdentifier<Segment> extends true ? FieldAtKey<Fields, Segment> : never;

type FieldAtPath<Fields, Path extends string> = Path extends `${infer Head}.${infer Rest}`
  ? FieldAtPath<FieldAtSegment<Fields, Head>, Rest>
  : FieldAtSegment<Fields, Path>;

type FieldSelection<Fields, Name extends string> = IsAny<FieldAtPath<Fields, Name>> extends true
  ? { as?: string | readonly unknown[]; value?: unknown }
  : Selection<RemoteFieldArguments<FieldAtPath<Fields, Name>>>;

type MatchesEachName<Fields, Name extends string, Option> = Name extends unknown
  ? Option extends FieldSelection<Fields, Name> ? true : false
  : never;

// A union name can use only options valid for every selected leaf. Filter individual
// accessor options instead of intersecting entire unions, which grows exponentially.
type CommonFieldSelection<Fields, Name extends string, Option = FieldSelection<Fields, Name>> = Option extends unknown
  ? false extends MatchesEachName<Fields, Name, Option> ? never : Option
  : never;

type Shorthand<Arguments> = Arguments extends readonly [infer Type extends string, ...infer Rest]
  ? ([] extends Rest ? { as: Type; value?: never } : never) |
    (Rest extends [] | [unknown, unknown, ...unknown[]]
      ? never
      : { as: Type; value: Rest[0] })
  : never;

type Selection<Arguments> = Arguments extends readonly unknown[]
  ? Shorthand<Arguments> | { as: Readonly<Arguments>; value?: never } | { as?: undefined; value?: never }
  : never;

/** Known leaf names; supply a literal Path to validate a deeper recursive schema name. */
export type RemoteFieldName<Fields, Path extends string = FieldPaths<Fields>> = Path extends unknown
  ? [FieldAtPath<Fields, Path>] extends [never] ? never
    : FieldAtPath<Fields, Path> extends FieldAccessor ? CanonicalName<Path> : never
  : never;

/** Props for a supplied literal name, used by the compiler-native generic Root. */
export type RemoteFieldRootPropsForName<Fields, Name extends string> = Omit<FieldRootProps, 'name' | 'as' | 'value'> & {
  name: Name;
  as?: string | readonly unknown[];
  value?: unknown;
} & (
  (Name extends unknown ? { name: Name } & FieldSelection<Fields, NoInfer<Name>> : never) |
  CommonFieldSelection<Fields, NoInfer<Name>>
);

/** A discriminated union for finite schema paths, useful for typed props objects. */
export type RemoteFieldRootProps<Fields, Name extends string = RemoteFieldName<Fields>> = Name extends unknown
  ? RemoteFieldRootPropsForName<Fields, Name>
  : never;

type TypedRoot<Fields extends object> = {
  new<const Name extends FieldPaths<Fields>>(
    options: ComponentConstructorOptions<RemoteFieldRootPropsForName<Fields, Name>>
  ): SvelteComponent<FieldRootProps> & { $$bindings?: 'ref' };
  <const Name extends FieldPaths<Fields>>(
    internals: Parameters<Component>[0],
    props: RemoteFieldRootPropsForName<Fields, Name>
  ): ReturnType<Component>;
};

/** Other parts keep their real component types; only Root is narrowed by the remote fields. */
export type TypedField<Fields extends object, Namespace = typeof import('../field/index.parts.js')> = Omit<Namespace, 'Root'> & {
  Root: TypedRoot<Fields>;
};
