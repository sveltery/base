<script lang="ts">
  // Complete pinned Field Error/Validity/Item fixture adaptations; MIT: parity/field-form/UPSTREAM_LICENSE.
  import type { HTMLAttributes } from 'svelte/elements';
  import { Field } from '../../src/lib/field/index.js';
  import { Form } from '../../src/lib/form/index.js';
  import type { FieldRootProps, FieldValidityState, FieldItemState } from '../../src/lib/field/types.js';
  let { scenario, validationMode = 'onSubmit', validate, handleValidity, renderItem }: {
    scenario: string; validationMode?: 'onBlur' | 'onSubmit'; validate?: FieldRootProps['validate'];
    handleValidity?: (state: FieldValidityState) => void; renderItem?: (state: FieldItemState) => void;
  } = $props();
  function observeValidity(state: FieldValidityState) { handleValidity?.(state); return ''; }
  function observeItem(state: FieldItemState) { renderItem?.(state); return ''; }
</script>
{#snippet itemRender(props: Record<string | symbol, unknown>, state: FieldItemState)}{observeItem(state)}<div {...props as HTMLAttributes<HTMLDivElement>}></div>{/snippet}
{#snippet validity()}
  <Field.Validity>{#snippet children(state)}{observeValidity(state)}{/snippet}</Field.Validity>
{/snippet}
{#snippet validityField()}
  <Field.Root {validationMode} {validate}>
    <Field.Control required={scenario === 'validity-stale' || scenario === 'validity-required'} />
    {#if scenario === 'validity-stale'}<Field.Error match="valueMissing">Required</Field.Error>{/if}
    {@render validity()}
  </Field.Root>
{/snippet}
{#if scenario.startsWith('validity-')}
  {#if scenario === 'validity-stale' || validationMode === 'onSubmit'}
    <Form>{@render validityField()}<button type="submit">submit</button></Form>
  {:else}{@render validityField()}{/if}
{:else if scenario === 'item-disabled'}
  <Field.Root><Field.Item disabled data-testid="item" render={itemRender} /></Field.Root>
{:else if scenario === 'error-aria'}
  <Field.Root invalid><Field.Control /><Field.Error match>Message</Field.Error></Field.Root>
{:else if scenario === 'error-show'}
  <Form><Field.Root><Field.Control required /><Field.Error>Message</Field.Error></Field.Root><button type="submit">submit</button></Form>
{:else if scenario === 'error-constraint'}
  <Form><Field.Root><Field.Control required minlength={2} /><Field.Error match="valueMissing">Message</Field.Error></Field.Root><button type="submit">submit</button></Form>
{:else if scenario === 'error-custom'}
  <Form><Field.Root validate={() => 'error'}><Field.Control /><Field.Error match="customError">Message</Field.Error></Field.Root><button type="submit">submit</button></Form>
{:else if scenario === 'error-form-false' || scenario === 'error-form-omitted'}
  <Form errors={{ username: 'Username is reserved' }}>
    <Field.Root name="username">
      <Field.Control defaultValue="admin" required minlength={8} pattern="[a-z]+" />
      <Field.Error match="valueMissing">Username is required.</Field.Error>
      <Field.Error match="tooShort">Username must be at least 8 characters.</Field.Error>
      <Field.Error match="patternMismatch">Username can only include lowercase letters.</Field.Error>
      <Field.Error data-testid="default-error" {...(scenario === 'error-form-false' ? { match: false } : {})} />
    </Field.Root>
  </Form>
{:else if scenario === 'error-fallback'}
  <Form errors={{ email: 'Email is already taken' }}><Field.Root><Field.Control name="email" /><Field.Error data-testid="default-error" /></Field.Root></Form>
{:else if scenario === 'error-inherited'}
  <Form errors={{}}><Field.Root name="constructor"><Field.Control /><Field.Error data-testid="default-error" /></Field.Root></Form>
{:else if scenario === 'error-form-list'}
  <Form errors={{ username: ['Username is reserved', 'Username is too short'] }}><Field.Root name="username"><Field.Control defaultValue="admin" /><Field.Error data-testid="default-error" /></Field.Root></Form>
{:else if scenario === 'error-form-single'}
  <Form errors={{ username: ['Username is reserved'] }}><Field.Root name="username"><Field.Control defaultValue="admin" /><Field.Error data-testid="default-error" /></Field.Root></Form>
{:else if scenario === 'error-client-list'}
  <Form><Field.Root validate={() => ['First error', 'Second error']}><Field.Control /><Field.Error data-testid="default-error" /></Field.Root><button type="submit">submit</button></Form>
{:else if scenario === 'error-empty-id'}
  <Field.Root invalid><Field.Control aria-describedby="external-description" /><Field.Error id="">Message</Field.Error></Field.Root>
{:else if scenario === 'error-empty-list'}
  <Form errors={{ username: [] }}><Field.Root name="username"><Field.Control defaultValue="admin" /><Field.Error data-testid="default-error" /></Field.Root></Form>
{:else if scenario === 'error-client-false'}
  <Form><Field.Root><Field.Control required /><Field.Error data-testid="default-error" match={false} /></Field.Root><button type="submit">submit</button></Form>
{:else if scenario === 'error-client-specific'}
  <Form errors={{ username: 'Username is reserved' }}><Field.Root name="username" validate={() => 'Client validation error'}><Field.Control /><Field.Error data-testid="custom-error" match="customError" /><Field.Error data-testid="default-error" /></Field.Root><button type="submit">submit</button></Form>
{:else if scenario === 'error-always'}
  <Field.Root><Field.Control required /><Field.Error match>Message</Field.Error></Field.Root>
{/if}
