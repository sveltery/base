# Checkbox Group

<Subtitle>
  Provides shared state to a series of checkboxes.
</Subtitle>

<Meta name="description" content="Provides shared state to a series of checkboxes." />

```svelte demo
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';

	const id = $props.id();
</script>

<CheckboxGroup
	aria-labelledby={id}
	defaultValue={['fuji-apple']}
	class="flex flex-col items-start gap-1 text-neutral-950 dark:text-white"
>
	<div class="text-sm font-bold" {id}>Apples</div>

	<label class="flex items-center gap-2 text-sm font-normal">
		<Checkbox.Root
			name="apple"
			value="fuji-apple"
			class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Checkbox.Indicator class="flex data-unchecked:hidden">
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					style="display: block"
				>
					<path d="m2.5 8.5 4 4 7-9" />
				</svg>
			</Checkbox.Indicator>
		</Checkbox.Root>
		Fuji
	</label>

	<label class="flex items-center gap-2 text-sm font-normal">
		<Checkbox.Root
			name="apple"
			value="gala-apple"
			class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Checkbox.Indicator class="flex data-unchecked:hidden">
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					style="display: block"
				>
					<path d="m2.5 8.5 4 4 7-9" />
				</svg>
			</Checkbox.Indicator>
		</Checkbox.Root>
		Gala
	</label>

	<label class="flex items-center gap-2 text-sm font-normal">
		<Checkbox.Root
			name="apple"
			value="granny-smith-apple"
			class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Checkbox.Indicator class="flex data-unchecked:hidden">
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					style="display: block"
				>
					<path d="m2.5 8.5 4 4 7-9" />
				</svg>
			</Checkbox.Indicator>
		</Checkbox.Root>
		Granny Smith
	</label>
</CheckboxGroup>
```

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

```svelte demo
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';

	const fruits = ['fuji-apple', 'gala-apple', 'granny-smith-apple'];
	const id = $props.id();
	let value = $state<string[]>([]);
</script>

<CheckboxGroup
	aria-labelledby={id}
	bind:value
	allValues={fruits}
	class="flex flex-col items-start gap-1 text-neutral-950 dark:text-white"
	style="margin-left: 1rem"
>
	<label class="flex items-center gap-2 text-sm font-normal" {id} style="margin-left: -1rem">
		<Checkbox.Root
			class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 data-indeterminate:bg-neutral-950 data-indeterminate:text-white dark:data-indeterminate:bg-white dark:data-indeterminate:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
			parent
		>
			<Checkbox.Indicator class="flex data-unchecked:hidden">
				{#snippet render(props, state)}
					<span {...props}>
						{#if state.indeterminate}
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="currentColor"
								stroke-width="1"
								style="display: block"
							>
								<line
									x1="3"
									y1="12"
									x2="21"
									y2="12"
									stroke="currentColor"
									vector-effect="non-scaling-stroke"
								/>
							</svg>
						{:else}
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								style="display: block"
							>
								<path d="m2.5 8.5 4 4 7-9" />
							</svg>
						{/if}
					</span>
				{/snippet}
			</Checkbox.Indicator>
		</Checkbox.Root>
		Apples
	</label>

	<label class="flex items-center gap-2 text-sm font-normal">
		<Checkbox.Root
			value="fuji-apple"
			class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Checkbox.Indicator class="flex data-unchecked:hidden">
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					style="display: block"
				>
					<path d="m2.5 8.5 4 4 7-9" />
				</svg>
			</Checkbox.Indicator>
		</Checkbox.Root>
		Fuji
	</label>

	<label class="flex items-center gap-2 text-sm font-normal">
		<Checkbox.Root
			value="gala-apple"
			class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Checkbox.Indicator class="flex data-unchecked:hidden">
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					style="display: block"
				>
					<path d="m2.5 8.5 4 4 7-9" />
				</svg>
			</Checkbox.Indicator>
		</Checkbox.Root>
		Gala
	</label>

	<label class="flex items-center gap-2 text-sm font-normal">
		<Checkbox.Root
			value="granny-smith-apple"
			class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Checkbox.Indicator class="flex data-unchecked:hidden">
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					style="display: block"
				>
					<path d="m2.5 8.5 4 4 7-9" />
				</svg>
			</Checkbox.Indicator>
		</Checkbox.Root>
		Granny Smith
	</label>
</CheckboxGroup>
```

### Nested parent checkbox

