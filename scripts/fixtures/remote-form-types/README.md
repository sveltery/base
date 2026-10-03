# Remote form type consumers

These compile-time consumers use the installed public SvelteKit 2.70.3 declarations and an isolated packed Sveltery package. They verify correlated logical field names, control types and `.as()` arguments, nested object/array paths, helper-name collisions, two independently bound schemas, manual descriptor spreads and input/output distinctions. The full tuple form forwards extra public accessor arguments without a copied type map.

`TypedRoot.svelte` models the actual compiler-native generic boundary by forwarding a broad runtime Root to the canonical Field.Root. The constructor input carries each schema's exact logical name and `.as()` arguments; its result retains canonical Root props and `bind:ref`. `Positive.svelte` and the recursive consumers bind this compiler-produced component with `TypedField` without casts. These checks do not execute a remote form. `Negative.svelte` and `RecursiveNegative.svelte` contain one marked invalid use per line. The runner requires an actual compiler error at every marked use and rejects errors elsewhere. These type-only checks establish no runtime integration, source parity or browser acceptance.

```sh
pnpm --filter @sveltery/base build
bash scripts/check-remote-form-types.sh
# Public root/subpath type identities:
bash scripts/check-remote-form-types.sh --public
# Optional isolated check of the newer public signatures; does not upgrade the fixtures:
bash scripts/check-remote-form-types.sh --public 3.0.0
```

The runtime Form snippet must use `TypedField<NoInfer<Remote['fields']>>` so consumer props cannot widen the schema inferred from `remote`. Its actual component consumers will be checked by the remote API integration before acceptance. A globally imported Field remains available for external form libraries and has no inferred parent schema.

Finite schema paths supply autocomplete. Recursive schemas stop infinite autocomplete expansion at a repeated container; Root validates each supplied literal path by looking up its actual accessor, with no library depth limit and no broad string-name escape hatch. `RemoteFieldName<Fields, 'children[0].label'>` and `RemoteFieldRootProps<Fields, 'children[0].label'>` expose the same validation for explicit deep-path type aliases. The default `RemoteFieldName<Fields>` enumerates the finite leaf suggestions rather than claiming an infinite recursive union.

Path validation follows Kit's identifier/dot/digit-only bracket grammar. Consumers cover missing separators, empty segments, invalid numeric spellings and valid consecutive brackets for nested arrays. Dynamic union names can use only accessor options valid for every selected leaf; a correlated props union can preserve each name's own control choice. Both native constructor inference and callable signatures are checked.

Default exported name unions suggest canonical nonnegative decimal indices, so negative and exponent literals cannot enter through a broad `number` template. Explicit literal paths still accept all digit-only spellings permitted by Kit, including leading zeroes.

Remote paths also exclude the three segments Kit rejects during submission: `__proto__`, `constructor` and `prototype`. These exclusions apply to ancestor and array-element segments even when present in the schema. Ordinary globally imported Field components retain their native name contract.

The newer Kit 3.0.0 declaration check uses its public type location (`$app/server`) and tests optional defaults and tuple arguments. Runtime behavior remains verified separately against the repository's pinned Kit version; passing newer declarations is not a claim of Kit 3 runtime integration.
