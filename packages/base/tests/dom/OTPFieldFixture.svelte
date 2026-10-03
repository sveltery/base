<script lang="ts">
  // Assertion fixture adapter for pinned Base UI 1.8.0 OTP Field (MIT).
  import { untrack, type Snippet } from "svelte";
  import type { HTMLProps } from "../../src/lib/internals/types.js";
  import { OTPField } from "../../src/lib/otp-field/index.js";
  import { Field } from "../../src/lib/field/index.js";
  import { Form } from "../../src/lib/form/index.js";
  import { DirectionProvider } from "../../src/lib/direction-provider/index.js";
  import type {
    OTPFieldRootProps,
    OTPFieldInputProps,
    OTPFieldRootChangeEventDetails,
    OTPFieldRootState,
  } from "../../src/lib/otp-field/types.js";
  import type { FieldRootProps } from "../../src/lib/field/types.js";
  import type { HTMLAttributes, HTMLInputAttributes } from "svelte/elements";
  let {
    rootProps = {},
    slotProps = {},
    length = 6,
    count = length,
    withField = false,
    fieldProps = {},
    controlled = false,
    accept = true,
    cancel = false,
    deferred = false,
    initial = "",
    rtl = false,
    customRender = false,
    grouped = false,
    onChange,
    onInvalid,
    onComplete,
    onSubmit,
  }: {
    rootProps?: Partial<OTPFieldRootProps>;
    slotProps?: OTPFieldInputProps;
    length?: number;
    count?: number;
    withField?: boolean;
    fieldProps?: FieldRootProps;
    controlled?: boolean;
    accept?: boolean;
    cancel?: boolean;
    deferred?: boolean;
    initial?: string;
    rtl?: boolean;
    customRender?: boolean;
    grouped?: boolean;
    onChange?: OTPFieldRootProps["onValueChange"];
    onInvalid?: OTPFieldRootProps["onValueInvalid"];
    onComplete?: OTPFieldRootProps["onValueComplete"];
    onSubmit?: (value: unknown) => void;
  } = $props();
  let owner = $state(untrack(() => initial));
  let items = $state(untrack(() => Array.from({ length: count }, (_, i) => i)));
  let alive = $state(true);
  let pending: string | undefined;
  export function setValue(value: string) {
    owner = value;
  }
  export function acceptPending() {
    if (pending !== undefined) owner = pending;
  }
  export function reorder(values: number[]) {
    items = values;
  }
  export function remove() {
    alive = false;
  }
  function change(value: string, details: OTPFieldRootChangeEventDetails) {
    onChange?.(value, details);
    if (cancel) details.cancel();
    if (accept && controlled && !details.isCanceled) {
      if (deferred) pending = value;
      else owner = value;
    }
  }
</script>
{#snippet slots()}
  {#each items as item (item)}
    {#if grouped}<span data-group={item}><OTPField.Input data-slot={item} {...slotProps} /></span>
    {:else if customRender}<OTPField.Input data-slot={item} {...slotProps}>{#snippet render(props, slotState)}<input {...props as HTMLInputAttributes} data-render-index={slotState.index} />{/snippet}</OTPField.Input>
    {:else}<OTPField.Input data-slot={item} {...slotProps} />{/if}
  {/each}
  <OTPField.Separator data-testid="separator" />
{/snippet}
{#snippet rootRender(props: HTMLProps, _state: OTPFieldRootState, children: Snippet | undefined)}<section {...props as HTMLAttributes<HTMLElement>}>{@render children?.()}</section>{/snippet}
{#snippet otp()}
  <OTPField.Root {length} name="fallback" value={controlled ? owner : undefined} defaultValue={initial} {...rootProps} onValueChange={change} onValueInvalid={onInvalid ?? rootProps.onValueInvalid} onValueComplete={onComplete ?? rootProps.onValueComplete} render={customRender ? rootRender : undefined} data-testid="root">
    {@render slots()}
  </OTPField.Root>
{/snippet}
<DirectionProvider direction={rtl ? 'rtl' : 'ltr'}>
  <Form id="form" onFormSubmit={onSubmit}>
    {#if alive}
      {#if withField}
        <Field.Root name="otp" {...fieldProps} data-testid="field">
          <Field.Label id="label">Code</Field.Label>
          <Field.Description id="description">Enter the code</Field.Description>
          {@render otp()}
          <Field.Error data-testid="error" />
        </Field.Root>
      {:else}{@render otp()}{/if}
    {/if}
    <button type="submit" id="submit">Submit</button>
    <button type="button" id="after">After</button>
  </Form>
</DirectionProvider>
