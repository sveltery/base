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

Label the group with `aria-labelledby` and a sibling label element:

```svelte title="Using aria-labelledby to label a checkbox group"
<div id="protocols-label">Allowed network protocols</div>
<CheckboxGroup aria-labelledby="protocols-label">...</CheckboxGroup>
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

### Rendering as a native button

By default, `<Checkbox.Root>` renders a `<span>` element to support enclosing labels. Prefer rendering each checkbox as a native button when using sibling labels (`for`/`id`). Set `nativeButton` and render a `<button>` with the `render` snippet.

```svelte title="Sibling label pattern with a native button"
<div id="protocols-label">Allowed network protocols</div>
<CheckboxGroup aria-labelledby="protocols-label">
	<div>
		<label for="protocol-http">HTTP</label>
		<!-- @highlight-text "nativeButton" -->
		<Checkbox.Root id="protocol-http" value="http" nativeButton>
			<!-- @highlight-text "render" -->
			{#snippet render(props, _state, children)}
				<button type="button" {...props}>{@render children?.()}</button>
			{/snippet}
			<Checkbox.Indicator />
		</Checkbox.Root>
	</div>
</CheckboxGroup>
```

Native buttons with wrapping labels are supported by using the `render` snippet to avoid invalid HTML, so the hidden input is placed outside the label:

```svelte title="Render callback"
<div id="protocols-label">Allowed network protocols</div>
<CheckboxGroup aria-labelledby="protocols-label">
	<Checkbox.Root value="http" nativeButton>
		<!-- @highlight-start -->
		{#snippet render(props, _state, children)}
			<label>
				<button type="button" {...props}>{@render children?.()}</button>
				HTTP
			</label>
		{/snippet}
		<!-- @highlight-end -->
	</Checkbox.Root>
</CheckboxGroup>
```

### Form integration

Use [Field](/components/field) and [Fieldset](/components/fieldset) for group labeling and form integration:

```svelte title="Using Checkbox Group in a form"
<Form>
	<!-- @highlight -->
	<Field.Root name="allowedNetworkProtocols">
		<Fieldset.Root>
			{#snippet render(props, _state, children)}
				<CheckboxGroup {...props}>{@render children?.()}</CheckboxGroup>
			{/snippet}
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
		</Fieldset.Root>
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
