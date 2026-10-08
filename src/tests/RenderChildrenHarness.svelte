<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		Accordion,
		Avatar,
		Button,
		Checkbox,
		CheckboxGroup,
		Collapsible,
		Dialog,
		Field,
		Fieldset,
		Form,
		Input,
		Meter,
		NumberField,
		OTPField,
		Popover,
		Progress,
		Radio,
		RadioGroup,
		ScrollArea,
		Separator,
		Slider,
		Switch,
		Tabs,
		Toggle,
		ToggleGroup,
		Toolbar
	} from '#lib';

	let { part, label }: { part: string; label?: string } = $props();
</script>

{#snippet probe(props: object, _state: object, children: Snippet | undefined)}
	<div
		{...props as HTMLAttributes<HTMLDivElement>}
		data-testid="host"
		data-kind={children ? 'snippet' : 'undefined'}
	>
		{@render children?.()}
	</div>
{/snippet}

{#if part === 'button'}
	{#if label}
		<Button render={probe}>{label}</Button>
	{:else}
		<Button render={probe} />
	{/if}
{:else if part === 'separator'}
	{#if label}
		<Separator render={probe}>{label}</Separator>
	{:else}
		<Separator render={probe} />
	{/if}
{:else if part === 'avatar-root'}
	{#if label}
		<Avatar.Root render={probe}>{label}</Avatar.Root>
	{:else}
		<Avatar.Root render={probe} />
	{/if}
{:else if part === 'avatar-fallback'}
	<Avatar.Root>
		{#if label}
			<Avatar.Fallback render={probe}>{label}</Avatar.Fallback>
		{:else}
			<Avatar.Fallback render={probe} />
		{/if}
	</Avatar.Root>
{:else if part === 'avatar-image'}
	<Avatar.Root>
		{#if label}
			<Avatar.Image keepMounted render={probe}>{label}</Avatar.Image>
		{:else}
			<Avatar.Image keepMounted render={probe} />
		{/if}
	</Avatar.Root>
{:else if part === 'accordion-root'}
	{#if label}
		<Accordion.Root value={['a']} render={probe}>{label}</Accordion.Root>
	{:else}
		<Accordion.Root value={['a']} render={probe} />
	{/if}
{:else if part === 'accordion-item'}
	<Accordion.Root value={['a']}>
		{#if label}
			<Accordion.Item value="a" render={probe}>{label}</Accordion.Item>
		{:else}
			<Accordion.Item value="a" render={probe} />
		{/if}
	</Accordion.Root>
{:else if part === 'accordion-header'}
	<Accordion.Root value={['a']}>
		<Accordion.Item value="a">
			{#if label}
				<Accordion.Header render={probe}>{label}</Accordion.Header>
			{:else}
				<Accordion.Header render={probe} />
			{/if}
		</Accordion.Item>
	</Accordion.Root>
{:else if part === 'accordion-trigger'}
	<Accordion.Root value={['a']}>
		<Accordion.Item value="a">
			{#if label}
				<Accordion.Trigger render={probe}>{label}</Accordion.Trigger>
			{:else}
				<Accordion.Trigger render={probe} />
			{/if}
		</Accordion.Item>
	</Accordion.Root>
{:else if part === 'accordion-panel'}
	<Accordion.Root value={['a']}>
		<Accordion.Item value="a">
			{#if label}
				<Accordion.Panel render={probe}>{label}</Accordion.Panel>
			{:else}
				<Accordion.Panel render={probe} />
			{/if}
		</Accordion.Item>
	</Accordion.Root>
{:else if part === 'checkbox-root'}
	{#if label}
		<Checkbox.Root checked render={probe}>{label}</Checkbox.Root>
	{:else}
		<Checkbox.Root checked render={probe} />
	{/if}
{:else if part === 'checkbox-indicator'}
	<Checkbox.Root checked>
		{#if label}
			<Checkbox.Indicator render={probe}>{label}</Checkbox.Indicator>
		{:else}
			<Checkbox.Indicator render={probe} />
		{/if}
	</Checkbox.Root>
{:else if part === 'checkbox-group'}
	{#if label}
		<CheckboxGroup render={probe}>{label}</CheckboxGroup>
	{:else}
		<CheckboxGroup render={probe} />
	{/if}
{:else if part === 'collapsible-root'}
	{#if label}
		<Collapsible.Root open render={probe}>{label}</Collapsible.Root>
	{:else}
		<Collapsible.Root open render={probe} />
	{/if}
{:else if part === 'collapsible-trigger'}
	<Collapsible.Root open>
		{#if label}
			<Collapsible.Trigger render={probe}>{label}</Collapsible.Trigger>
		{:else}
			<Collapsible.Trigger render={probe} />
		{/if}
	</Collapsible.Root>
{:else if part === 'collapsible-panel'}
	<Collapsible.Root open>
		{#if label}
			<Collapsible.Panel render={probe}>{label}</Collapsible.Panel>
		{:else}
			<Collapsible.Panel render={probe} />
		{/if}
	</Collapsible.Root>
{:else if part === 'dialog-trigger'}
	<Dialog.Root open modal={false}>
		{#if label}
			<Dialog.Trigger render={probe}>{label}</Dialog.Trigger>
		{:else}
			<Dialog.Trigger render={probe} />
		{/if}
	</Dialog.Root>
{:else if part === 'dialog-close'}
	<Dialog.Root open modal={false}>
		{#if label}
			<Dialog.Close render={probe}>{label}</Dialog.Close>
		{:else}
			<Dialog.Close render={probe} />
		{/if}
	</Dialog.Root>
{:else if part === 'dialog-title'}
	<Dialog.Root open modal={false}>
		{#if label}
			<Dialog.Title render={probe}>{label}</Dialog.Title>
		{:else}
			<Dialog.Title render={probe} />
		{/if}
	</Dialog.Root>
{:else if part === 'dialog-description'}
	<Dialog.Root open modal={false}>
		{#if label}
			<Dialog.Description render={probe}>{label}</Dialog.Description>
		{:else}
			<Dialog.Description render={probe} />
		{/if}
	</Dialog.Root>
{:else if part === 'dialog-popup'}
	<Dialog.Root open modal={false}>
		<Dialog.Portal>
			{#if label}
				<Dialog.Popup render={probe}>{label}</Dialog.Popup>
			{:else}
				<Dialog.Popup render={probe} />
			{/if}
		</Dialog.Portal>
	</Dialog.Root>
{:else if part === 'dialog-backdrop'}
	<Dialog.Root open modal={false}>
		<Dialog.Portal>
			{#if label}
				<Dialog.Backdrop render={probe}>{label}</Dialog.Backdrop>
			{:else}
				<Dialog.Backdrop render={probe} />
			{/if}
		</Dialog.Portal>
	</Dialog.Root>
{:else if part === 'dialog-viewport'}
	<Dialog.Root open modal={false}>
		<Dialog.Portal>
			{#if label}
				<Dialog.Viewport render={probe}>{label}</Dialog.Viewport>
			{:else}
				<Dialog.Viewport render={probe} />
			{/if}
		</Dialog.Portal>
	</Dialog.Root>
{:else if part === 'field-root'}
	{#if label}
		<Field.Root render={probe}>{label}</Field.Root>
	{:else}
		<Field.Root render={probe} />
	{/if}
{:else if part === 'field-control'}
	<Field.Root>
		{#if label}
			<Field.Control render={probe}>{label}</Field.Control>
		{:else}
			<Field.Control render={probe} />
		{/if}
	</Field.Root>
{:else if part === 'field-label'}
	<Field.Root>
		{#if label}
			<Field.Label nativeLabel={false} render={probe}>{label}</Field.Label>
		{:else}
			<Field.Label nativeLabel={false} render={probe} />
		{/if}
	</Field.Root>
{:else if part === 'field-description'}
	<Field.Root>
		{#if label}
			<Field.Description render={probe}>{label}</Field.Description>
		{:else}
			<Field.Description render={probe} />
		{/if}
	</Field.Root>
{:else if part === 'field-item'}
	<Field.Root>
		{#if label}
			<Field.Item render={probe}>{label}</Field.Item>
		{:else}
			<Field.Item render={probe} />
		{/if}
	</Field.Root>
{:else if part === 'field-error'}
	<Field.Root>
		{#if label}
			<Field.Error match={true} render={probe}>{label}</Field.Error>
		{:else}
			<Field.Error match={true} render={probe} />
		{/if}
	</Field.Root>
{:else if part === 'input'}
	<Field.Root>
		{#if label}
			<Input render={probe}>{label}</Input>
		{:else}
			<Input render={probe} />
		{/if}
	</Field.Root>
{:else if part === 'fieldset-root'}
	{#if label}
		<Fieldset.Root render={probe}>{label}</Fieldset.Root>
	{:else}
		<Fieldset.Root render={probe} />
	{/if}
{:else if part === 'fieldset-legend'}
	<Fieldset.Root>
		{#if label}
			<Fieldset.Legend render={probe}>{label}</Fieldset.Legend>
		{:else}
			<Fieldset.Legend render={probe} />
		{/if}
	</Fieldset.Root>
{:else if part === 'form'}
	{#if label}
		<Form render={probe}>{label}</Form>
	{:else}
		<Form render={probe} />
	{/if}
{:else if part === 'meter-root'}
	{#if label}
		<Meter.Root value={50} render={probe}>{label}</Meter.Root>
	{:else}
		<Meter.Root value={50} render={probe} />
	{/if}
{:else if part === 'meter-track'}
	<Meter.Root value={50}>
		{#if label}
			<Meter.Track render={probe}>{label}</Meter.Track>
		{:else}
			<Meter.Track render={probe} />
		{/if}
	</Meter.Root>
{:else if part === 'meter-indicator'}
	<Meter.Root value={50}>
		{#if label}
			<Meter.Indicator render={probe}>{label}</Meter.Indicator>
		{:else}
			<Meter.Indicator render={probe} />
		{/if}
	</Meter.Root>
{:else if part === 'meter-label'}
	<Meter.Root value={50}>
		{#if label}
			<Meter.Label render={probe}>{label}</Meter.Label>
		{:else}
			<Meter.Label render={probe} />
		{/if}
	</Meter.Root>
{:else if part === 'meter-value'}
	<Meter.Root value={50}>
		{#if label}
			<Meter.Value render={probe}>{label}</Meter.Value>
		{:else}
			<Meter.Value render={probe} />
		{/if}
	</Meter.Root>
{:else if part === 'number-field-root'}
	{#if label}
		<NumberField.Root render={probe}>{label}</NumberField.Root>
	{:else}
		<NumberField.Root render={probe} />
	{/if}
{:else if part === 'number-field-group'}
	<NumberField.Root>
		{#if label}
			<NumberField.Group render={probe}>{label}</NumberField.Group>
		{:else}
			<NumberField.Group render={probe} />
		{/if}
	</NumberField.Root>
{:else if part === 'number-field-input'}
	<NumberField.Root>
		{#if label}
			<NumberField.Input render={probe}>{label}</NumberField.Input>
		{:else}
			<NumberField.Input render={probe} />
		{/if}
	</NumberField.Root>
{:else if part === 'number-field-increment'}
	<NumberField.Root>
		{#if label}
			<NumberField.Increment render={probe}>{label}</NumberField.Increment>
		{:else}
			<NumberField.Increment render={probe} />
		{/if}
	</NumberField.Root>
{:else if part === 'number-field-decrement'}
	<NumberField.Root>
		{#if label}
			<NumberField.Decrement render={probe}>{label}</NumberField.Decrement>
		{:else}
			<NumberField.Decrement render={probe} />
		{/if}
	</NumberField.Root>
{:else if part === 'number-field-scrub'}
	<NumberField.Root>
		{#if label}
			<NumberField.ScrubArea render={probe}>{label}</NumberField.ScrubArea>
		{:else}
			<NumberField.ScrubArea render={probe} />
		{/if}
	</NumberField.Root>
{:else if part === 'otp-root'}
	{#if label}
		<OTPField.Root length={1} render={probe}>{label}</OTPField.Root>
	{:else}
		<OTPField.Root length={1} render={probe} />
	{/if}
{:else if part === 'otp-input'}
	<OTPField.Root length={1}>
		{#if label}
			<OTPField.Input render={probe}>{label}</OTPField.Input>
		{:else}
			<OTPField.Input render={probe} />
		{/if}
	</OTPField.Root>
{:else if part === 'popover-trigger'}
	<Popover.Root open>
		{#if label}
			<Popover.Trigger render={probe}>{label}</Popover.Trigger>
		{:else}
			<Popover.Trigger render={probe} />
		{/if}
	</Popover.Root>
{:else if part === 'popover-close'}
	<Popover.Root open>
		{#if label}
			<Popover.Close render={probe}>{label}</Popover.Close>
		{:else}
			<Popover.Close render={probe} />
		{/if}
	</Popover.Root>
{:else if part === 'popover-title'}
	<Popover.Root open>
		{#if label}
			<Popover.Title render={probe}>{label}</Popover.Title>
		{:else}
			<Popover.Title render={probe} />
		{/if}
	</Popover.Root>
{:else if part === 'popover-description'}
	<Popover.Root open>
		{#if label}
			<Popover.Description render={probe}>{label}</Popover.Description>
		{:else}
			<Popover.Description render={probe} />
		{/if}
	</Popover.Root>
{:else if part === 'popover-backdrop'}
	<Popover.Root open>
		{#if label}
			<Popover.Backdrop render={probe}>{label}</Popover.Backdrop>
		{:else}
			<Popover.Backdrop render={probe} />
		{/if}
	</Popover.Root>
{:else if part === 'popover-positioner'}
	<Popover.Root open>
		<Popover.Portal>
			{#if label}
				<Popover.Positioner render={probe}>{label}</Popover.Positioner>
			{:else}
				<Popover.Positioner render={probe} />
			{/if}
		</Popover.Portal>
	</Popover.Root>
{:else if part === 'popover-popup'}
	<Popover.Root open>
		<Popover.Portal>
			<Popover.Positioner>
				{#if label}
					<Popover.Popup render={probe}>{label}</Popover.Popup>
				{:else}
					<Popover.Popup render={probe} />
				{/if}
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{:else if part === 'popover-arrow'}
	<Popover.Root open>
		<Popover.Portal>
			<Popover.Positioner>
				{#if label}
					<Popover.Arrow render={probe}>{label}</Popover.Arrow>
				{:else}
					<Popover.Arrow render={probe} />
				{/if}
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{:else if part === 'popover-viewport'}
	<Popover.Root open>
		<Popover.Portal>
			<Popover.Positioner>
				{#if label}
					<Popover.Viewport render={probe}>{label}</Popover.Viewport>
				{:else}
					<Popover.Viewport render={probe} />
				{/if}
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{:else if part === 'progress-root'}
	{#if label}
		<Progress.Root value={40} render={probe}>{label}</Progress.Root>
	{:else}
		<Progress.Root value={40} render={probe} />
	{/if}
{:else if part === 'progress-track'}
	<Progress.Root value={40}>
		{#if label}
			<Progress.Track render={probe}>{label}</Progress.Track>
		{:else}
			<Progress.Track render={probe} />
		{/if}
	</Progress.Root>
{:else if part === 'progress-indicator'}
	<Progress.Root value={40}>
		{#if label}
			<Progress.Indicator render={probe}>{label}</Progress.Indicator>
		{:else}
			<Progress.Indicator render={probe} />
		{/if}
	</Progress.Root>
{:else if part === 'progress-label'}
	<Progress.Root value={40}>
		{#if label}
			<Progress.Label render={probe}>{label}</Progress.Label>
		{:else}
			<Progress.Label render={probe} />
		{/if}
	</Progress.Root>
{:else if part === 'progress-value'}
	<Progress.Root value={40}>
		{#if label}
			<Progress.Value render={probe}>{label}</Progress.Value>
		{:else}
			<Progress.Value render={probe} />
		{/if}
	</Progress.Root>
{:else if part === 'progress-value-indeterminate'}
	<Progress.Root value={null}>
		{#if label}
			<Progress.Value render={probe}>{label}</Progress.Value>
		{:else}
			<Progress.Value render={probe} />
		{/if}
	</Progress.Root>
{:else if part === 'radio-root'}
	{#if label}
		<Radio.Root value="" render={probe}>{label}</Radio.Root>
	{:else}
		<Radio.Root value="" render={probe} />
	{/if}
{:else if part === 'radio-indicator'}
	<Radio.Root value="">
		{#if label}
			<Radio.Indicator render={probe}>{label}</Radio.Indicator>
		{:else}
			<Radio.Indicator render={probe} />
		{/if}
	</Radio.Root>
{:else if part === 'radio-group'}
	{#if label}
		<RadioGroup render={probe}>{label}</RadioGroup>
	{:else}
		<RadioGroup render={probe} />
	{/if}
{:else if part === 'scroll-root'}
	{#if label}
		<ScrollArea.Root render={probe}>{label}</ScrollArea.Root>
	{:else}
		<ScrollArea.Root render={probe} />
	{/if}
{:else if part === 'scroll-viewport'}
	<ScrollArea.Root>
		{#if label}
			<ScrollArea.Viewport render={probe}>{label}</ScrollArea.Viewport>
		{:else}
			<ScrollArea.Viewport render={probe} />
		{/if}
	</ScrollArea.Root>
{:else if part === 'scroll-content'}
	<ScrollArea.Root>
		<ScrollArea.Viewport>
			{#if label}
				<ScrollArea.Content render={probe}>{label}</ScrollArea.Content>
			{:else}
				<ScrollArea.Content render={probe} />
			{/if}
		</ScrollArea.Viewport>
	</ScrollArea.Root>
{:else if part === 'scroll-scrollbar'}
	<ScrollArea.Root>
		{#if label}
			<ScrollArea.Scrollbar keepMounted render={probe}>{label}</ScrollArea.Scrollbar>
		{:else}
			<ScrollArea.Scrollbar keepMounted render={probe} />
		{/if}
	</ScrollArea.Root>
{:else if part === 'scroll-thumb'}
	<ScrollArea.Root>
		<ScrollArea.Scrollbar keepMounted>
			{#if label}
				<ScrollArea.Thumb render={probe}>{label}</ScrollArea.Thumb>
			{:else}
				<ScrollArea.Thumb render={probe} />
			{/if}
		</ScrollArea.Scrollbar>
	</ScrollArea.Root>
{:else if part === 'slider-root'}
	{#if label}
		<Slider.Root render={probe}>{label}</Slider.Root>
	{:else}
		<Slider.Root render={probe} />
	{/if}
{:else if part === 'slider-label'}
	<Slider.Root>
		{#if label}
			<Slider.Label render={probe}>{label}</Slider.Label>
		{:else}
			<Slider.Label render={probe} />
		{/if}
	</Slider.Root>
{:else if part === 'slider-value'}
	<Slider.Root>
		{#if label}
			<Slider.Value render={probe}>{label}</Slider.Value>
		{:else}
			<Slider.Value render={probe} />
		{/if}
	</Slider.Root>
{:else if part === 'slider-control'}
	<Slider.Root>
		{#if label}
			<Slider.Control render={probe}>{label}</Slider.Control>
		{:else}
			<Slider.Control render={probe} />
		{/if}
	</Slider.Root>
{:else if part === 'slider-track'}
	<Slider.Root>
		{#if label}
			<Slider.Track render={probe}>{label}</Slider.Track>
		{:else}
			<Slider.Track render={probe} />
		{/if}
	</Slider.Root>
{:else if part === 'slider-indicator'}
	<Slider.Root>
		{#if label}
			<Slider.Indicator render={probe}>{label}</Slider.Indicator>
		{:else}
			<Slider.Indicator render={probe} />
		{/if}
	</Slider.Root>
{:else if part === 'slider-thumb'}
	<Slider.Root>
		{#if label}
			<Slider.Thumb render={probe}>{label}</Slider.Thumb>
		{:else}
			<Slider.Thumb render={probe} />
		{/if}
	</Slider.Root>
{:else if part === 'switch-root'}
	{#if label}
		<Switch.Root checked render={probe}>{label}</Switch.Root>
	{:else}
		<Switch.Root checked render={probe} />
	{/if}
{:else if part === 'switch-thumb'}
	<Switch.Root checked>
		{#if label}
			<Switch.Thumb render={probe}>{label}</Switch.Thumb>
		{:else}
			<Switch.Thumb render={probe} />
		{/if}
	</Switch.Root>
{:else if part === 'tabs-root'}
	{#if label}
		<Tabs.Root value="a" render={probe}>{label}</Tabs.Root>
	{:else}
		<Tabs.Root value="a" render={probe} />
	{/if}
{:else if part === 'tabs-list'}
	<Tabs.Root value="a">
		{#if label}
			<Tabs.List render={probe}>{label}</Tabs.List>
		{:else}
			<Tabs.List render={probe} />
		{/if}
	</Tabs.Root>
{:else if part === 'tabs-tab'}
	<Tabs.Root value="a">
		<Tabs.List>
			{#if label}
				<Tabs.Tab value="a" render={probe}>{label}</Tabs.Tab>
			{:else}
				<Tabs.Tab value="a" render={probe} />
			{/if}
		</Tabs.List>
	</Tabs.Root>
{:else if part === 'tabs-panel'}
	<Tabs.Root value="a">
		{#if label}
			<Tabs.Panel value="a" render={probe}>{label}</Tabs.Panel>
		{:else}
			<Tabs.Panel value="a" render={probe} />
		{/if}
	</Tabs.Root>
{:else if part === 'toggle'}
	{#if label}
		<Toggle render={probe}>{label}</Toggle>
	{:else}
		<Toggle render={probe} />
	{/if}
{:else if part === 'toggle-group'}
	{#if label}
		<ToggleGroup render={probe}>{label}</ToggleGroup>
	{:else}
		<ToggleGroup render={probe} />
	{/if}
{:else if part === 'toolbar-root'}
	{#if label}
		<Toolbar.Root render={probe}>{label}</Toolbar.Root>
	{:else}
		<Toolbar.Root render={probe} />
	{/if}
{:else if part === 'toolbar-button'}
	<Toolbar.Root>
		{#if label}
			<Toolbar.Button render={probe}>{label}</Toolbar.Button>
		{:else}
			<Toolbar.Button render={probe} />
		{/if}
	</Toolbar.Root>
{:else if part === 'toolbar-group'}
	<Toolbar.Root>
		{#if label}
			<Toolbar.Group render={probe}>{label}</Toolbar.Group>
		{:else}
			<Toolbar.Group render={probe} />
		{/if}
	</Toolbar.Root>
{:else if part === 'toolbar-link'}
	<Toolbar.Root>
		{#if label}
			<Toolbar.Link render={probe}>{label}</Toolbar.Link>
		{:else}
			<Toolbar.Link render={probe} />
		{/if}
	</Toolbar.Root>
{:else if part === 'tabs-indicator'}
	<Tabs.Root value="a">
		<Tabs.List>
			<Tabs.Tab value="a">A</Tabs.Tab>
			{#if label}
				<Tabs.Indicator render={probe}>{label}</Tabs.Indicator>
			{:else}
				<Tabs.Indicator render={probe} />
			{/if}
		</Tabs.List>
	</Tabs.Root>
{:else if part === 'scroll-corner'}
	<ScrollArea.Root style="width: 200px; height: 200px">
		<ScrollArea.Viewport style="width: 100%; height: 100%">
			<ScrollArea.Content style="width: 1000px; height: 1000px">overflow</ScrollArea.Content>
		</ScrollArea.Viewport>
		<ScrollArea.Scrollbar orientation="horizontal" />
		<ScrollArea.Scrollbar orientation="vertical" />
		{#if label}
			<ScrollArea.Corner render={probe}>{label}</ScrollArea.Corner>
		{:else}
			<ScrollArea.Corner render={probe} />
		{/if}
	</ScrollArea.Root>
{:else if part === 'number-field-scrub-cursor'}
	<NumberField.Root>
		<NumberField.ScrubArea data-testid="scrub">
			{#if label}
				<NumberField.ScrubAreaCursor render={probe}>{label}</NumberField.ScrubAreaCursor>
			{:else}
				<NumberField.ScrubAreaCursor render={probe} />
			{/if}
		</NumberField.ScrubArea>
	</NumberField.Root>
{:else if part === 'button-anchor'}
	{#snippet anchor(props: object, _state: object, children: Snippet | undefined)}
		<!-- The pinned repro uses href="#". Children are the third argument, not a spread prop. -->
		<!-- svelte-ignore a11y_invalid_attribute -->
		<a
			{...props as HTMLAttributes<HTMLAnchorElement>}
			href="#"
			data-testid="host"
			data-kind={children ? 'snippet' : 'undefined'}
		>
			{@render children?.()}
		</a>
	{/snippet}
	<Button render={anchor} nativeButton={false}>Create project</Button>
{:else}
	<p>Unknown part {part}</p>
{/if}
