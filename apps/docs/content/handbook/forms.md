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

	const field = 'flex flex-col items-start gap-1';
	const label = 'text-sm font-bold text-neutral-950 dark:text-white';
	const choiceLabel =
		'flex items-center gap-2 text-sm font-normal text-neutral-950 uppercase dark:text-white';
	const input =
		'h-8 w-full max-w-xs border border-neutral-950 bg-white px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400';
	const autocompleteInput =
		'h-8 w-[16rem] border border-neutral-950 bg-white px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white md:w-[20rem] dark:border-white dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400';
	const description = 'text-sm text-neutral-600 dark:text-neutral-400';
	const error = 'text-sm text-red-700 dark:text-red-400';
	const comboboxPopup =
		'w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0_rgb(0_0_0/12%)] transition-[scale,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none';
	const comboboxItem =
		'grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 p-2 text-sm leading-4 outline-none select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white';
	const autocompletePopup =
		'w-(--anchor-width) max-w-(--available-width) border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none';
	const autocompleteItem =
		'flex cursor-default flex-col gap-0.25 py-2 pr-8 pl-2 text-sm leading-4 outline-none select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white';
	const selectPopup =
		'group min-w-(--anchor-width) origin-(--transform-origin) border border-neutral-950 bg-white bg-clip-padding text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[scale,opacity] duration-100 ease-out data-[side=none]:min-w-[calc(var(--anchor-width)+1.75rem)] data-[side=none]:translate-y-px data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-[side=none]:data-ending-style:transition-none data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-[side=none]:data-starting-style:scale-100 data-[side=none]:data-starting-style:opacity-100 data-[side=none]:data-starting-style:transition-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none';
	const selectItem =
		'grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 py-1.5 pr-4 pl-2.5 text-sm outline-none select-none group-data-[side=none]:pr-12 data-highlighted:bg-neutral-950 data-highlighted:text-white dark:data-highlighted:bg-white dark:data-highlighted:text-neutral-950';
	const stepper =
		'flex h-full w-8 items-center justify-center rounded-none border border-neutral-950 bg-white bg-clip-padding text-neutral-950 outline-0 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 focus-visible:z-1 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400';
	const choice =
		'flex size-4 shrink-0 items-center justify-center border border-neutral-950 bg-white p-0 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-checked:bg-neutral-950 data-checked:text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 dark:data-checked:bg-white dark:data-checked:text-neutral-950';
	const scrollArrow =
		"z-1 flex h-4 w-full cursor-default items-center justify-center bg-white text-center text-xs before:absolute before:left-0 before:h-full before:w-full before:content-[''] dark:bg-neutral-950";
</script>

