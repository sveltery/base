# Checkbox Group

<Subtitle>
  Provides shared state to a series of checkboxes.
</Subtitle>

<Meta name="description" content="Provides shared state to a series of checkboxes." />

<DemoCheckboxGroupHero />

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using `<label>` elements, or the `Field` and `Fieldset` components. See [Labeling a checkbox group](#labeling-a-checkbox-group) and the [forms guide](/handbook/forms).

## Anatomy

Checkbox Group is composed together with [Checkbox](/components/checkbox). Import the components and place them together:

```svelte title="Anatomy"
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';
</script>

<CheckboxGroup>
	<Checkbox.Root />
</CheckboxGroup>
```

## Examples

### Labeling a checkbox group

`<CheckboxGroup>` renders a `<fieldset>`. Name it with a [Fieldset.Legend](/components/fieldset) inside:

```svelte title="Using a legend to label a checkbox group"
<CheckboxGroup>
	<!-- @highlight -->
	<Fieldset.Legend>Allowed network protocols</Fieldset.Legend>
	...
</CheckboxGroup>
```

An enclosing `<label>` is the simplest labeling pattern for each checkbox:

```svelte title="Using an enclosing label to label a checkbox"
<!-- @highlight -->
<label>
	<Checkbox.Root value="http" />
	HTTP
	<!-- @highlight -->
</label>
```

### Using sibling labels

Each `<Checkbox.Root>` renders a real `<input type="checkbox">`, so a sibling `<label>` with `for` works as it does in HTML:

```svelte title="Sibling label pattern"
<CheckboxGroup>
	<Fieldset.Legend>Allowed network protocols</Fieldset.Legend>
	<div>
		<label for="protocol-http">HTTP</label>
		<!-- @highlight-text "id" -->
		<Checkbox.Root id="protocol-http" value="http">
			<Checkbox.Indicator />
		</Checkbox.Root>
	</div>
</CheckboxGroup>
```

### Submitting a plain form

`name` on the group names every child checkbox, as an HTML checkbox group does. Each ticked box submits its own `value`:

```svelte title="A named group in a plain form"
<form method="POST">
	<!-- @highlight-text "name" -->
	<CheckboxGroup name="protocols">
		<Fieldset.Legend>Allowed network protocols</Fieldset.Legend>
		<label><Checkbox.Root value="http" /> HTTP</label>
		<label><Checkbox.Root value="https" /> HTTPS</label>
	</CheckboxGroup>
</form>
```

### Form integration

Use [Field](/components/field) for form integration. Field.Root's `name` names every checkbox in the group, and one Field.Error shows the group's issues:

```svelte title="Using Checkbox Group in a form"
<Form>
	<!-- @highlight -->
	<Field.Root name="allowedNetworkProtocols">
		<CheckboxGroup>
			<Fieldset.Legend>Allowed network protocols</Fieldset.Legend>
			<Field.Item>
				<Field.Label>
					<Checkbox.Root value="http" />
					HTTP
				</Field.Label>
			</Field.Item>
			<Field.Item>
				<Field.Label>
					<Checkbox.Root value="https" />
					HTTPS
				</Field.Label>
			</Field.Item>
			<Field.Item>
				<Field.Label>
					<Checkbox.Root value="ssh" />
					SSH
				</Field.Label>
			</Field.Item>
		</CheckboxGroup>
	</Field.Root>
</Form>
```

### Parent checkbox

A checkbox that controls other checkboxes within a `<CheckboxGroup>` can be created:

1. Bind the group's `value` with `bind:value`
2. Pass an array of all the child checkbox values to the `allValues` prop on the `<CheckboxGroup>` component
3. Add the `parent` boolean prop to the parent `<Checkbox.Root>`

The group controls the parent checkbox's [indeterminate](/components/checkbox#CheckboxRoot-indeterminate) state when some, but not all, child checkboxes are checked.

<DemoCheckboxGroupParent />

### Nested parent checkbox

<DemoCheckboxGroupNested />

## API reference

<script>
	import { DemoCheckboxGroupHero } from './demos/hero';
	import { DemoCheckboxGroupParent } from './demos/parent';
	import { DemoCheckboxGroupNested } from './demos/nested';
	import { TypesCheckboxGroup } from './types';
</script>

<TypesCheckboxGroup />
