<script lang="ts">
  import { Form, Radio, RadioGroup, Switch } from '../../src/lib/index.js';
  // @ts-expect-error Actual installed Kit helper has no declarations; test-only runtime probe.
  import { create_field_proxy, deep_set } from '../../../../apps/fixtures/node_modules/@sveltejs/kit/src/runtime/form-utils.js';
  let { submitted }: { submitted: (values: Record<string, unknown>) => void } = $props();
  let owner = $state<Record<string, unknown>>({ enabled: false, choice: 3 });
  let visible = $state(true), disabled = $state(false), labelSuffix = $state('initial');
  let switchControl = $state<HTMLElement | null>(), switchRoot = $state<HTMLElement | null>();
  let firstControl = $state<HTMLElement | null>(), firstRoot = $state<HTMLElement | null>();
  let secondControl = $state<HTMLElement | null>(), secondRoot = $state<HTMLElement | null>();
  const checkedChanges: boolean[] = [], radioChanges: unknown[] = [];
  const fields = create_field_proxy({}, () => owner, (path: (string | number)[], value: unknown) => {
    if (path.length === 0) owner = value as Record<string, unknown>;
    else deep_set(owner, path.map(String), value);
  }, () => ({}));
  const remote = { fields };
  export function replaceValues(values: Record<string, unknown>) { fields.set(values); }
  export function setDisabled(value: boolean) { disabled = value; }
  export function renameLabels() { labelSuffix = 'updated'; }
  export function show(value: boolean) { visible = value; }
  export function snapshot() {
    return { switchControl, switchRoot, firstControl, firstRoot, secondControl, secondRoot,
      owner: fields.value(), checkedChanges: [...checkedChanges], radioChanges: [...radioChanges] };
  }
</script>
<Form {remote} onFormSubmit={submitted}>
  {#snippet children(Field)}
    {#if visible}
      <Field.Root name="enabled" as="checkbox" {disabled}>
        <Field.Label id="enabled-label-initial">Enabled</Field.Label>
        <span id={`enabled-override-${labelSuffix}`}>Enabled override</span>
        <Field.Control bind:ref={switchControl} onCheckedChange={(checked) => {
          checkedChanges.push(checked); fields.enabled.set(checked);
        }} aria-labelledby={labelSuffix === 'initial' ? undefined : `enabled-override-${labelSuffix}`}>
          {#snippet render(props)}
            <Switch.Root {...props} bind:ref={switchRoot} data-control="switch"><Switch.Thumb /></Switch.Root>
          {/snippet}
        </Field.Control>
      </Field.Root>
      <Field.Root name="choice" {disabled}>
        <Field.Label id="choice-label-initial">Choice</Field.Label>
        <span id={`choice-override-${labelSuffix}`}>Choice override</span>
        <RadioGroup value={fields.choice.value() ?? null} onValueChange={(value) => {
          radioChanges.push(value); fields.choice.set(value);
        }}>
          <Field.Control {...fields.choice.as('radio', 3)} name={fields.choice.as('number').name} bind:ref={firstControl}
            aria-labelledby={labelSuffix === 'initial' ? undefined : `choice-override-${labelSuffix}`}>
            {#snippet render(props)}
              <Radio.Root {...props} value={props.value} bind:ref={firstRoot} data-control="first" />
            {/snippet}
          </Field.Control>
          <Field.Control {...fields.choice.as('radio', 4)} name={fields.choice.as('number').name} bind:ref={secondControl}
            aria-labelledby={labelSuffix === 'initial' ? undefined : `choice-override-${labelSuffix}`}>
            {#snippet render(props)}
              <Radio.Root {...props} value={props.value} bind:ref={secondRoot} data-control="second" />
            {/snippet}
          </Field.Control>
        </RadioGroup>
      </Field.Root>
    {/if}
  {/snippet}
</Form>
