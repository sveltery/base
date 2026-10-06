<script lang="ts">
  // Native value/association supplements for the actual source families. MIT.
  import { Radio } from '../../src/lib/radio/index.js';
  import { RadioGroup } from '../../src/lib/radio-group/index.js';
  import { Field } from '../../src/lib/field/index.js';
  import { Form } from '../../src/lib/form/index.js';
  let { onSubmit }: { onSubmit?: (values: Record<string, unknown>) => void } = $props();
  const object = { storage: 'cloud', size: 42 };
  const ObjectGroup = RadioGroup<typeof object>;
  const ObjectRadio = Radio.Root<typeof object>;
  const NullGroup = RadioGroup<null | string>;
  const NullRadio = Radio.Root<null | string>;
</script>

<form id="external-form"></form>
<Form id="owner-form" onFormSubmit={(values) => onSubmit?.(values)}>
  <Field.Root name="external">
    <RadioGroup defaultValue="a" form="external-form">
      <label for="external-option">External option</label>
      <Radio.Root value="a" id="external-option" data-testid="external-radio" />
      <Radio.Root value="b" />
    </RadioGroup>
  </Field.Root>
  <Field.Root name="object">
    <ObjectGroup defaultValue={object}>
      <ObjectRadio value={object} data-testid="object-radio" />
    </ObjectGroup>
  </Field.Root>
  <Field.Root name="nullable">
    <NullGroup defaultValue={null}>
      <NullRadio value={null} data-testid="null-radio" />
      <NullRadio value="a" data-testid="nonnull-radio" />
    </NullGroup>
  </Field.Root>
</Form>
<Radio.Root value="" data-testid="standalone-radio"><Radio.Indicator /></Radio.Root>
