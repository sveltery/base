# Radio Group

<Subtitle>
  Provides shared state to a series of radio buttons.
</Subtitle>

<Meta name="description" content="Provides shared state to a series of radio buttons." />

<DemoRadioHero />

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using `<label>` elements, a `Fieldset.Legend` inside the group, or the `Field` component. See [Labeling a radio group](#labeling-a-radio-group) and the [forms guide](/handbook/forms).

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';
</script>

<RadioGroup>
	<Radio.Root>
		<Radio.Indicator />
	</Radio.Root>
</RadioGroup>
```

## Examples

### Labeling a radio group

`<RadioGroup>` renders a `<fieldset>` with the `radiogroup` role. Name it with a [Fieldset.Legend](/components/fieldset) inside:

```svelte title="Using a legend to label a radio group"
<RadioGroup>
	<!-- @highlight -->
	<Fieldset.Legend>Storage type</Fieldset.Legend>
	<!-- ... -->
</RadioGroup>
```

An enclosing `<label>` is the simplest labeling pattern for each radio:

```svelte title="Using an enclosing label to label a radio button"
<!-- @highlight -->
<label>
	<Radio.Root value="ssd" />
	SSD
	<!-- @highlight -->
</label>
```

### Using sibling labels

Each `<Radio.Root>` renders a real `<input type="radio">` over its box, so a sibling `<label>` with `for` works as it does in HTML. Pass `id` to name the input:

```svelte title="Sibling label pattern"
<RadioGroup defaultValue="ssd">
	<Fieldset.Legend>Storage type</Fieldset.Legend>
	<div>
		<label for="storage-type-ssd">SSD</label>
		<!-- @highlight-text "id" -->
		<Radio.Root value="ssd" id="storage-type-ssd">
			<Radio.Indicator />
		</Radio.Root>
	</div>
</RadioGroup>
```

### Native attributes and events

Native attributes and handlers such as `oninput`, `onchange` and `aria-*` go to each radio's input. `class` and `style` go to the box you see, and `host` takes any other attribute for the box. The inputs fire real `input` and `change` events that bubble through the group, so read the radio that changed from `event.target` instead of a change callback:

```svelte title="Reading the selected value"
<RadioGroup
	bind:value
	onchange={(event) => console.log((event.target as HTMLInputElement).value)}
>
	<Fieldset.Legend>Storage type</Fieldset.Legend>
	<label><Radio.Root value="ssd" /> SSD</label>
	<label><Radio.Root value="hdd" /> HDD</label>
</RadioGroup>
```

To stop a change, call `event.preventDefault()` in a radio's `onclick`, as with a native radio.

### Submitting a plain form

`name` on the group names every radio, as an HTML radio group does. The selected radio submits its own `value`:

```svelte title="A named group in a plain form"
<form method="POST">
	<!-- @highlight-text "name" -->
	<RadioGroup name="storageType" defaultValue="ssd">
		<Fieldset.Legend>Storage type</Fieldset.Legend>
		<label><Radio.Root value="ssd" /> SSD</label>
		<label><Radio.Root value="hdd" /> HDD</label>
	</RadioGroup>
</form>
```

Radios that share a name get single selection and arrow keys from the browser, also before JavaScript runs. A group without a `name` generates one, so it behaves the same. Inside a remote form, an unnamed group stays unnamed, because SvelteKit rejects a named input it does not know.

### Form integration

Use [Field](/components/field) for form integration. Field.Root's `name` names every radio in the group, and one Field.Error shows the group's issues. With a remote form, spread each option on its radio:

```svelte title="Using Radio Group in a form"
<Form form={settings}>
	<!-- @highlight -->
	<Field.Root name="storageType">
		<RadioGroup>
			<Fieldset.Legend>Storage type</Fieldset.Legend>
			<Field.Item>
				<Field.Label>
					<Radio.Root {...settings.fields.storageType.as('radio', 'ssd')} />
					SSD
				</Field.Label>
			</Field.Item>
			<Field.Item>
				<Field.Label>
					<Radio.Root {...settings.fields.storageType.as('radio', 'hdd')} />
					HDD
				</Field.Label>
			</Field.Item>
		</RadioGroup>
		<Field.Error />
	</Field.Root>
</Form>
```

Without a remote form, use the same markup with `<Radio.Root value="ssd" />` in place of each spread.

## API reference

<script>
	import { DemoRadioHero } from './demos/hero';
	import { TypesRadioGroup } from './types';
</script>

### RadioGroup

<TypesRadioGroup.RadioGroup />

### Root

<TypesRadioGroup.Root />

### Indicator

<TypesRadioGroup.Indicator />
