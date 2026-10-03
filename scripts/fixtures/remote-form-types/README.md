# Remote form type consumers

These compile-time consumers use the installed public SvelteKit 2.70.3 declarations and an isolated packed Sveltery package. They verify correlated logical field names, control types and `.as()` arguments, nested object/array paths, helper-name collisions, two independently bound schemas, manual descriptor spreads and input/output distinctions. The full tuple form forwards extra public accessor arguments without a copied type map.

`Positive.svelte` narrows the actual source Root's component type through `RemoteFieldRootProps`; it does not execute a remote form. `Negative.svelte` contains one marked invalid use per line. The runner requires an actual compiler error at every marked use and rejects errors elsewhere. These type-only checks establish no runtime integration, source parity or browser acceptance.

```sh
pnpm --filter @sveltery/base build
bash scripts/check-remote-form-types.sh
# After the public Form and Field entries and type reexports are integrated:
bash scripts/check-remote-form-types.sh --public
```

The runtime Form snippet must use `TypedField<NoInfer<Remote['fields']>>` so consumer props cannot widen the schema inferred from `remote`. Its actual component consumers will be checked by the remote API integration before acceptance. A globally imported Field remains available for external form libraries and has no inferred parent schema.
