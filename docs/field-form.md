# Field, Form and Fieldset

Field supplies shared validation, labels, descriptions, error messages and interaction state around controls. Input is the thin original composition of Field.Control. Form provides the source registry, optional validation modes, custom validators, external errors and submit callbacks. Fieldset supplies inherited disabled state and legend association.

```svelte
<script>
  import { Field, Form, Input, Fieldset } from '@sveltery/base';
</script>
<Form onFormSubmit={(values) => console.log(values)}>
  <Fieldset.Root>
    <Fieldset.Legend>Account</Fieldset.Legend>
    <Field.Root name="email" validationMode="onBlur">
      <Field.Label>Email</Field.Label>
      <Input type="email" required />
      <Field.Description>Use an address you check regularly.</Field.Description>
      <Field.Error />
    </Field.Root>
  </Fieldset.Root>
  <button type="submit">Save</button>
</Form>
```

Use native props, class/style state callbacks, bindable refs and the source render snippet API. Native Svelte owns input value/checked/default/reset/hydration behavior. Field.Control has a string change callback; it is not a generic state engine for every control family. Label/Description/Error associations use the actual shared LabelableProvider and registration helpers. Validation reads native constraints and preserves the pinned dirty/touched/filled/focused, custom validity, asynchronous result and disabled rules.

Form validation is optional. `validationMode` controls source onSubmit/onBlur/onChange behavior; `validate` on Field.Root supplies custom validation, and `errors` on Form supplies authoritative external messages. The source synchronous submit flow validates registered fields, focuses the first invalid control, prevents default and returns. Asynchronous validators update reporting later and do not synchronously stop the original submit event. Native `onsubmit`, consolidated `onFormSubmit`, imperative actions and replacement render snippets remain available.

The complete typed remote API and real boolean control adapters are follow-up scope in [PR52](https://github.com/sveltery/base/pull/52). Native remote descriptors/attachments are forwarded. Installing Base does not patch Kit; unpatched SvelteKit2.70.3 ignores a prior canceled submit event. The separate version-specific [explicit compatibility opt-in proposed in PR49](https://github.com/sveltery/base/pull/49) is required for that synchronous cancellation contract; its setup, later-listener and asynchronous-validation limits remain separate from the source core. Invalid/canceled zero POST followed by a valid positive POST remains an acceptance requirement. This core includes no Kit patch, URL guard, propagation suppression or activation replay, and claims no remote/B2 completion.

[Source correspondence](../parity/field-form/source-correspondence.md), [immutable ordinary inventory](../parity/field-form/README.md) and native Input reference suites separate source bodies, framework differences, supplements and execution evidence. The source/type repair `8619e34` received a clean independent full-closure source/native/maintainability review. Local/public build, type, runtime, SSR/hydration and packed-consumer gates pass; the runtime-identical `8438374` checkpoint passed [442 source browser cases](https://github.com/sveltery/base/actions/runs/37099273060) and [all eight CI jobs including 2,020 combined cases](https://github.com/sveltery/base/actions/runs/37099273059). Documentation/status-metadata successors preserve those runtime/type/assertion bytes and original provenance hashes; merge approval is still pending. Current ordinary declaration credit remains zero. React17/Activity/lifecycle and downstream control assertions remain explicitly classified, and complete module/library parity is not claimed.
