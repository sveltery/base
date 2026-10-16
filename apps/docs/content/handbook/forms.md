---
title: Forms
description: A guide to building forms with Sveltery Base components.
order: 5
---

Sveltery Base form control components extend the native [constraint validation API](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api) so you can build forms for collecting user input or providing control over an interface. They also integrate seamlessly with third-party libraries like [Superforms](#superforms) and [TanStack Form](#tanstack-form).

```svelte demo
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';
	import { Combobox } from '@sveltery/base/combobox';
	import { Field } from '@sveltery/base/field';
	import { Fieldset } from '@sveltery/base/fieldset';
	import { Form } from '@sveltery/base/form';
	import { NumberField } from '@sveltery/base/number-field';
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';
	import { Select } from '@sveltery/base/select';
	import { Slider } from '@sveltery/base/slider';
	import { Switch } from '@sveltery/base/switch';
	import { Toast } from '@sveltery/base/toast';
	import ToastList from '#lib/components/ToastList.svelte';

	interface Image {
		name: string;
		url: string;
	}

	const regions = ['us', 'eu', 'ap'].flatMap((area) =>
		['central', 'east', 'west'].flatMap((zone) =>
			['1', '2', '3'].map((n) => `${area}-${zone}-${n}`)
		)
	);
	const images: Image[] = [
		'nginx:1.29-alpine',
		'node:22-slim',
		'postgres:18',
		'redis:8.2.2-alpine'
	].map((name) => ({ name, url: `docker.io/library/${name}` }));
	const serverTypes = [
		{ label: 'Select server type', value: null },
		...['t1', 't2', 'm1', 'm2'].flatMap((family) =>
			['small', 'medium', 'large'].map((size) => ({
				label: `${family}.${size}`,
				value: `${family}.${size}`
			}))
		)
	];

	const toastManager = Toast.createToastManager();

	const label = 'text-sm font-medium';
	const input =
		'h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[invalid]:border-red-700 dark:border-gray-700 dark:bg-gray-900';
	const description = 'text-sm text-gray-600 dark:text-gray-400';
	const error = 'text-sm text-red-700 dark:text-red-400';
	const popup =
		'max-h-[min(var(--available-height),20rem)] origin-[var(--transform-origin)] overflow-y-auto rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700';
	const item =
		'grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-4 pl-2.5 text-sm leading-4 outline-none select-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900';
	const iconButton =
		'flex size-8 items-center justify-center rounded text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800';
	const stepper =
		'flex size-9 items-center justify-center border border-gray-200 bg-gray-50 select-none hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700';
	const choice =
		'flex size-5 shrink-0 items-center justify-center border border-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:border-gray-900 data-[checked]:bg-gray-900 dark:border-gray-600 dark:data-[checked]:border-gray-100 dark:data-[checked]:bg-gray-100';
</script>

<Toast.Provider {toastManager}>
	<Form
		aria-label="Launch new cloud server"
		class="flex w-80 flex-col gap-5 text-gray-900 dark:text-gray-100"
		onFormSubmit={(values) => {
			toastManager.add({ title: 'Form submitted', description: JSON.stringify(values) });
		}}
	>
		<Field.Root name="serverName" class="flex flex-col gap-1">
			<Field.Label class={label}>Server name</Field.Label>
			<Field.Control
				defaultValue=""
				placeholder="e.g. api-server-01"
				required
				minlength={3}
				pattern=".*[A-Za-z].*"
				class={input}
			/>
			<Field.Description class={description}>Must be 3 or more characters long</Field.Description>
			<Field.Error class={error} />
		</Field.Root>

		<Field.Root name="region" class="flex flex-col gap-1">
			<Combobox.Root items={regions} required>
				<Field.Label class={label}>Region</Field.Label>
				<Combobox.InputGroup
					class="relative flex h-9 items-center rounded-md border border-gray-200 bg-white pr-1 focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-blue-800 dark:border-gray-700 dark:bg-gray-900"
				>
					<Combobox.Input
						placeholder="e.g. eu-central-1"
						class="h-full min-w-0 flex-1 bg-transparent pl-3 text-sm outline-none"
					/>
					<Combobox.Clear aria-label="Clear selection" class={iconButton}>×</Combobox.Clear>
					<Combobox.Trigger aria-label="Open popup" class={iconButton}>▾</Combobox.Trigger>
				</Combobox.InputGroup>
				<Combobox.Portal>
					<Combobox.Positioner class="z-10 outline-none" sideOffset={4}>
						<Combobox.Popup class="{popup} w-[var(--anchor-width)]">
							<Combobox.Empty
								class="px-4 py-2 text-sm text-gray-600 empty:hidden dark:text-gray-400"
							>
								No matches
							</Combobox.Empty>
							<Combobox.List>
								<Combobox.Collection>
									{#snippet children(region: string)}
										<Combobox.Item value={region} class={item}>
											<Combobox.ItemIndicator class="col-start-1">✓</Combobox.ItemIndicator>
											<span class="col-start-2">{region}</span>
										</Combobox.Item>
									{/snippet}
								</Combobox.Collection>
							</Combobox.List>
						</Combobox.Popup>
					</Combobox.Positioner>
				</Combobox.Portal>
			</Combobox.Root>
			<Field.Error class={error} />
		</Field.Root>

		<Field.Root name="containerImage" class="flex flex-col gap-1">
			<Autocomplete.Root
				items={images}
				mode="both"
				itemToStringValue={(image: Image) => image.url}
				required
			>
				<Field.Label class={label}>Container image</Field.Label>
				<div class="relative">
					<Autocomplete.Input placeholder="e.g. docker.io/library/node:latest" class={input} />
				</div>
				<Field.Description class={description}>
					Enter a registry URL with optional tags
				</Field.Description>
				<Autocomplete.Portal>
					<Autocomplete.Positioner class="z-10 outline-none" sideOffset={4}>
						<Autocomplete.Popup class="{popup} w-[var(--anchor-width)]">
							<Autocomplete.List>
								<Autocomplete.Collection>
									{#snippet children(image: Image)}
										<Autocomplete.Item
											value={image}
											class="flex cursor-default flex-col gap-0.5 px-4 py-2 text-sm outline-none select-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900"
										>
											<span>{image.name}</span>
											<span class="font-mono text-xs opacity-80">{image.url}</span>
										</Autocomplete.Item>
									{/snippet}
								</Autocomplete.Collection>
							</Autocomplete.List>
						</Autocomplete.Popup>
					</Autocomplete.Positioner>
				</Autocomplete.Portal>
			</Autocomplete.Root>
			<Field.Error class={error} />
		</Field.Root>

		<Field.Root name="serverType" class="flex flex-col gap-1">
			<Select.Root items={serverTypes} required>
				<Select.Label class={label}>Server type</Select.Label>
				<div class="relative w-48">
					<Select.Trigger
						class="flex h-9 w-full items-center justify-between gap-3 rounded-md border border-gray-200 bg-white pr-3 pl-3 text-sm select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[invalid]:border-red-700 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
					>
						<Select.Value />
						<Select.Icon class="flex text-gray-600 dark:text-gray-400">▾</Select.Icon>
					</Select.Trigger>
				</div>
				<Select.Portal>
					<Select.Positioner class="z-10 outline-none select-none" sideOffset={8}>
						<Select.Popup class={popup}>
							{#each serverTypes as type (type.value)}
								<Select.Item value={type.value} class="{item} min-w-[var(--anchor-width)]">
									<Select.ItemIndicator class="col-start-1">✓</Select.ItemIndicator>
									<Select.ItemText class="col-start-2">{type.label}</Select.ItemText>
								</Select.Item>
							{/each}
						</Select.Popup>
					</Select.Positioner>
				</Select.Portal>
			</Select.Root>
			<Field.Error class={error} />
		</Field.Root>

		<Field.Root name="numOfInstances" class="flex flex-col gap-1">
			<NumberField.Root min={1} max={64} required class="flex flex-col items-start gap-1">
				<Field.Label class={label}>Number of instances</Field.Label>
				<NumberField.Group class="flex">
					<NumberField.Decrement class="{stepper} rounded-l-md" aria-label="Decrease"
						>−</NumberField.Decrement
					>
					<NumberField.Input
						class="h-9 w-20 border-y border-gray-200 bg-white text-center text-sm tabular-nums focus:z-1 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 dark:border-gray-700 dark:bg-gray-900"
					/>
					<NumberField.Increment class="{stepper} rounded-r-md" aria-label="Increase"
						>+</NumberField.Increment
					>
				</NumberField.Group>
			</NumberField.Root>
			<Field.Error class={error} />
		</Field.Root>

		<Field.Root name="scalingThreshold">
			<Fieldset.Root>
				<Slider.Root
					defaultValue={[0.2, 0.8]}
					thumbAlignment="edge"
					min={0}
					max={1}
					step={0.01}
					format={{ style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 0 }}
					class="grid grid-cols-2 gap-y-2"
				>
					<Fieldset.Legend class={label}>Scaling threshold</Fieldset.Legend>
					<Slider.Value class="text-end text-sm" />
					<Slider.Control class="col-span-2 flex touch-none items-center py-2 select-none">
						<Slider.Track class="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700">
							<Slider.Indicator class="rounded-sm bg-gray-700 dark:bg-gray-300" />
							{#each ['Minimum threshold', 'Maximum threshold'] as thumbLabel, index (thumbLabel)}
								<Slider.Thumb
									{index}
									aria-label={thumbLabel}
									class="size-4 rounded-full bg-white outline-1 outline-gray-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800 dark:bg-gray-900 dark:outline-gray-600"
								/>
							{/each}
						</Slider.Track>
					</Slider.Control>
				</Slider.Root>
			</Fieldset.Root>
		</Field.Root>

		<Field.Root name="storageType">
			<Fieldset.Root>
				<Fieldset.Legend class="mb-2 {label}">Storage type</Fieldset.Legend>
				<RadioGroup defaultValue="ssd" class="flex gap-4">
					{#each ['ssd', 'hdd'] as value (value)}
						<Field.Item>
							<Field.Label class="flex items-center gap-2 text-sm uppercase">
								<Radio.Root {value} class="{choice} rounded-full">
									<Radio.Indicator class="size-2 rounded-full bg-white dark:bg-gray-900" />
								</Radio.Root>
								{value}
							</Field.Label>
						</Field.Item>
					{/each}
				</RadioGroup>
			</Fieldset.Root>
		</Field.Root>

		<Field.Root name="restartOnFailure">
			<Field.Label class="flex items-center gap-3 text-sm">
				Restart on failure
				<Switch.Root
					defaultChecked
					class="relative flex h-6 w-10 shrink-0 rounded-full bg-gray-300 p-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 dark:bg-gray-600 dark:data-[checked]:bg-gray-100"
				>
					<Switch.Thumb
						class="aspect-square h-full rounded-full bg-white shadow-sm transition-transform duration-150 data-[checked]:translate-x-4 dark:bg-gray-100 dark:data-[checked]:bg-gray-900"
					/>
				</Switch.Root>
			</Field.Label>
		</Field.Root>

		<Field.Root name="allowedNetworkProtocols">
			<Fieldset.Root>
				<Fieldset.Legend class="mb-2 {label}">Allowed network protocols</Fieldset.Legend>
				<CheckboxGroup defaultValue={[]} class="flex gap-4">
					{#each ['http', 'https', 'ssh'] as value (value)}
						<Field.Item>
							<Field.Label class="flex items-center gap-2 text-sm uppercase">
								<Checkbox.Root {value} class="{choice} rounded-sm">
									<Checkbox.Indicator class="text-xs text-white dark:text-gray-900"
										>✓</Checkbox.Indicator
									>
								</Checkbox.Root>
								{value}
							</Field.Label>
						</Field.Item>
					{/each}
				</CheckboxGroup>
			</Fieldset.Root>
		</Field.Root>

		<button
			class="h-9 rounded-md bg-gray-900 px-3.5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 dark:bg-gray-100 dark:text-gray-900"
		>
			Launch server
		</button>
	</Form>
	<Toast.Portal>
		<Toast.Viewport
			class="fixed top-auto right-4 bottom-4 z-50 mx-auto w-[calc(100vw-2rem)] sm:right-8 sm:bottom-8 sm:w-[22.5rem]"
		>
			<ToastList />
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
```

## Naming form controls

Form controls must have an accessible name in order to be recognized by assistive technologies. Use the label strategy below for each control type.

### Input controls

Use `<Field.Label>` or a native `<label>` to label the following controls:

- `Input`
- `NumberField`
- `OTPField`
- `Autocomplete`
- `Combobox` (input outside popup)
- `Checkbox`
- `Radio`
- `Switch`

You can implicitly label `<Checkbox>`, `<Radio>` and `<Switch>` components by enclosing them with `<Field.Label>`:

```svelte title="Implicitly labeling a switch"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Switch } from '@sveltery/base/switch';
</script>

<Field.Root>
	<Field.Label>
		<Switch.Root />
		Developer mode
	</Field.Label>
	<Field.Description>Enables extra tools for web developers</Field.Description>
</Field.Root>
```

### Trigger-based controls

- `Combobox` (input inside popup): use `<Combobox.Label>`.
- `Select`: use `<Select.Label>`.
- `Slider`: use `<Slider.Label>`. For multi-thumb sliders, also add an `aria-label` on each `<Slider.Thumb>` to distinguish the thumbs.

### Fallback

If no visible label is rendered, provide `aria-label` on the actual form control.

### Describing the control

`<Field.Description>` automatically assigns an accessible description:

```svelte title="Labeling select and slider"
<script lang="ts">
	import { Form } from '@sveltery/base/form';
	import { Field } from '@sveltery/base/field';
	import { Select } from '@sveltery/base/select';
	import { Slider } from '@sveltery/base/slider';
</script>

<Form>
	<Field.Root>
		<Select.Root>
			<Select.Label>Time zone</Select.Label>
			<Select.Trigger />
		</Select.Root>
		<Field.Description>Used for notifications and reminders</Field.Description>
	</Field.Root>

	<Field.Root>
		<Slider.Root defaultValue={50}>
			<Slider.Label>Zoom level</Slider.Label>
			<Field.Description>Adjust the size of the user interface</Field.Description>
			<Slider.Control>
				<Slider.Track>
					<Slider.Thumb />
				</Slider.Track>
			</Slider.Control>
		</Slider.Root>
	</Field.Root>
</Form>
```

### Labeling control groups

Compose `<Fieldset>` when a single label applies to multiple controls, such as a range slider with multiple thumbs or a section that combines several inputs. For checkbox and radio groups, keep the group label in `<Fieldset.Legend>` and wrap each option with `<Field.Item>`:

```svelte title="Composing range slider and radio group with fieldset"
<script lang="ts">
	import { Form } from '@sveltery/base/form';
	import { Field } from '@sveltery/base/field';
	import { Fieldset } from '@sveltery/base/fieldset';
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';
	import { Slider } from '@sveltery/base/slider';
</script>

<Form>
	<Field.Root>
		<!-- @highlight-start -->
		<Fieldset.Root>
			<Fieldset.Legend>Price range</Fieldset.Legend>
			<!-- @highlight-end -->
			<Slider.Root defaultValue={[20, 80]}>
				<Slider.Control>
					<Slider.Track>
						<Slider.Thumb index={0} aria-label="Minimum price" />
						<Slider.Thumb index={1} aria-label="Maximum price" />
					</Slider.Track>
				</Slider.Control>
			</Slider.Root>
			<!-- @highlight -->
		</Fieldset.Root>
	</Field.Root>

	<Field.Root>
		<!-- @highlight-start -->
		<Fieldset.Root>
			<Fieldset.Legend>Storage type</Fieldset.Legend>
			<!-- @highlight-end -->
			<RadioGroup>
				<Radio.Root value="ssd" />
				<Radio.Root value="hdd" />
			</RadioGroup>
			<!-- @highlight -->
		</Fieldset.Root>
	</Field.Root>
</Form>
```

`<Field.Item>` should enclose each checkbox or radio option so every control has its own label and description:

```svelte title="Explicitly labeling checkboxes in a checkbox group"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Fieldset } from '@sveltery/base/fieldset';
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';
</script>

<Field.Root>
	<Fieldset.Root>
		<Fieldset.Legend>Backup schedule</Fieldset.Legend>
		<CheckboxGroup>
			<!-- @highlight -->
			<Field.Item>
				<Checkbox.Root value="daily" />
				<Field.Label>Daily</Field.Label>
				<Field.Description>Daily at 00:00</Field.Description>
				<!-- @highlight-start -->
			</Field.Item>
			<Field.Item>
				<!-- @highlight-end -->
				<Checkbox.Root value="monthly" />
				<Field.Label>Monthly</Field.Label>
				<Field.Description>On the 5th of every month at 23:59</Field.Description>
				<!-- @highlight -->
			</Field.Item>
		</CheckboxGroup>
	</Fieldset.Root>
</Field.Root>
```

## Building form fields

Pass the `name` prop to `<Field.Root>` to include the wrapped control's value when a parent form is submitted:

```svelte title="Assigning field name to combobox"
<script lang="ts">
	import { Form } from '@sveltery/base/form';
	import { Field } from '@sveltery/base/field';
	import { Combobox } from '@sveltery/base/combobox';
</script>

<Form>
	<!-- @highlight-start -->
	<!-- @highlight-text "name" -->
	<Field.Root name="country">
		<!-- @highlight-end -->
		<Field.Label>Country of residence</Field.Label>
		<Combobox.Root />
	</Field.Root>
</Form>
```

## Submitting data

You can take over form submission using the native `onsubmit`, or custom `onFormSubmit` props:

```svelte title="Native submission using onsubmit"
<script lang="ts">
	import { Form } from '@sveltery/base/form';
</script>

<Form
	// @highlight-start
	onsubmit={async (event) => {
		// Prevent the browser's default full-page refresh
		event.preventDefault();
		// Create a FormData object
		const formData = new FormData(event.currentTarget);
		// Send the FormData instance in a fetch request
		// @highlight-end
		await fetch('https://api.example.com', {
			method: 'POST',
			body: formData
		});
	}}
/>
```

When using `onFormSubmit`, you receive form values as a JavaScript object, with `eventDetails` provided as a second argument. Additionally, `preventDefault()` is automatically called on the native submit event:

```svelte title="Submission using onFormSubmit"
<script lang="ts">
	import { Form } from '@sveltery/base/form';
</script>

<Form
	// @highlight-start
	onFormSubmit={async (formValues) => {
		const payload = {
			product_id: formValues.id,
			order_quantity: formValues.quantity
		};
		await fetch('https://api.example.com', {
			// @highlight-end
			method: 'POST',
			body: JSON.stringify(payload)
		});
	}}
/>
```

## Constraint validation

Sveltery Base form components support native HTML validation attributes for many validation rules:

- `required` specifies a required field.
- `minlength` and `maxlength` specify a valid length for text fields.
- `pattern` specifies a regular expression that the field value must match.
- `step` specifies an increment that numeric field values must be an integral multiple of.

```svelte title="Defining constraint validation on a text field"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
</script>

<Field.Root name="website">
	<Field.Control type="url" required pattern="https?://.*" />
	<Field.Error />
</Field.Root>
```

Sveltery Base form components use a hidden input to participate in native form submission and validation. To anchor the hidden input near a control so the native validation bubble points to the correct area, ensure the component has been given a `name`, and wrap controls in a relatively positioned container for best results.

```svelte title="Positioning hidden inputs"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Select } from '@sveltery/base/select';
</script>

<Field.Root name="apple">
	<Select.Root>
		<Select.Label>Apple</Select.Label>
		<div class="relative">
			<Select.Trigger />
		</div>
	</Select.Root>
</Field.Root>
```

## Custom validation

You can add custom validation logic by passing a synchronous or asynchronous validation function to the `validate` prop, which runs after native validations have passed.

Use the `validationMode` prop to configure when validation is performed:

- `onSubmit` (default) validates all fields when the containing `<Form>` is submitted, afterwards invalid fields revalidate when their value changes.
- `onBlur` validates the field when focus moves away.
- `onChange` validates the field when the value changes, for example, after each keypress in a text field or when a checkbox is checked or unchecked.

`validationDebounceTime` can be used to debounce the function in use cases such as asynchronous requests or text fields that validate `onChange`.

```svelte title="Text input using custom asynchronous validation"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
</script>

<Field.Root
	name="username"
	// @highlight-start
	validationMode="onChange"
	validationDebounceTime={300}
	validate={async (value) => {
		// @highlight-end
		if (value === 'admin') {
			/* return an error message when invalid */
			return 'Reserved for system use.';
		}

		const result = await fetch(/* check the availability of a username from an external API */);

		if (!result) {
			return `${value} is unavailable.`;
		}

		/* return `null` when valid */
		return null;
	}}
>
	<Field.Control required minlength={3} />
	<Field.Error />
</Field.Root>
```

## Server-side validation

You can pass errors returned by (post-submission) server-side validation to the `errors` prop, which will be merged into the client-side field state for display.

This should be an object with field names as keys, and an error string or array of strings as the value. Once a field's value changes, any corresponding error in `errors` will be cleared from the field state.

```svelte title="Displaying errors returned by server-side validation"
<script lang="ts">
	import { Form, type FormErrors } from '@sveltery/base/form';
	import { Field } from '@sveltery/base/field';

	async function submitToServer(/* payload */) {
		return {
			// @highlight-text "errors"
			errors: {
				promoCode: 'This promo code has expired'
			}
		};
	}

	// @highlight-text "errors"
	let errors = $state<FormErrors>({});
</script>

<Form
	// @highlight-text "errors"
	bind:errors
	onsubmit={async (event) => {
		event.preventDefault();
		const response = await submitToServer(/* data */);
		// @highlight-text "errors"
		errors = response.errors;
	}}
>
	<Field.Root name="promoCode" />
</Form>
```

<span id="bind-a-sveltekit-remote-form"></span><span id="connect-a-form-action"></span>

When using [SvelteKit form actions](https://svelte.dev/docs/kit/form-actions) you can return server-side errors from `fail()` and pass the page's `form?.errors` to the `errors` prop. A complete example is available [here](/handbook/sveltekit#connect-a-form-action). A SvelteKit [remote form](/handbook/sveltekit#bind-a-sveltekit-remote-form) goes to the `form` prop of `<Form>` instead, and needs no `errors`.

```svelte title="Returning errors from a form action"
<!-- src/routes/login/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { fromAction } from 'svelte/attachments';
	import { Form, isSubmitBlocked } from '@sveltery/base/form';
	import { Field } from '@sveltery/base/field';

	// @highlight-text "form"
	let { form } = $props();
</script>

<Form
	method="POST"
	// @highlight-text "form" "errors"
	errors={form?.errors}
	{@attach fromAction(enhance, () => ({ formElement, cancel }) => {
		if (isSubmitBlocked(formElement)) cancel();
	})}
>
	<Field.Root name="password">
		<Field.Control />
		<Field.Error />
	</Field.Root>
</Form>
```

```ts
// src/routes/login/+page.server.ts
import { fail } from '@sveltejs/kit';

export const actions = {
	default: async ({ request }) => {
		const result = authenticateUser(await request.formData());

		if (!result.success) {
			return fail(400, {
				// @highlight-text "errors"
				errors: {
					password: 'Invalid username or password'
				}
			});
		}
		/* redirect on the server on success */
	}
};
```

## Displaying errors

Use `<Field.Error>` without `children` to automatically display the field's native error message when invalid. The `match` prop can be used to customize the message based on the validity state, and manage internationalization from your application logic:

```svelte title="Customizing error message for a required field"
<Field.Error match="valueMissing">You must create a username</Field.Error>
```

## Superforms

[Superforms](https://superforms.rocks) is a popular SvelteKit library that you can integrate with Sveltery Base to externally manage form and field state for your existing components.

```svelte demo
<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';
	import * as v from 'valibot';
	import { Autocomplete } from '@sveltery/base/autocomplete';
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';
	import { Combobox } from '@sveltery/base/combobox';
	import { Field } from '@sveltery/base/field';
	import { Fieldset } from '@sveltery/base/fieldset';
	import { Form } from '@sveltery/base/form';
	import { NumberField } from '@sveltery/base/number-field';
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';
	import { Select } from '@sveltery/base/select';
	import { Slider } from '@sveltery/base/slider';
	import { Switch } from '@sveltery/base/switch';
	import { Toast } from '@sveltery/base/toast';
	import ToastList from '#lib/components/ToastList.svelte';

	interface Image {
		name: string;
		url: string;
	}

	const regions = ['us', 'eu', 'ap'].flatMap((area) =>
		['central', 'east', 'west'].flatMap((zone) =>
			['1', '2', '3'].map((n) => `${area}-${zone}-${n}`)
		)
	);
	const images: Image[] = [
		'nginx:1.29-alpine',
		'node:22-slim',
		'postgres:18',
		'redis:8.2.2-alpine'
	].map((name) => ({ name, url: `docker.io/library/${name}` }));
	const serverTypes = [
		{ label: 'Select server type', value: null },
		...['t1', 't2', 'm1', 'm2'].flatMap((family) =>
			['small', 'medium', 'large'].map((size) => ({
				label: `${family}.${size}`,
				value: `${family}.${size}`
			}))
		)
	];

	const required = 'This field is required.';
	const schema = v.object({
		serverName: v.pipe(v.string(), v.nonEmpty(required), v.minLength(3, 'At least 3 characters.')),
		region: v.pipe(
			v.nullable(v.string()),
			v.check((value) => value !== null, required)
		),
		containerImage: v.pipe(v.string(), v.nonEmpty(required)),
		serverType: v.pipe(
			v.nullable(v.string()),
			v.check((value) => value !== null, required)
		),
		numOfInstances: v.pipe(
			v.nullable(v.number()),
			v.check((value) => value !== null, required)
		),
		scalingThreshold: v.array(v.number()),
		storageType: v.picklist(['ssd', 'hdd']),
		restartOnFailure: v.boolean(),
		allowedNetworkProtocols: v.array(v.string())
	});
	const adapter = valibot(schema);

	const toastManager = Toast.createToastManager();

	const { form, errors, tainted, isTainted, enhance } = superForm(
		defaults(
			{
				serverName: '',
				region: null,
				containerImage: '',
				serverType: null,
				numOfInstances: null,
				scalingThreshold: [0.2, 0.8],
				storageType: 'ssd',
				restartOnFailure: true,
				allowedNetworkProtocols: []
			},
			adapter
		),
		{
			SPA: true,
			validators: adapter,
			onUpdate: ({ form }) => {
				if (!form.valid) return;
				toastManager.add({ title: 'Form submitted', description: JSON.stringify(form.data) });
			}
		}
	);

	const label = 'text-sm font-medium';
	const input =
		'h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[invalid]:border-red-700 dark:border-gray-700 dark:bg-gray-900';
	const description = 'text-sm text-gray-600 dark:text-gray-400';
	const error = 'text-sm text-red-700 dark:text-red-400';
	const popup =
		'max-h-[min(var(--available-height),20rem)] origin-[var(--transform-origin)] overflow-y-auto rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700';
	const item =
		'grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-4 pl-2.5 text-sm leading-4 outline-none select-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900';
	const iconButton =
		'flex size-8 items-center justify-center rounded text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800';
	const stepper =
		'flex size-9 items-center justify-center border border-gray-200 bg-gray-50 select-none hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700';
	const choice =
		'flex size-5 shrink-0 items-center justify-center border border-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:border-gray-900 data-[checked]:bg-gray-900 dark:border-gray-600 dark:data-[checked]:border-gray-100 dark:data-[checked]:bg-gray-100';
</script>

<Toast.Provider {toastManager}>
	<Form
		aria-label="Launch new cloud server"
		class="flex w-80 flex-col gap-5 text-gray-900 dark:text-gray-100"
		{@attach fromAction(enhance)}
	>
		<Field.Root
			name="serverName"
			invalid={!!$errors.serverName}
			dirty={isTainted($tainted?.serverName)}
			class="flex flex-col gap-1"
		>
			<Field.Label class={label}>Server name</Field.Label>
			<Field.Control bind:value={$form.serverName} placeholder="e.g. api-server-01" class={input} />
			<Field.Description class={description}>Must be 3 or more characters long</Field.Description>
			<Field.Error match={!!$errors.serverName} class={error}>{$errors.serverName?.[0]}</Field.Error
			>
		</Field.Root>

		<Field.Root
			name="region"
			invalid={!!$errors.region}
			dirty={isTainted($tainted?.region)}
			class="flex flex-col gap-1"
		>
			<Combobox.Root items={regions} bind:value={$form.region}>
				<Field.Label class={label}>Region</Field.Label>
				<Combobox.InputGroup
					class="relative flex h-9 items-center rounded-md border border-gray-200 bg-white pr-1 focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-blue-800 dark:border-gray-700 dark:bg-gray-900"
				>
					<Combobox.Input
						placeholder="e.g. eu-central-1"
						class="h-full min-w-0 flex-1 bg-transparent pl-3 text-sm outline-none"
					/>
					<Combobox.Clear aria-label="Clear selection" class={iconButton}>×</Combobox.Clear>
					<Combobox.Trigger aria-label="Open popup" class={iconButton}>▾</Combobox.Trigger>
				</Combobox.InputGroup>
				<Combobox.Portal>
					<Combobox.Positioner class="z-10 outline-none" sideOffset={4}>
						<Combobox.Popup class="{popup} w-[var(--anchor-width)]">
							<Combobox.Empty
								class="px-4 py-2 text-sm text-gray-600 empty:hidden dark:text-gray-400"
							>
								No matches
							</Combobox.Empty>
							<Combobox.List>
								<Combobox.Collection>
									{#snippet children(region: string)}
										<Combobox.Item value={region} class={item}>
											<Combobox.ItemIndicator class="col-start-1">✓</Combobox.ItemIndicator>
											<span class="col-start-2">{region}</span>
										</Combobox.Item>
									{/snippet}
								</Combobox.Collection>
							</Combobox.List>
						</Combobox.Popup>
					</Combobox.Positioner>
				</Combobox.Portal>
			</Combobox.Root>
			<Field.Error match={!!$errors.region} class={error}>{$errors.region?.[0]}</Field.Error>
		</Field.Root>

		<Field.Root
			name="containerImage"
			invalid={!!$errors.containerImage}
			dirty={isTainted($tainted?.containerImage)}
			class="flex flex-col gap-1"
		>
			<Autocomplete.Root
				items={images}
				mode="both"
				itemToStringValue={(image: Image) => image.url}
				bind:value={$form.containerImage}
			>
				<Field.Label class={label}>Container image</Field.Label>
				<div class="relative">
					<Autocomplete.Input placeholder="e.g. docker.io/library/node:latest" class={input} />
				</div>
				<Field.Description class={description}>
					Enter a registry URL with optional tags
				</Field.Description>
				<Autocomplete.Portal>
					<Autocomplete.Positioner class="z-10 outline-none" sideOffset={4}>
						<Autocomplete.Popup class="{popup} w-[var(--anchor-width)]">
							<Autocomplete.List>
								<Autocomplete.Collection>
									{#snippet children(image: Image)}
										<Autocomplete.Item
											value={image}
											class="flex cursor-default flex-col gap-0.5 px-4 py-2 text-sm outline-none select-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900"
										>
											<span>{image.name}</span>
											<span class="font-mono text-xs opacity-80">{image.url}</span>
										</Autocomplete.Item>
									{/snippet}
								</Autocomplete.Collection>
							</Autocomplete.List>
						</Autocomplete.Popup>
					</Autocomplete.Positioner>
				</Autocomplete.Portal>
			</Autocomplete.Root>
			<Field.Error match={!!$errors.containerImage} class={error}>
				{$errors.containerImage?.[0]}
			</Field.Error>
		</Field.Root>

		<Field.Root
			name="serverType"
			invalid={!!$errors.serverType}
			dirty={isTainted($tainted?.serverType)}
			class="flex flex-col gap-1"
		>
			<Select.Root items={serverTypes} bind:value={$form.serverType}>
				<Select.Label class={label}>Server type</Select.Label>
				<div class="relative w-48">
					<Select.Trigger
						class="flex h-9 w-full items-center justify-between gap-3 rounded-md border border-gray-200 bg-white pr-3 pl-3 text-sm select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[invalid]:border-red-700 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
					>
						<Select.Value />
						<Select.Icon class="flex text-gray-600 dark:text-gray-400">▾</Select.Icon>
					</Select.Trigger>
				</div>
				<Select.Portal>
					<Select.Positioner class="z-10 outline-none select-none" sideOffset={8}>
						<Select.Popup class={popup}>
							{#each serverTypes as type (type.value)}
								<Select.Item value={type.value} class="{item} min-w-[var(--anchor-width)]">
									<Select.ItemIndicator class="col-start-1">✓</Select.ItemIndicator>
									<Select.ItemText class="col-start-2">{type.label}</Select.ItemText>
								</Select.Item>
							{/each}
						</Select.Popup>
					</Select.Positioner>
				</Select.Portal>
			</Select.Root>
			<Field.Error match={!!$errors.serverType} class={error}>{$errors.serverType?.[0]}</Field.Error
			>
		</Field.Root>

		<Field.Root
			name="numOfInstances"
			invalid={!!$errors.numOfInstances}
			dirty={isTainted($tainted?.numOfInstances)}
			class="flex flex-col gap-1"
		>
			<NumberField.Root
				bind:value={$form.numOfInstances}
				min={1}
				max={64}
				class="flex flex-col items-start gap-1"
			>
				<Field.Label class={label}>Number of instances</Field.Label>
				<NumberField.Group class="flex">
					<NumberField.Decrement class="{stepper} rounded-l-md" aria-label="Decrease"
						>−</NumberField.Decrement
					>
					<NumberField.Input
						class="h-9 w-20 border-y border-gray-200 bg-white text-center text-sm tabular-nums focus:z-1 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 dark:border-gray-700 dark:bg-gray-900"
					/>
					<NumberField.Increment class="{stepper} rounded-r-md" aria-label="Increase"
						>+</NumberField.Increment
					>
				</NumberField.Group>
			</NumberField.Root>
			<Field.Error match={!!$errors.numOfInstances} class={error}>
				{$errors.numOfInstances?.[0]}
			</Field.Error>
		</Field.Root>

		<Field.Root name="scalingThreshold" dirty={isTainted($tainted?.scalingThreshold)}>
			<Fieldset.Root>
				<Slider.Root
					bind:value={$form.scalingThreshold}
					thumbAlignment="edge"
					min={0}
					max={1}
					step={0.01}
					format={{ style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 0 }}
					class="grid grid-cols-2 gap-y-2"
				>
					<Fieldset.Legend class={label}>Scaling threshold</Fieldset.Legend>
					<Slider.Value class="text-end text-sm" />
					<Slider.Control class="col-span-2 flex touch-none items-center py-2 select-none">
						<Slider.Track class="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700">
							<Slider.Indicator class="rounded-sm bg-gray-700 dark:bg-gray-300" />
							{#each ['Minimum threshold', 'Maximum threshold'] as thumbLabel, index (thumbLabel)}
								<Slider.Thumb
									{index}
									aria-label={thumbLabel}
									class="size-4 rounded-full bg-white outline-1 outline-gray-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800 dark:bg-gray-900 dark:outline-gray-600"
								/>
							{/each}
						</Slider.Track>
					</Slider.Control>
				</Slider.Root>
			</Fieldset.Root>
		</Field.Root>

		<Field.Root name="storageType" dirty={isTainted($tainted?.storageType)}>
			<Fieldset.Root>
				<Fieldset.Legend class="mb-2 {label}">Storage type</Fieldset.Legend>
				<RadioGroup bind:value={$form.storageType} class="flex gap-4">
					{#each ['ssd', 'hdd'] as value (value)}
						<Field.Item>
							<Field.Label class="flex items-center gap-2 text-sm uppercase">
								<Radio.Root {value} class="{choice} rounded-full">
									<Radio.Indicator class="size-2 rounded-full bg-white dark:bg-gray-900" />
								</Radio.Root>
								{value}
							</Field.Label>
						</Field.Item>
					{/each}
				</RadioGroup>
			</Fieldset.Root>
		</Field.Root>

		<Field.Root name="restartOnFailure" dirty={isTainted($tainted?.restartOnFailure)}>
			<Field.Label class="flex items-center gap-3 text-sm">
				Restart on failure
				<Switch.Root
					bind:checked={$form.restartOnFailure}
					class="relative flex h-6 w-10 shrink-0 rounded-full bg-gray-300 p-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 dark:bg-gray-600 dark:data-[checked]:bg-gray-100"
				>
					<Switch.Thumb
						class="aspect-square h-full rounded-full bg-white shadow-sm transition-transform duration-150 data-[checked]:translate-x-4 dark:bg-gray-100 dark:data-[checked]:bg-gray-900"
					/>
				</Switch.Root>
			</Field.Label>
		</Field.Root>

		<Field.Root name="allowedNetworkProtocols" dirty={isTainted($tainted?.allowedNetworkProtocols)}>
			<Fieldset.Root>
				<Fieldset.Legend class="mb-2 {label}">Allowed network protocols</Fieldset.Legend>
				<CheckboxGroup bind:value={$form.allowedNetworkProtocols} class="flex gap-4">
					{#each ['http', 'https', 'ssh'] as value (value)}
						<Field.Item>
							<Field.Label class="flex items-center gap-2 text-sm uppercase">
								<Checkbox.Root {value} class="{choice} rounded-sm">
									<Checkbox.Indicator class="text-xs text-white dark:text-gray-900"
										>✓</Checkbox.Indicator
									>
								</Checkbox.Root>
								{value}
							</Field.Label>
						</Field.Item>
					{/each}
				</CheckboxGroup>
			</Fieldset.Root>
		</Field.Root>

		<button
			class="h-9 rounded-md bg-gray-900 px-3.5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 dark:bg-gray-100 dark:text-gray-900"
		>
			Launch server
		</button>
	</Form>
	<Toast.Portal>
		<Toast.Viewport
			class="fixed top-auto right-4 bottom-4 z-50 mx-auto w-[calc(100vw-2rem)] sm:right-8 sm:bottom-8 sm:w-[22.5rem]"
		>
			<ToastList />
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
```

### Initialize the form

Initialize the form with the `superForm` function, assigning the initial value of each field by their name in the data you pass to `defaults`:

```ts title="Initialize a form instance"
import { defaults, superForm } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';

const schema = v.object({
	username: v.string(),
	email: v.string()
});

const { form, errors, tainted, isTainted, enhance } = superForm(
	defaults({ username: '', email: '' }, valibot(schema)),
	{ SPA: true }
);
```

`SPA: true` validates and submits in the browser. To validate on the server instead, pass the data that `superValidate` returns from your load function in place of `defaults`, as the Superforms docs describe.

### Integrate components

Bind each control to the `$form` store, and forward the field's state from `$errors` and `$tainted` to `<Field.Root>`:

```svelte title="Integrating Superforms with Sveltery Base field"
<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Field } from '@sveltery/base/field';

	// @highlight-text "form" "errors" "tainted" "isTainted"
	const { form, errors, tainted, isTainted } = superForm(/* ... */);
</script>

<!-- @highlight-text "invalid" "dirty" -->
<Field.Root name="username" invalid={!!$errors.username} dirty={isTainted($tainted?.username)}>
	<Field.Label>Username</Field.Label>
	<Field.Description>
		May appear where you contribute or are mentioned. You can remove it at any time.
	</Field.Description>
	<!-- @highlight-text "bind:value" -->
	<Field.Control placeholder="e.g. alice132" bind:value={$form.username} />
	<!-- @highlight-text "$errors" -->
	<Field.Error match={!!$errors.username}>
		<!-- @highlight-text "$errors" -->
		{$errors.username?.[0]}
	</Field.Error>
</Field.Root>
```

Superforms does not track whether a field was touched, so leave `touched` out, and `<Field.Root>` marks the field touched on blur. There is no ref to forward. `invalid` sets `aria-invalid` on the control and `data-invalid` on every part of the field.

### Field validation

Specify the validation rules in the schema, pass the schema's adapter to `validators`, and use the `match` prop to delegate control of the error rendering:

```svelte title="Defining validation rules and displaying errors"
<script lang="ts">
	import { defaults, superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';
	import * as v from 'valibot';
	import { Field } from '@sveltery/base/field';

	const schema = v.object({
		// @highlight-start
		username: v.pipe(
			v.string(),
			v.nonEmpty('This is a required field'),
			v.minLength(2, 'Too short'),
			v.check((value) => isAllowed(value), 'Invalid')
		)
		// @highlight-end
	});
	const adapter = valibot(schema);

	const { form, errors, tainted, isTainted } = superForm(defaults(adapter), {
		SPA: true,
		validators: adapter
	});
</script>

<Field.Root name="username" invalid={!!$errors.username} dirty={isTainted($tainted?.username)}>
	<Field.Label>Username</Field.Label>
	<Field.Description>
		May appear where you contribute or are mentioned. You can remove it at any time.
	</Field.Description>
	<Field.Control placeholder="e.g. alice132" bind:value={$form.username} />
	<!-- @highlight-start -->
	<Field.Error match={!!$errors.username}>
		{$errors.username?.[0]}
	</Field.Error>
	<!-- @highlight-end -->
</Field.Root>
```

Keep `validators` when you also validate on the server. Superforms then clears a message as the user edits. Without them, a message from the server stays in `$errors`, and `invalid` blocks every later submit.

### Submitting data

Attach the `enhance` action to `<Form>` with `fromAction`, and handle the validated values in the `onUpdate` callback:

```svelte title="Form submission handler"
<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { Form } from '@sveltery/base/form';

	const { enhance } = superForm(defaults(adapter), {
		SPA: true,
		validators: adapter,
		onUpdate: async ({ form }) => {
			if (!form.valid) return;
			// transform the object and/or submit it to a server
			await fetch(/* ... */);
		}
	});
</script>

<Form {@attach fromAction(enhance)} />
```

Without `SPA`, Superforms posts the form to your form action. It skips its own validation on submit, because `<Form>` sets `novalidate`, and it posts a submit that `<Form>` blocked. Cancel that submit in `onSubmit`:

```ts
import { isSubmitBlocked } from '@sveltery/base/form';

const { form, errors, tainted, enhance } = superForm(data.form, {
	validators: adapter,
	onSubmit: ({ formElement, cancel }) => {
		if (isSubmitBlocked(formElement)) cancel();
	}
});
```

## TanStack Form

[TanStack Form](https://tanstack.com/form/latest/docs/overview) is a form library with a function-based API for orchestrating validations that can also be integrated with Sveltery Base.

### Initialize the form

Create a form instance with the `createForm` function, assigning the initial value of each field by their name in the `defaultValues` option:

```ts title="Initialize a form instance"
import { createForm } from '@tanstack/svelte-form';

interface FormValues {
	username: string;
	email: string;
}

const defaultValues: FormValues = {
	username: '',
	email: ''
};

// @highlight-start
/* createForm returns a form instance */
const form = createForm(() => ({
	// @highlight-end
	defaultValues
}));
```

### Integrate components

Use the `<form.Field>` component from the form instance to integrate with Sveltery Base components using the `children` snippet, forwarding the various `field` properties to the appropriate part:

```svelte title="Integrating TanStack Form with Sveltery Base components"
<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';
	import { Field } from '@sveltery/base/field';

	const form = createForm(/* defaultValues, other options */);
</script>

<form>
	<!-- @highlight-start -->
	<form.Field name="username">
		{#snippet children(field)}
			<!-- @highlight-end -->
			<Field.Root
				// @highlight-start
				// @highlight-text "field.name"
				name={field.name}
				// @highlight-text "isValid"
				invalid={!field.state.meta.isValid}
				// @highlight-text "isDirty"
				dirty={field.state.meta.isDirty}
				// @highlight-text "isTouched"
				touched={field.state.meta.isTouched}
				// @highlight-end
			>
				<Field.Label>Username</Field.Label>
				<Field.Control
					// @highlight-start
					// @highlight-text "field.state.value" "field.handleChange"
					bind:value={() => field.state.value, (value) => field.handleChange(value)}
					// @highlight-text "field.handleBlur"
					onblur={field.handleBlur}
					// @highlight-end
					placeholder="e.g. bob276"
				/>

				<!-- @highlight-start -->
				<!-- @highlight-text "isValid" -->
				<Field.Error match={!field.state.meta.isValid}>
					<!-- @highlight-end -->
					{field.state.meta.errors.join(',')}
				</Field.Error>
			</Field.Root>
		{/snippet}
	</form.Field>
</form>
```

The Sveltery Base `<Form>` component is not needed when using TanStack Form.

### Form validation

To configure a native `<form>`-like validation strategy:

1. Use the additional `revalidateLogic` function and pass it to `createForm`.
2. Pass a validation function to the `validators.onDynamic` option of `createForm` that returns an error object with keys corresponding to the field `name`s.

This validates all fields when the first submission is attempted, and revalidates any invalid fields when their values change again.

```ts title="Form-level validators"
// @highlight-text "revalidateLogic"
import { createForm, revalidateLogic } from '@tanstack/svelte-form';

const form = createForm(() => ({
	defaultValues: {
		username: '',
		email: ''
	},
	// @highlight-start
	// @highlight-text "revalidateLogic"
	validationLogic: revalidateLogic({
		// @highlight-end
		mode: 'submit',
		modeAfterSubmission: 'change'
	}),
	validators: {
		// @highlight-start
		// @highlight-text "onDynamic"
		onDynamic: ({ value: formValues }) => {
			// @highlight-end
			const errors: Record<string, string> = {};

			if (!formValues.username) {
				errors.username = 'Username is required.';
			} else if (formValues.username.length < 3) {
				errors.username = 'At least 3 characters.';
			}

			if (!formValues.email) {
				errors.email = 'Email is required.';
			} else if (!isValidEmail(formValues.email)) {
				errors.email = 'Invalid email address.';
			}

			return { form: errors, fields: errors };
		}
	}
}));
```

### Field validation

You can pass additional validator functions to individual `<form.Field>` components to add validations on top of the form-level validators:

```svelte title="Field-level validators"
<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';
	import { Field } from '@sveltery/base/field';

	const form = createForm();
</script>

<form.Field
	name="username"
	// @highlight-start
	validators={{
		onChangeAsync: async ({ value: username }) => {
			const result = await fetch(/* check the availability of a username from an external API */);

			return result.success ? undefined : `${username} is not available.`;
		}
	}}
	// @highlight-end
>
	{#snippet children(field)}
		<Field.Root name={field.name} /* forward the field props */ />
	{/snippet}
</form.Field>
```

### Submitting data

To submit the form:

1. Pass a submit handler function to the `onSubmit` option of `createForm`.
2. Call `form.handleSubmit()` from an event handler such as form `onsubmit` or `onclick` on a button.

```svelte title="Form submission handler"
<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';

	const form = createForm(() => ({
		// @highlight-start
		onSubmit: async ({ value: formValues }) => {
			await fetch(/* POST the `formValues` to an external API */);
		}
		// @highlight-end
	}));
</script>

<form
	onsubmit={(event) => {
		event.preventDefault();
		// @highlight-start
		// @highlight-text "form.handleSubmit()"
		form.handleSubmit();
		// @highlight-end
	}}
>
	<!-- form fields -->
	<!-- @highlight -->
	<button type="submit">Submit</button>
</form>
```
