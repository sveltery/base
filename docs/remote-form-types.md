# Remote form type contracts

[PR51](https://github.com/sveltery/base/pull/51) provides six type-only exports from `@sveltery/base` and `@sveltery/base/form`. They derive a remote-bound Field contract from the original SvelteKit fields object. The helper module has no runtime Kit dependency and does not create a Field namespace or forward descriptors. The Form children/context implementation is a separate remote API follow-up.

```ts
import type { RemoteFormFields } from '@sveltejs/kit';
import type { RemoteFieldRootProps } from '@sveltery/base/form';

type Fields = RemoteFormFields<{ password: string; remember?: boolean }>;
const password: RemoteFieldRootProps<Fields> = { name: 'password', as: 'text' };
const remember: RemoteFieldRootProps<Fields> = {
  name: 'remember',
  as: 'checkbox',
};
const manual: RemoteFieldRootProps<Fields> = { name: 'password' };
```

This example uses the pinned Kit2.70.3 public type location. Kit3.0.0 declarations are checked separately through their public `$app/server` location.

| Export                                      | Contract                                                                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `RemoteFormLike`                            | Structural original remote object with a readonly `fields` property; intended to retain its live metadata. |
| `RemoteFieldArguments<Accessor>`            | The original accessor's `.as()` parameter tuple.                                                           |
| `RemoteFieldName<Fields, Path?>`            | Finite leaf suggestions, or validation of a supplied literal path into a recursive schema.                 |
| `RemoteFieldRootProps<Fields, Name?>`       | Correlated Root props for typed props objects.                                                             |
| `RemoteFieldRootPropsForName<Fields, Name>` | The supplied-name contract at the native generic component boundary.                                       |
| `TypedField<Fields, Namespace?>`            | The actual namespace's component types with Root's input narrowed by the original fields.                  |

Root's `as="text"` shorthand selects an original accessor option. `value` means the accessor's second argument: it is required or optional exactly as Kit declares, and is unavailable for files or a name-only Root. It does not mean the current controlled input value. A readonly `as` tuple forwards the complete public accessor arguments, including a newer checked argument when present. A dynamic union name can use only options valid for every selected leaf; a correlated props union preserves each name's own selection.

Paths support nested objects and bracketed array indices, such as `addresses[0].city`. Lookup follows Kit's identifier/dot/digit-only bracket grammar. Default name unions suggest canonical nonnegative decimal indices; explicit literal lookup also accepts Kit's digit-only leading-zero spellings. Invalid separators and the submission-rejected segments `__proto__`, `constructor` and `prototype` are excluded at every level. Finite autocomplete stops at repeated recursive containers; actual supplied paths are checked without a library depth limit. The schema input controls field types even when validation transforms the server output.

A name-only typed Root supports manually supplied Control descriptors. A globally imported `Field.Root` retains the ordinary native/source name contract for external libraries and explicit overrides. Other typed namespace parts retain their real component props, and Root keeps its canonical ref binding. These type contracts do not add runtime descriptor context, automatic control dispatch or semantic replacement rendering.

The [public packed consumers](../scripts/fixtures/remote-form-types/README.md) check actual Kit2.70.3 and Kit3.0.0 declarations, valid/manual/native examples and invalid name/selection pairs. Their passing results establish type compatibility only. [Correspondence](../parity/field-form/source-correspondence.md#typed-remote-field-contract-pr51) and [compatibility record F-02](upstream-differences.md#f-02-typed-remote-field-namespace) record the deliberate API substitution, evidence and pending runtime/merge acceptance.
