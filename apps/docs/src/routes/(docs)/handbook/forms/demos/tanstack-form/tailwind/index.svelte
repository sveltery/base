<script lang="ts">
	import { createForm, revalidateLogic } from '@tanstack/svelte-form';
	import type { DeepKeys, ValidationError } from '@tanstack/svelte-form';
	import { Autocomplete } from '@sveltery/base/autocomplete';
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';
	import { Combobox } from '@sveltery/base/combobox';
	import { Field } from '@sveltery/base/field';
	import { Fieldset } from '@sveltery/base/fieldset';
	import { NumberField } from '@sveltery/base/number-field';
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';
	import { Select } from '@sveltery/base/select';
	import { Slider } from '@sveltery/base/slider';
	import { Switch } from '@sveltery/base/switch';
	import { Toast } from '@sveltery/base/toast';
	import ToastList from '../../components/ToastList.svelte';

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

	interface FormValues {
		serverName: string;
		region: string | null;
		containerImage: string;
		serverType: string | null;
		numOfInstances: number | null;
		scalingThreshold: number[];
		storageType: string;
		restartOnFailure: boolean;
		allowedNetworkProtocols: string[];
	}

	const defaultValues: FormValues = {
		serverName: '',
		region: null,
		containerImage: '',
		serverType: null,
		numOfInstances: null,
		scalingThreshold: [0.2, 0.8],
		storageType: 'ssd',
		restartOnFailure: true,
		allowedNetworkProtocols: []
	};

	const toastManager = Toast.createToastManager();

	const form = createForm(() => ({
		defaultValues,
		onSubmit: ({ value: formValues }) => {
			toastManager.add({
				title: 'Form submitted',
				description: 'The form contains these values:',
				data: formValues
			});
		},
		validationLogic: revalidateLogic({
			mode: 'submit',
			modeAfterSubmission: 'change'
		}),
		validators: {
			onDynamic: ({ value: formValues }) => {
				const errors: Partial<Record<DeepKeys<FormValues>, ValidationError>> = {};

				(
					['serverName', 'region', 'containerImage', 'serverType', 'numOfInstances'] as const
				).forEach((requiredField) => {
					if (!formValues[requiredField]) {
						errors[requiredField] = 'This is a required field.';
					}
				});

				if (formValues.serverName && formValues.serverName.length < 3) {
					errors.serverName = 'At least 3 characters.';
				}

				return Object.keys(errors).length === 0 ? undefined : { form: errors, fields: errors };
			}
		}
	}));

	const fieldRoot = 'flex flex-col items-start gap-1';
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
	<form
		aria-label="Launch new cloud server"
		class="flex w-full max-w-3xs flex-col gap-5 sm:max-w-[20rem]"
		novalidate
		onsubmit={(event) => {
			event.preventDefault();
			form.handleSubmit();
		}}
	>
		<form.Field name="serverName">
			{#snippet children(field)}
				<Field.Root
					name={field.name}
					invalid={!field.state.meta.isValid}
					dirty={field.state.meta.isDirty}
					touched={field.state.meta.isTouched}
					class={fieldRoot}
				>
					<Field.Label class={label}>Server name</Field.Label>
					<Field.Control
						onblur={field.handleBlur}
						bind:value={() => field.state.value, (value) => field.handleChange(value)}
						placeholder="e.g. api-server-01"
						class={input}
					/>
					<Field.Description class={description}
						>Must be 3 or more characters long</Field.Description
					>
					<Field.Error match={!field.state.meta.isValid} class={error}
						>{field.state.meta.errors.join(',')}</Field.Error
					>
				</Field.Root>
			{/snippet}
		</form.Field>

		<form.Field name="region">
			{#snippet children(field)}
				<Field.Root
					name={field.name}
					invalid={!field.state.meta.isValid}
					dirty={field.state.meta.isDirty}
					touched={field.state.meta.isTouched}
					class={fieldRoot}
				>
					<Combobox.Root
						items={regions}
						bind:value={() => field.state.value, (value) => field.handleChange(value)}
					>
						<Field.Label class={label}>Region</Field.Label>
						<Combobox.InputGroup
							class="relative h-8 w-64 border border-neutral-950 bg-white focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-neutral-950 dark:focus-within:outline-white dark:border-white dark:bg-neutral-950 [&>input]:pr-[2.5rem] has-[.combobox-clear]:[&>input]:pr-[calc(0.5rem+2rem*2)]"
						>
							<Combobox.Input
								onblur={field.handleBlur}
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
					<Field.Error match={!field.state.meta.isValid} class={error}
						>{field.state.meta.errors.join(',')}</Field.Error
					>
				</Field.Root>
			{/snippet}
		</form.Field>

		<form.Field name="containerImage">
			{#snippet children(field)}
				<Field.Root
					name={field.name}
					invalid={!field.state.meta.isValid}
					dirty={field.state.meta.isDirty}
					touched={field.state.meta.isTouched}
					class={fieldRoot}
				>
					<Autocomplete.Root
						items={images}
						mode="both"
						itemToStringValue={(image: Image) => image.url}
						bind:value={() => field.state.value, (value) => field.handleChange(value)}
					>
						<Field.Label class={label}>Container image</Field.Label>
						<Autocomplete.Input
							onblur={field.handleBlur}
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
													<span class="font-mono text-xs whitespace-nowrap opacity-80"
														>{image.url}</span
													>
												</Autocomplete.Item>
											{/snippet}
										</Autocomplete.Collection>
									</Autocomplete.List>
								</Autocomplete.Popup>
							</Autocomplete.Positioner>
						</Autocomplete.Portal>
					</Autocomplete.Root>
					<Field.Error match={!field.state.meta.isValid} class={error}
						>{field.state.meta.errors.join(',')}</Field.Error
					>
				</Field.Root>
			{/snippet}
		</form.Field>

		<form.Field name="serverType">
			{#snippet children(field)}
				<Field.Root
					name={field.name}
					invalid={!field.state.meta.isValid}
					dirty={field.state.meta.isDirty}
					touched={field.state.meta.isTouched}
					class={fieldRoot}
				>
					<Select.Root
						items={serverTypes}
						bind:value={() => field.state.value, (value) => field.handleChange(value)}
					>
						<div class="w-fit space-y-1">
							<Select.Label class="cursor-default {label}">Server type</Select.Label>
							<Select.Trigger
								onblur={field.handleBlur}
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
									<Select.ScrollUpArrow
										class="top-0 data-[side=none]:before:-top-full {scrollArrow}"
									>
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
					<Field.Error match={!field.state.meta.isValid} class={error}
						>{field.state.meta.errors.join(',')}</Field.Error
					>
				</Field.Root>
			{/snippet}
		</form.Field>

		<form.Field name="numOfInstances">
			{#snippet children(field)}
				<Field.Root
					name={field.name}
					invalid={!field.state.meta.isValid}
					dirty={field.state.meta.isDirty}
					touched={field.state.meta.isTouched}
					class={fieldRoot}
				>
					<NumberField.Root
						bind:value={() => field.state.value, (value) => field.handleChange(value)}
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
								onblur={field.handleBlur}
								class="h-full w-16 rounded-none border-y border-neutral-950 bg-white px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 tabular-nums focus:z-1 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:bg-neutral-950 dark:text-white"
							/>
							<NumberField.Increment class={stepper} aria-label="Increase">
								{@render PlusIcon()}
							</NumberField.Increment>
						</NumberField.Group>
					</NumberField.Root>
					<Field.Error match={!field.state.meta.isValid} class={error}
						>{field.state.meta.errors.join(',')}</Field.Error
					>
				</Field.Root>
			{/snippet}
		</form.Field>

		<form.Field name="scalingThreshold">
			{#snippet children(field)}
				<Field.Root
					name={field.name}
					invalid={!field.state.meta.isValid}
					dirty={field.state.meta.isDirty}
					touched={field.state.meta.isTouched}
					class={fieldRoot}
				>
					<Fieldset.Root class="w-full">
						<Slider.Root
							bind:value={() => field.state.value, (value) => field.handleChange(value)}
							onValueCommitted={(value) => field.handleChange(value as number[])}
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
											onblur={field.handleBlur}
											class="size-4 border border-neutral-950 bg-white select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:has-[:focus-visible]:outline-white"
										/>
									{/each}
								</Slider.Track>
							</Slider.Control>
						</Slider.Root>
					</Fieldset.Root>
					<Field.Error match={!field.state.meta.isValid} class={error}
						>{field.state.meta.errors.join(',')}</Field.Error
					>
				</Field.Root>
			{/snippet}
		</form.Field>

		<form.Field name="storageType">
			{#snippet children(field)}
				<Field.Root
					name={field.name}
					invalid={!field.state.meta.isValid}
					dirty={field.state.meta.isDirty}
					touched={field.state.meta.isTouched}
					class={fieldRoot}
				>
					<Fieldset.Root class="flex w-full flex-row items-start gap-4">
						<Fieldset.Legend class="-mt-px {label}">Storage type</Fieldset.Legend>
						<RadioGroup
							bind:value={() => field.state.value, (value) => field.handleChange(value)}
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
					<Field.Error match={!field.state.meta.isValid} class={error}
						>{field.state.meta.errors.join(',')}</Field.Error
					>
				</Field.Root>
			{/snippet}
		</form.Field>

		<form.Field name="restartOnFailure">
			{#snippet children(field)}
				<Field.Root
					name={field.name}
					invalid={!field.state.meta.isValid}
					dirty={field.state.meta.isDirty}
					touched={field.state.meta.isTouched}
					class={fieldRoot}
				>
					<Field.Label class="flex items-center gap-2 {label}">
						Restart on failure
						<Switch.Root
							onblur={field.handleBlur}
							bind:checked={() => field.state.value, (checked) => field.handleChange(checked)}
							class="flex h-5 w-9 shrink-0 border border-neutral-950 bg-white p-0.5 transition-colors duration-150 ease-[ease] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-checked:bg-neutral-950 dark:border-white dark:bg-neutral-950 dark:data-checked:bg-white"
						>
							<Switch.Thumb
								class="size-3.5 bg-neutral-950 transition-[translate,background-color] duration-150 ease-[ease] data-checked:translate-x-4 data-checked:bg-white dark:bg-white dark:data-checked:bg-neutral-950"
							/>
						</Switch.Root>
					</Field.Label>
					<Field.Error match={!field.state.meta.isValid} class={error}
						>{field.state.meta.errors.join(',')}</Field.Error
					>
				</Field.Root>
			{/snippet}
		</form.Field>

		<form.Field name="allowedNetworkProtocols">
			{#snippet children(field)}
				<Field.Root
					name={field.name}
					invalid={!field.state.meta.isValid}
					dirty={field.state.meta.isDirty}
					touched={field.state.meta.isTouched}
					class={fieldRoot}
				>
					<Fieldset.Root class="flex flex-col items-start gap-1">
						<Fieldset.Legend class="mb-2 {label}">Allowed network protocols</Fieldset.Legend>
						<CheckboxGroup
							bind:value={() => field.state.value, (value) => field.handleChange(value)}
							class="flex gap-4 text-neutral-950 dark:text-white"
						>
							{#each ['http', 'https', 'ssh'] as value (value)}
								<Field.Item>
									<Field.Label class={choiceLabel}>
										<Checkbox.Root {value} onblur={field.handleBlur} class="{choice} rounded-none">
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
					<Field.Error match={!field.state.meta.isValid} class={error}
						>{field.state.meta.errors.join(',')}</Field.Error
					>
				</Field.Root>
			{/snippet}
		</form.Field>

		<button
			class="mt-3 flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none font-normal whitespace-nowrap text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700"
		>
			Launch server
		</button>
	</form>
	<Toast.Portal>
		<Toast.Viewport
			class="fixed top-auto right-4 bottom-4 z-10 mx-auto flex w-[250px] sm:right-8 sm:bottom-8 sm:w-[360px]"
		>
			<ToastList />
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
