<!--
	Toolbar.Input and Toolbar.Separator inside a Toolbar.
	Derived from Base UI v1.9.0 packages/react/src/toolbar/input/ToolbarInput.test.tsx and
	packages/react/src/toolbar/separator/ToolbarSeparator.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { DirectionProvider, NumberField, Toolbar } from '#lib';
	import type { ToolbarOrientation } from '#lib/toolbar/types.js';

	let {
		scenario,
		orientation = 'horizontal',
		direction = 'ltr',
		separatorOrientation,
		disabled = false,
		type,
		onclick,
		onpointerdown,
		oninput
	}: {
		scenario: 'separator' | 'input' | 'input-after' | 'number';
		orientation?: ToolbarOrientation;
		direction?: 'ltr' | 'rtl';
		separatorOrientation?: ToolbarOrientation;
		disabled?: boolean;
		type?: string;
		onclick?: (event: MouseEvent) => void;
		onpointerdown?: (event: PointerEvent) => void;
		/** The number field's hidden input handler. */
		oninput?: (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => void;
	} = $props();
</script>

{#if scenario === 'separator'}
	<Toolbar.Root {orientation}>
		{#if separatorOrientation}
			<Toolbar.Separator orientation={separatorOrientation} />
		{:else}
			<Toolbar.Separator />
		{/if}
	</Toolbar.Root>
{:else if scenario === 'input'}
	<DirectionProvider {direction}>
		<Toolbar.Root {orientation}>
			<Toolbar.Button data-testid="button1" />
			<Toolbar.Input data-testid="input" {type} {disabled} {onclick} {onpointerdown} value="abcd" />
			<Toolbar.Button data-testid="button2" />
		</Toolbar.Root>
	</DirectionProvider>
{:else if scenario === 'input-after'}
	<div>
		<Toolbar.Root>
			<Toolbar.Button data-testid="button1" />
			<Toolbar.Input data-testid="input" {disabled} value="abcd" />
		</Toolbar.Root>
		<button type="button" data-testid="after">after</button>
	</div>
{:else}
	<Toolbar.Root>
		<NumberField.Root min={1} max={10} value={5} {oninput}>
			<NumberField.Group>
				<NumberField.Decrement />
				<Toolbar.Input {disabled}>
					{#snippet render(props)}
						<NumberField.Input {...props} />
					{/snippet}
				</Toolbar.Input>
				<NumberField.Increment />
			</NumberField.Group>
		</NumberField.Root>
	</Toolbar.Root>
{/if}
