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

The complete typed remote API and real boolean control adapters are being developed in follow-up scope. Native remote descriptors/attachments are forwarded, but installed SvelteKit 2.70.3 ignores a prior canceled submit event. Invalid/canceled zero POST followed by a valid positive POST is an unresolved remote integration requirement. This source core does not claim that requirement solved; no URL guard, propagation suppression, activation replay or private Kit patch is present.

[Source correspondence](../parity/field-form/source-correspondence.md), [immutable ordinary inventory](../parity/field-form/README.md) and native Input reference suites separate source bodies, framework differences, supplements and pending final review. Current ordinary declaration credit remains zero. React17/Activity/lifecycle and downstream control assertions remain explicitly classified, and complete module/library parity is not claimed.
