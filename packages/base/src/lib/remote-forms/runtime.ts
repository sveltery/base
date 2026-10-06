import type { FormErrors } from '../form/types.js';
import type { HTMLProps } from '../internals/types.js';

/** Public remote metadata is structural; the library imports no SvelteKit runtime. */
export interface RemoteIssue {
  readonly message: string;
  readonly path: readonly (string | number)[];
}

export type RemoteDescriptor = HTMLProps;
export interface RemoteAccessor {
  as(...args: unknown[]): RemoteDescriptor;
  value(): unknown;
}

/** The same logical dotted/bracketed spelling used by the typed Root name. */
export function remoteFieldPath(path: readonly (string | number)[]): string {
  return path.reduce<string>(
    (name, segment) =>
      typeof segment === 'number' ? `${name}[${segment}]` : name ? `${name}.${segment}` : segment,
    '',
  );
}

export function resolveRemoteAccessor(fields: object, name: string): RemoteAccessor {
  const path = remoteFieldSegments(name);
  let field: unknown = fields;
  for (const segment of path) {
    if (field === null || (typeof field !== 'object' && typeof field !== 'function')) {
      throw new Error(`Sveltery: remote field "${name}" is unavailable.`);
    }
    field = Reflect.get(field, segment);
  }
  if (
    field === null ||
    (typeof field !== 'object' && typeof field !== 'function') ||
    typeof Reflect.get(field, 'as') !== 'function' ||
    typeof Reflect.get(field, 'value') !== 'function'
  ) {
    throw new Error(`Sveltery: remote field "${name}" has no field accessor methods.`);
  }
  return field as RemoteAccessor;
}

/** Public Kit identifier/bracket grammar; numeric indices have one logical spelling. */
export function remoteFieldSegments(name: string): readonly (string | number)[] {
  if (!/^[a-zA-Z_$]\w*(\.[a-zA-Z_$]\w*|\[\d+\])*$/.test(name)) {
    throw new Error(`Sveltery: invalid remote field path "${name}".`);
  }
  const segments = [...name.matchAll(/(?:^|\.)([^.[\]]+)|\[(\d+)\]/g)];
  const path = segments.map((segment) => segment[1] ?? Number(segment[2]));
  // Actual Kit setters reject these segments. Other accessor method names
  // remain valid schema fields and are resolved through the public proxy.
  if (
    path.some(
      (segment) => segment === '__proto__' || segment === 'constructor' || segment === 'prototype',
    )
  ) {
    throw new Error(`Sveltery: unsupported remote field path "${name}".`);
  }
  return path;
}

export function remoteFieldArguments(
  as: string | readonly unknown[] | undefined,
  value: unknown,
): readonly unknown[] | undefined {
  if (as === undefined) return undefined;
  return typeof as === 'string' ? (value === undefined ? [as] : [as, value]) : as;
}

/** Preserve every issue, including root/parent/unmounted paths; no field is guessed. */
export function remoteFormErrors(fields: object): FormErrors | undefined {
  const allIssues = Reflect.get(fields, 'allIssues');
  if (typeof allIssues !== 'function') return undefined;
  const issues = Reflect.apply(allIssues, fields, []) as readonly RemoteIssue[] | undefined;
  if (!issues?.length) return undefined;
  const errors: Record<string, string[]> = Object.create(null);
  for (const issue of issues) {
    const name = remoteFieldPath(issue.path);
    const previous = errors[name];
    errors[name] = previous === undefined ? [issue.message] : [...previous, issue.message];
  }
  return errors;
}