{#snippet CheckIcon()}
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
{/snippet}

{#snippet XIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="m4.5 4.5 7 7m-7 0 7-7" />
	</svg>
{/snippet}

{#snippet CaretDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}

{#snippet CaretUpDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M11 10H5l3 3.5zm0-4H5l3-3.5z" />
	</svg>
{/snippet}

{#snippet MinusIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="M1.5 8h13" />
	</svg>
{/snippet}

{#snippet PlusIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="M1.5 8h13M8 14.5v-13" />
	</svg>
{/snippet}

<Toast.Provider {toastManager} limit={1}>
	<Form
		aria-label="Launch new cloud server"
		class="flex w-full max-w-3xs flex-col gap-5 sm:max-w-[20rem]"
		onFormSubmit={(values) => {
			toastManager.add({
				title: 'Form submitted',
				description: 'The form contains these values:',
				data: values
			});
		}}
	>
		<Field.Root name="serverName" class={field}>
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

		<Field.Root name="region" class={field}>
			<Combobox.Root items={regions} required>
				<Field.Label class={label}>Region</Field.Label>
				<Combobox.InputGroup
					class="relative h-8 w-64 border border-neutral-950 bg-white focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-neutral-950 dark:focus-within:outline-white dark:border-white dark:bg-neutral-950 [&>input]:pr-[2.5rem] has-[.combobox-clear]:[&>input]:pr-[calc(0.5rem+2rem*2)]"
				>
					<Combobox.Input
						placeholder="e.g. eu-central-1"
						class="h-full w-full border-0 bg-white pl-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 outline-none placeholder:text-neutral-500 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
					/>
					<div
						class="absolute right-0 bottom-0 inline-flex h-full items-center justify-center text-neutral-500 dark:text-neutral-400"
					>
						<Combobox.Clear
							aria-label="Clear selection"
							class="combobox-clear flex h-full w-6 items-center justify-center border-0 bg-transparent p-0 text-neutral-950 dark:text-white"
						>
							{@render XIcon()}
						</Combobox.Clear>
						<Combobox.Trigger
							aria-label="Open popup"
							class="flex h-full w-6 items-center justify-center border-0 bg-transparent p-0 text-neutral-950 dark:text-white"
						>
							{@render CaretDownIcon()}
						</Combobox.Trigger>
					</div>
				</Combobox.InputGroup>
				<Combobox.Portal>
					<Combobox.Positioner class="z-10 outline-none" sideOffset={4}>
						<Combobox.Popup class={comboboxPopup}>
							<Combobox.Empty>
								<div
									class="py-4 pr-4 pl-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400"
								>
									No matches
								</div>
							</Combobox.Empty>
							<Combobox.List
								class="max-h-[min(22.5rem,var(--available-height))] overflow-y-auto overscroll-contain py-1 scroll-py-1 outline-0 data-empty:p-0"
							>
								<Combobox.Collection>
									{#snippet children(region: string)}
										<Combobox.Item value={region} class={comboboxItem}>
											<Combobox.ItemIndicator class="col-start-1">
												{@render CheckIcon()}
											</Combobox.ItemIndicator>
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

		<Field.Root name="containerImage" class={field}>
			<Autocomplete.Root
				items={images}
				mode="both"
				itemToStringValue={(image: Image) => image.url}
				required
			>
				<Field.Label class={label}>Container image</Field.Label>
				<Autocomplete.Input
					placeholder="e.g. docker.io/library/node:latest"
					class={autocompleteInput}
				/>
				<Field.Description class={description}>
					Enter a registry URL with optional tags
				</Field.Description>
				<Autocomplete.Portal>
					<Autocomplete.Positioner class="z-10 outline-none data-empty:hidden" sideOffset={4}>
						<Autocomplete.Popup class={autocompletePopup}>
							<Autocomplete.List
								class="max-h-[min(22.5rem,var(--available-height))] overflow-y-auto overscroll-contain py-1 scroll-py-1 outline-0 data-empty:p-0"
							>
								<Autocomplete.Collection>
									{#snippet children(image: Image)}
										<Autocomplete.Item value={image} class={autocompleteItem}>
											<span>{image.name}</span>
											<span class="font-mono text-xs whitespace-nowrap opacity-80">{image.url}</span
											>
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

		<Field.Root name="serverType" class={field}>
			<Select.Root items={serverTypes} required>
				<div class="w-fit space-y-1">
					<Select.Label class="cursor-default {label}">Server type</Select.Label>
					<Select.Trigger
						class="flex h-8 w-48 min-w-40 cursor-default items-center justify-between gap-3 border border-neutral-950 bg-white pr-1 pl-2 text-sm font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 data-pressed:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 dark:data-pressed:bg-neutral-800"
					>
						<Select.Value
							class="data-placeholder:text-neutral-500 dark:data-placeholder:text-neutral-400"
						/>
						<Select.Icon>{@render CaretUpDownIcon()}</Select.Icon>
					</Select.Trigger>
				</div>
				<Select.Portal>
					<Select.Positioner class="z-10 outline-none select-none" sideOffset={4}>
						<Select.Popup class={selectPopup}>
							<Select.ScrollUpArrow class="top-0 data-[side=none]:before:-top-full {scrollArrow}">
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="currentColor"
									style="display: block"
								>
									<path d="M12 10H4l4-4.5z" />
								</svg>
							</Select.ScrollUpArrow>
							<Select.List
								class="relative max-h-(--available-height) overflow-y-auto py-1 scroll-py-6"
							>
								{#each serverTypes as type (type.value)}
									<Select.Item value={type.value} class={selectItem}>
										<Select.ItemIndicator class="col-start-1">
											{@render CheckIcon()}
										</Select.ItemIndicator>
										<Select.ItemText class="col-start-2">{type.label}</Select.ItemText>
									</Select.Item>
								{/each}
							</Select.List>
							<Select.ScrollDownArrow
								class="bottom-0 data-[side=none]:before:-bottom-full {scrollArrow}"
							>
								{@render CaretDownIcon()}
							</Select.ScrollDownArrow>
						</Select.Popup>
					</Select.Positioner>
				</Select.Portal>
			</Select.Root>
			<Field.Error class={error} />
		</Field.Root>

		<Field.Root name="numOfInstances" class={field}>
			<NumberField.Root min={1} max={64} required class="flex flex-col items-start gap-1">
				<Field.Label class={label}>Number of instances</Field.Label>
				<NumberField.Group class="flex h-8">
					<NumberField.Decrement class={stepper} aria-label="Decrease">
						{@render MinusIcon()}
					</NumberField.Decrement>
					<NumberField.Input
						class="h-full w-16 rounded-none border-y border-neutral-950 bg-white px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 tabular-nums focus:z-1 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:bg-neutral-950 dark:text-white"
					/>
					<NumberField.Increment class={stepper} aria-label="Increase">
						{@render PlusIcon()}
					</NumberField.Increment>
				</NumberField.Group>
			</NumberField.Root>
			<Field.Error class={error} />
		</Field.Root>

		<Field.Root name="scalingThreshold" class={field}>
			<Fieldset.Root class="w-full">
				<Slider.Root
					defaultValue={[0.2, 0.8]}
					thumbAlignment="edge"
					min={0}
					max={1}
					step={0.01}
					format={{ style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 0 }}
					class="grid w-full grid-cols-2 gap-y-2"
				>
					<Fieldset.Legend class={label}>Scaling threshold</Fieldset.Legend>
					<Slider.Value
						class="col-start-2 text-end text-sm font-normal text-neutral-950 dark:text-white"
					/>
					<Slider.Control class="col-span-2 flex touch-none items-center py-3 select-none">
						<Slider.Track class="h-1 w-full bg-neutral-200 select-none dark:bg-neutral-800">
							<Slider.Indicator class="bg-neutral-950 select-none dark:bg-white" />
							{#each ['Minimum threshold', 'Maximum threshold'] as thumbLabel, index (thumbLabel)}
								<Slider.Thumb
									{index}
									aria-label={thumbLabel}
									class="size-4 border border-neutral-950 bg-white select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:has-[:focus-visible]:outline-white"
								/>
							{/each}
						</Slider.Track>
					</Slider.Control>
				</Slider.Root>
			</Fieldset.Root>
		</Field.Root>

		<Field.Root name="storageType" class={field}>
			<Fieldset.Root class="flex w-full flex-row items-start gap-4">
				<Fieldset.Legend class="-mt-px {label}">Storage type</Fieldset.Legend>
				<RadioGroup
					defaultValue="ssd"
					class="flex flex-row items-start gap-4 text-neutral-950 dark:text-white"
				>
					{#each ['ssd', 'hdd'] as value (value)}
						<Field.Item>
							<Field.Label class={choiceLabel}>
								<Radio.Root {value} class="{choice} rounded-full">
									<Radio.Indicator
										class="flex items-center justify-center data-unchecked:hidden before:size-2 before:rounded-full before:bg-current"
									/>
								</Radio.Root>
								{value}
							</Field.Label>
						</Field.Item>
					{/each}
				</RadioGroup>
			</Fieldset.Root>
		</Field.Root>

		<Field.Root name="restartOnFailure" class={field}>
			<Field.Label class="flex items-center gap-2 {label}">
				Restart on failure
				<Switch.Root
					defaultChecked
					class="flex h-5 w-9 shrink-0 border border-neutral-950 bg-white p-0.5 transition-colors duration-150 ease-[ease] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-checked:bg-neutral-950 dark:border-white dark:bg-neutral-950 dark:data-checked:bg-white"
				>
					<Switch.Thumb
						class="size-3.5 bg-neutral-950 transition-[translate,background-color] duration-150 ease-[ease] data-checked:translate-x-4 data-checked:bg-white dark:bg-white dark:data-checked:bg-neutral-950"
					/>
				</Switch.Root>
			</Field.Label>
		</Field.Root>

		<Field.Root name="allowedNetworkProtocols" class={field}>
			<Fieldset.Root class="flex flex-col items-start gap-1">
				<Fieldset.Legend class="mb-2 {label}">Allowed network protocols</Fieldset.Legend>
				<CheckboxGroup defaultValue={[]} class="flex gap-4 text-neutral-950 dark:text-white">
					{#each ['http', 'https', 'ssh'] as value (value)}
						<Field.Item>
							<Field.Label class={choiceLabel}>
								<Checkbox.Root {value} class="{choice} rounded-none">
									<Checkbox.Indicator class="flex data-unchecked:hidden">
										{@render CheckIcon()}
									</Checkbox.Indicator>
								</Checkbox.Root>
								{value}
							</Field.Label>
						</Field.Item>
					{/each}
				</CheckboxGroup>
			</Fieldset.Root>
		</Field.Root>

		<button
			class="mt-3 flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none font-normal whitespace-nowrap text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700"
		>
			Launch server
		</button>
	</Form>
	<Toast.Portal>
		<Toast.Viewport
			class="fixed top-auto right-4 bottom-4 z-10 mx-auto flex w-[250px] sm:right-8 sm:bottom-8 sm:w-[360px]"
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
				toastManager.add({
					title: 'Form submitted',
					description: 'The form contains these values:',
					data: form.data
				});
			}
		}
	);

	const field = 'flex flex-col items-start gap-1';
	const label = 'text-sm font-bold text-neutral-950 dark:text-white';
	const choiceLabel =
		'flex items-center gap-2 text-sm font-normal text-neutral-950 uppercase dark:text-white';
	const input =
		'h-8 w-full max-w-xs border border-neutral-950 bg-white px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400';
	const autocompleteInput =
		'h-8 w-[16rem] border border-neutral-950 bg-white px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white md:w-[20rem] dark:border-white dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400';
	const description = 'text-sm text-neutral-600 dark:text-neutral-400';
	const error = 'text-sm text-red-700 dark:text-red-400';
	const comboboxPopup =
		'w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0_rgb(0_0_0/12%)] transition-[scale,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none';
	const comboboxItem =
		'grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 p-2 text-sm leading-4 outline-none select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white';
	const autocompletePopup =
		'w-(--anchor-width) max-w-(--available-width) border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none';
	const autocompleteItem =
		'flex cursor-default flex-col gap-0.25 py-2 pr-8 pl-2 text-sm leading-4 outline-none select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white';
	const selectPopup =
		'group min-w-(--anchor-width) origin-(--transform-origin) border border-neutral-950 bg-white bg-clip-padding text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[scale,opacity] duration-100 ease-out data-[side=none]:min-w-[calc(var(--anchor-width)+1.75rem)] data-[side=none]:translate-y-px data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-[side=none]:data-ending-style:transition-none data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-[side=none]:data-starting-style:scale-100 data-[side=none]:data-starting-style:opacity-100 data-[side=none]:data-starting-style:transition-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none';
	const selectItem =
		'grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 py-1.5 pr-4 pl-2.5 text-sm outline-none select-none group-data-[side=none]:pr-12 data-highlighted:bg-neutral-950 data-highlighted:text-white dark:data-highlighted:bg-white dark:data-highlighted:text-neutral-950';
	const stepper =
		'flex h-full w-8 items-center justify-center rounded-none border border-neutral-950 bg-white bg-clip-padding text-neutral-950 outline-0 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 focus-visible:z-1 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400';
	const choice =
		'flex size-4 shrink-0 items-center justify-center border border-neutral-950 bg-white p-0 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-checked:bg-neutral-950 data-checked:text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 dark:data-checked:bg-white dark:data-checked:text-neutral-950';
	const scrollArrow =
		"z-1 flex h-4 w-full cursor-default items-center justify-center bg-white text-center text-xs before:absolute before:left-0 before:h-full before:w-full before:content-[''] dark:bg-neutral-950";
</script>

{#snippet CheckIcon()}
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
{/snippet}

{#snippet XIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="m4.5 4.5 7 7m-7 0 7-7" />
	</svg>
{/snippet}

{#snippet CaretDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}

{#snippet CaretUpDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M11 10H5l3 3.5zm0-4H5l3-3.5z" />
	</svg>
{/snippet}

{#snippet MinusIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="M1.5 8h13" />
	</svg>
{/snippet}

{#snippet PlusIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="M1.5 8h13M8 14.5v-13" />
	</svg>
{/snippet}

<Toast.Provider {toastManager} limit={1}>
	<Form
		aria-label="Launch new cloud server"
		class="flex w-full max-w-3xs flex-col gap-5 sm:max-w-[20rem]"
		{@attach fromAction(enhance)}
	>
		<Field.Root
			name="serverName"
			invalid={!!$errors.serverName}
			dirty={isTainted($tainted?.serverName)}
			class={field}
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
			class={field}
		>
			<Combobox.Root items={regions} bind:value={$form.region}>
				<Field.Label class={label}>Region</Field.Label>
				<Combobox.InputGroup
					class="relative h-8 w-64 border border-neutral-950 bg-white focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-neutral-950 dark:focus-within:outline-white dark:border-white dark:bg-neutral-950 [&>input]:pr-[2.5rem] has-[.combobox-clear]:[&>input]:pr-[calc(0.5rem+2rem*2)]"
				>
					<Combobox.Input
						placeholder="e.g. eu-central-1"
						class="h-full w-full border-0 bg-white pl-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 outline-none placeholder:text-neutral-500 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
					/>
					<div
						class="absolute right-0 bottom-0 inline-flex h-full items-center justify-center text-neutral-500 dark:text-neutral-400"
					>
						<Combobox.Clear
							aria-label="Clear selection"
							class="combobox-clear flex h-full w-6 items-center justify-center border-0 bg-transparent p-0 text-neutral-950 dark:text-white"
						>
							{@render XIcon()}
						</Combobox.Clear>
						<Combobox.Trigger
							aria-label="Open popup"
							class="flex h-full w-6 items-center justify-center border-0 bg-transparent p-0 text-neutral-950 dark:text-white"
						>
							{@render CaretDownIcon()}
						</Combobox.Trigger>
					</div>
				</Combobox.InputGroup>
				<Combobox.Portal>
					<Combobox.Positioner class="z-10 outline-none" sideOffset={4}>
						<Combobox.Popup class={comboboxPopup}>
							<Combobox.Empty>
								<div
									class="py-4 pr-4 pl-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400"
								>
									No matches
								</div>
							</Combobox.Empty>
							<Combobox.List
								class="max-h-[min(22.5rem,var(--available-height))] overflow-y-auto overscroll-contain py-1 scroll-py-1 outline-0 data-empty:p-0"
							>
								<Combobox.Collection>
									{#snippet children(region: string)}
										<Combobox.Item value={region} class={comboboxItem}>
											<Combobox.ItemIndicator class="col-start-1">
												{@render CheckIcon()}
											</Combobox.ItemIndicator>
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
			class={field}
		>
			<Autocomplete.Root
				items={images}
				mode="both"
				itemToStringValue={(image: Image) => image.url}
				bind:value={$form.containerImage}
			>
				<Field.Label class={label}>Container image</Field.Label>
				<Autocomplete.Input
					placeholder="e.g. docker.io/library/node:latest"
					class={autocompleteInput}
				/>
				<Field.Description class={description}>
					Enter a registry URL with optional tags
				</Field.Description>
				<Autocomplete.Portal>
					<Autocomplete.Positioner class="z-10 outline-none data-empty:hidden" sideOffset={4}>
						<Autocomplete.Popup class={autocompletePopup}>
							<Autocomplete.List
								class="max-h-[min(22.5rem,var(--available-height))] overflow-y-auto overscroll-contain py-1 scroll-py-1 outline-0 data-empty:p-0"
							>
								<Autocomplete.Collection>
									{#snippet children(image: Image)}
										<Autocomplete.Item value={image} class={autocompleteItem}>
											<span>{image.name}</span>
											<span class="font-mono text-xs whitespace-nowrap opacity-80">{image.url}</span
											>
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
			class={field}
		>
			<Select.Root items={serverTypes} bind:value={$form.serverType}>
				<div class="w-fit space-y-1">
					<Select.Label class="cursor-default {label}">Server type</Select.Label>
					<Select.Trigger
						class="flex h-8 w-48 min-w-40 cursor-default items-center justify-between gap-3 border border-neutral-950 bg-white pr-1 pl-2 text-sm font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 data-pressed:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 dark:data-pressed:bg-neutral-800"
					>
						<Select.Value
							class="data-placeholder:text-neutral-500 dark:data-placeholder:text-neutral-400"
						/>
						<Select.Icon>{@render CaretUpDownIcon()}</Select.Icon>
					</Select.Trigger>
				</div>
				<Select.Portal>
					<Select.Positioner class="z-10 outline-none select-none" sideOffset={4}>
						<Select.Popup class={selectPopup}>
							<Select.ScrollUpArrow class="top-0 data-[side=none]:before:-top-full {scrollArrow}">
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="currentColor"
									style="display: block"
								>
									<path d="M12 10H4l4-4.5z" />
								</svg>
							</Select.ScrollUpArrow>
							<Select.List
								class="relative max-h-(--available-height) overflow-y-auto py-1 scroll-py-6"
							>
								{#each serverTypes as type (type.value)}
									<Select.Item value={type.value} class={selectItem}>
										<Select.ItemIndicator class="col-start-1">
											{@render CheckIcon()}
										</Select.ItemIndicator>
										<Select.ItemText class="col-start-2">{type.label}</Select.ItemText>
									</Select.Item>
								{/each}
							</Select.List>
							<Select.ScrollDownArrow
								class="bottom-0 data-[side=none]:before:-bottom-full {scrollArrow}"
							>
								{@render CaretDownIcon()}
							</Select.ScrollDownArrow>
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
			class={field}
		>
			<NumberField.Root
				bind:value={$form.numOfInstances}
				min={1}
				max={64}
				class="flex flex-col items-start gap-1"
			>
				<Field.Label class={label}>Number of instances</Field.Label>
				<NumberField.Group class="flex h-8">
					<NumberField.Decrement class={stepper} aria-label="Decrease">
						{@render MinusIcon()}
					</NumberField.Decrement>
					<NumberField.Input
						class="h-full w-16 rounded-none border-y border-neutral-950 bg-white px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 tabular-nums focus:z-1 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:bg-neutral-950 dark:text-white"
					/>
					<NumberField.Increment class={stepper} aria-label="Increase">
						{@render PlusIcon()}
					</NumberField.Increment>
				</NumberField.Group>
			</NumberField.Root>
			<Field.Error match={!!$errors.numOfInstances} class={error}>
				{$errors.numOfInstances?.[0]}
			</Field.Error>
		</Field.Root>

		<Field.Root name="scalingThreshold" class={field} dirty={isTainted($tainted?.scalingThreshold)}>
			<Fieldset.Root class="w-full">
				<Slider.Root
					bind:value={$form.scalingThreshold}
					thumbAlignment="edge"
					min={0}
					max={1}
					step={0.01}
					format={{ style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 0 }}
					class="grid w-full grid-cols-2 gap-y-2"
				>
					<Fieldset.Legend class={label}>Scaling threshold</Fieldset.Legend>
					<Slider.Value
						class="col-start-2 text-end text-sm font-normal text-neutral-950 dark:text-white"
					/>
					<Slider.Control class="col-span-2 flex touch-none items-center py-3 select-none">
						<Slider.Track class="h-1 w-full bg-neutral-200 select-none dark:bg-neutral-800">
							<Slider.Indicator class="bg-neutral-950 select-none dark:bg-white" />
							{#each ['Minimum threshold', 'Maximum threshold'] as thumbLabel, index (thumbLabel)}
								<Slider.Thumb
									{index}
									aria-label={thumbLabel}
									class="size-4 border border-neutral-950 bg-white select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:has-[:focus-visible]:outline-white"
								/>
							{/each}
						</Slider.Track>
					</Slider.Control>
				</Slider.Root>
			</Fieldset.Root>
		</Field.Root>

		<Field.Root name="storageType" class={field} dirty={isTainted($tainted?.storageType)}>
			<Fieldset.Root class="flex w-full flex-row items-start gap-4">
				<Fieldset.Legend class="-mt-px {label}">Storage type</Fieldset.Legend>
				<RadioGroup
					bind:value={$form.storageType}
					class="flex flex-row items-start gap-4 text-neutral-950 dark:text-white"
				>
					{#each ['ssd', 'hdd'] as value (value)}
						<Field.Item>
							<Field.Label class={choiceLabel}>
								<Radio.Root {value} class="{choice} rounded-full">
									<Radio.Indicator
										class="flex items-center justify-center data-unchecked:hidden before:size-2 before:rounded-full before:bg-current"
									/>
								</Radio.Root>
								{value}
							</Field.Label>
						</Field.Item>
					{/each}
				</RadioGroup>
			</Fieldset.Root>
		</Field.Root>

		<Field.Root name="restartOnFailure" class={field} dirty={isTainted($tainted?.restartOnFailure)}>
			<Field.Label class="flex items-center gap-2 {label}">
				Restart on failure
				<Switch.Root
					bind:checked={$form.restartOnFailure}
					class="flex h-5 w-9 shrink-0 border border-neutral-950 bg-white p-0.5 transition-colors duration-150 ease-[ease] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-checked:bg-neutral-950 dark:border-white dark:bg-neutral-950 dark:data-checked:bg-white"
				>
					<Switch.Thumb
						class="size-3.5 bg-neutral-950 transition-[translate,background-color] duration-150 ease-[ease] data-checked:translate-x-4 data-checked:bg-white dark:bg-white dark:data-checked:bg-neutral-950"
					/>
				</Switch.Root>
			</Field.Label>
		</Field.Root>

		<Field.Root
			name="allowedNetworkProtocols"
			class={field}
			dirty={isTainted($tainted?.allowedNetworkProtocols)}
		>
			<Fieldset.Root class="flex flex-col items-start gap-1">
				<Fieldset.Legend class="mb-2 {label}">Allowed network protocols</Fieldset.Legend>
				<CheckboxGroup
					bind:value={$form.allowedNetworkProtocols}
					class="flex gap-4 text-neutral-950 dark:text-white"
				>
					{#each ['http', 'https', 'ssh'] as value (value)}
						<Field.Item>
							<Field.Label class={choiceLabel}>
								<Checkbox.Root {value} class="{choice} rounded-none">
									<Checkbox.Indicator class="flex data-unchecked:hidden">
										{@render CheckIcon()}
									</Checkbox.Indicator>
								</Checkbox.Root>
								{value}
							</Field.Label>
						</Field.Item>
					{/each}
				</CheckboxGroup>
			</Fieldset.Root>
		</Field.Root>

		<button
			class="mt-3 flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none font-normal whitespace-nowrap text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700"
		>
			Launch server
		</button>
	</Form>
	<Toast.Portal>
		<Toast.Viewport
			class="fixed top-auto right-4 bottom-4 z-10 mx-auto flex w-[250px] sm:right-8 sm:bottom-8 sm:w-[360px]"
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