```svelte demo
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';

	const mainPermissions = ['view-dashboard', 'manage-users', 'access-reports'];
	const userManagementPermissions = ['create-user', 'edit-user', 'delete-user', 'assign-roles'];

	const id = $props.id();
	let mainValue = $state<string[]>([]);
	let managementValue = $state<string[]>([]);
</script>

<CheckboxGroup
	aria-labelledby={id}
	value={mainValue}
	onValueChange={(value) => {
		if (value.includes('manage-users')) {
			managementValue = userManagementPermissions;
		} else if (managementValue.length === userManagementPermissions.length) {
			managementValue = [];
		}
		mainValue = value;
	}}
	allValues={mainPermissions}
	class="flex flex-col items-start gap-1 text-neutral-950 dark:text-white"
	style="margin-left: 1rem"
>
	<label class="flex items-center gap-2 text-sm font-normal" {id} style="margin-left: -1rem">
		<Checkbox.Root
			class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 data-indeterminate:bg-neutral-950 data-indeterminate:text-white dark:data-indeterminate:bg-white dark:data-indeterminate:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
			parent
			indeterminate={managementValue.length > 0 &&
				managementValue.length !== userManagementPermissions.length}
		>
			<Checkbox.Indicator class="flex data-unchecked:hidden">
				{#snippet render(props, state)}
					<span {...props}>
						{#if state.indeterminate}
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="currentColor"
								stroke-width="1"
								style="display: block"
							>
								<line
									x1="3"
									y1="12"
									x2="21"
									y2="12"
									stroke="currentColor"
									vector-effect="non-scaling-stroke"
								/>
							</svg>
						{:else}
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								style="display: block"
							>
								<path d="m2.5 8.5 4 4 7-9" />
							</svg>
						{/if}
					</span>
				{/snippet}
			</Checkbox.Indicator>
		</Checkbox.Root>
		User Permissions
	</label>

	<label class="flex items-center gap-2 text-sm font-normal">
		<Checkbox.Root
			value="view-dashboard"
			class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Checkbox.Indicator class="flex data-unchecked:hidden">
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					style="display: block"
				>
					<path d="m2.5 8.5 4 4 7-9" />
				</svg>
			</Checkbox.Indicator>
		</Checkbox.Root>
		View Dashboard
	</label>

	<label class="flex items-center gap-2 text-sm font-normal">
		<Checkbox.Root
			value="access-reports"
			class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Checkbox.Indicator class="flex data-unchecked:hidden">
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					style="display: block"
				>
					<path d="m2.5 8.5 4 4 7-9" />
				</svg>
			</Checkbox.Indicator>
		</Checkbox.Root>
		Access Reports
	</label>

	<CheckboxGroup
		aria-labelledby="manage-users-caption"
		class="flex flex-col items-start gap-1 text-neutral-950 dark:text-white"
		value={managementValue}
		onValueChange={(value) => {
			if (value.length === userManagementPermissions.length) {
				mainValue = Array.from(new Set([...mainValue, 'manage-users']));
			} else {
				mainValue = mainValue.filter((v) => v !== 'manage-users');
			}
			managementValue = value;
		}}
		allValues={userManagementPermissions}
		style="margin-left: 1rem"
	>
		<label
			class="flex items-center gap-2 text-sm font-normal"
			id="manage-users-caption"
			style="margin-left: -1rem"
		>
			<Checkbox.Root
				class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 data-indeterminate:bg-neutral-950 data-indeterminate:text-white dark:data-indeterminate:bg-white dark:data-indeterminate:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
				parent
			>
				<Checkbox.Indicator class="flex data-unchecked:hidden">
					{#snippet render(props, state)}
						<span {...props}>
							{#if state.indeterminate}
								<svg
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="currentColor"
									stroke-width="1"
									style="display: block"
								>
									<line
										x1="3"
										y1="12"
										x2="21"
										y2="12"
										stroke="currentColor"
										vector-effect="non-scaling-stroke"
									/>
								</svg>
							{:else}
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									stroke="currentColor"
									style="display: block"
								>
									<path d="m2.5 8.5 4 4 7-9" />
								</svg>
							{/if}
						</span>
					{/snippet}
				</Checkbox.Indicator>
			</Checkbox.Root>
			Manage Users
		</label>

		<label class="flex items-center gap-2 text-sm font-normal">
			<Checkbox.Root
				value="create-user"
				class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
			>
				<Checkbox.Indicator class="flex data-unchecked:hidden">
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						style="display: block"
					>
						<path d="m2.5 8.5 4 4 7-9" />
					</svg>
				</Checkbox.Indicator>
			</Checkbox.Root>
			Create User
		</label>

		<label class="flex items-center gap-2 text-sm font-normal">
			<Checkbox.Root
				value="edit-user"
				class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
			>
				<Checkbox.Indicator class="flex data-unchecked:hidden">
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						style="display: block"
					>
						<path d="m2.5 8.5 4 4 7-9" />
					</svg>
				</Checkbox.Indicator>
			</Checkbox.Root>
			Edit User
		</label>

		<label class="flex items-center gap-2 text-sm font-normal">
			<Checkbox.Root
				value="delete-user"
				class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
			>
				<Checkbox.Indicator class="flex data-unchecked:hidden">
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						style="display: block"
					>
						<path d="m2.5 8.5 4 4 7-9" />
					</svg>
				</Checkbox.Indicator>
			</Checkbox.Root>
			Delete User
		</label>

		<label class="flex items-center gap-2 text-sm font-normal">
			<Checkbox.Root
				value="assign-roles"
				class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
			>
				<Checkbox.Indicator class="flex data-unchecked:hidden">
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						style="display: block"
					>
						<path d="m2.5 8.5 4 4 7-9" />
					</svg>
				</Checkbox.Indicator>
			</Checkbox.Root>
			Assign Roles
		</label>
	</CheckboxGroup>
</CheckboxGroup>
```

## API reference

<script>
	import { TypesCheckboxGroup } from './types';
</script>

<TypesCheckboxGroup />
