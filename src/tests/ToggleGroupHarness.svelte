<script lang="ts">
	import { Toggle, ToggleGroup, type ToggleGroupState } from '#lib';

	type Scenario =
		| 'exclusive'
		| 'initial'
		| 'omit'
		| 'warn'
		| 'controlled'
		| 'disabled-group'
		| 'disabled-item'
		| 'disabled-first'
		| 'disable-active'
		| 'multiple'
		| 'multiple-flip'
		| 'keys'
		| 'change'
		| 'cancel'
		| 'veto'
		| 'prevented'
		| 'render'
		| 'attach';

	let {
		scenario = 'exclusive',
		orientation = 'horizontal',
		dir = 'ltr',
		loopFocus = true
	}: {
		scenario?: Scenario;
		orientation?: ToggleGroupState['orientation'];
		dir?: 'ltr' | 'rtl';
		loopFocus?: boolean;
	} = $props();

	let value = $state<readonly string[] | undefined>(
		scenario === 'initial' || scenario === 'controlled' || scenario === 'warn'
			? ['two']
			: scenario === 'multiple-flip'
				? ['one']
				: undefined
	);
	let multiple = $state(scenario === 'multiple');
	let firstDisabled = $state(false);
	let calls = $state<{ value: string[]; reason: string; canceled: boolean }[]>([]);
	let attached = $state('none');

	function log(next: string[], canceled: boolean, reason: string) {
		calls = [...calls, { value: next, reason, canceled }];
	}

	function onValueChange(
		next: string[],
		details: { reason: string; cancel: () => void; isCanceled: boolean }
	) {
		if (scenario === 'cancel') details.cancel();
		log(next, details.isCanceled, details.reason);
		if (!details.isCanceled && scenario === 'multiple-flip') value = next;
	}

	function capture(node: HTMLElement) {
		attached = node.textContent ?? 'empty';
		return () => {
			attached = 'none';
		};
	}
</script>

<div {dir}>
	{#if scenario === 'controlled'}
		<button type="button" onclick={() => (value = ['one'])}>Set one</button>
	{/if}
	{#if scenario === 'multiple-flip'}
		<button type="button" onclick={() => (multiple = !multiple)}>Flip multiple</button>
	{/if}
	{#if scenario === 'disable-active'}
		<button type="button" onclick={() => (firstDisabled = true)}>Disable one</button>
	{/if}

	<ToggleGroup
		aria-label="Formatting"
		{orientation}
		{loopFocus}
		{multiple}
		disabled={scenario === 'disabled-group'}
		value={scenario === 'exclusive' ||
		scenario === 'omit' ||
		scenario === 'keys' ||
		scenario === 'change' ||
		scenario === 'cancel' ||
		scenario === 'veto' ||
		scenario === 'prevented' ||
		scenario === 'render' ||
		scenario === 'attach' ||
		scenario === 'disabled-group' ||
		scenario === 'disabled-item' ||
		scenario === 'disabled-first' ||
		scenario === 'disable-active'
			? undefined
			: value}
		onValueChange={scenario === 'change' || scenario === 'cancel' || scenario === 'multiple-flip'
			? onValueChange
			: undefined}
	>
		{#if scenario === 'omit'}
			<Toggle>One</Toggle>
			<Toggle value="">Two</Toggle>
		{:else if scenario === 'warn'}
			<Toggle>One</Toggle>
			<Toggle>Two</Toggle>
		{:else if scenario === 'disabled-item'}
			<Toggle value="one">One</Toggle>
			<Toggle value="two" disabled>Two</Toggle>
		{:else if scenario === 'disabled-first'}
			<Toggle value="one" disabled>One</Toggle>
			<Toggle value="two">Two</Toggle>
			<Toggle value="three">Three</Toggle>
		{:else if scenario === 'disable-active'}
			<Toggle value="one" disabled={firstDisabled}>One</Toggle>
			<Toggle value="two">Two</Toggle>
		{:else if scenario === 'render'}
			<Toggle value="one">
				{#snippet render(props, toggleState)}
					<button {...props} data-testid="custom" data-state={toggleState.pressed ? 'on' : 'off'}
						>One</button
					>
				{/snippet}
			</Toggle>
			<Toggle value="two">Two</Toggle>
		{:else if scenario === 'attach'}
			<Toggle value="one" {@attach capture}>One</Toggle>
		{:else if scenario === 'veto'}
			<Toggle value="one" onPressedChange={(_pressed, details) => details.cancel()}>One</Toggle>
			<Toggle value="two">Two</Toggle>
		{:else if scenario === 'prevented'}
			<Toggle value="one" onclick={(event) => event.preventDefault()}>One</Toggle>
			<Toggle value="two">Two</Toggle>
		{:else if scenario === 'keys'}
			<Toggle value="one">One</Toggle>
			<Toggle value="two">Two</Toggle>
			<Toggle value="three">Three</Toggle>
		{:else}
			<Toggle value="one">One</Toggle>
			<Toggle value="two">Two</Toggle>
		{/if}
	</ToggleGroup>
</div>

<output data-testid="calls">{JSON.stringify(calls)}</output>
<output data-testid="attached">{attached}</output>
<output data-testid="multiple">{multiple ? 'yes' : 'no'}</output>
